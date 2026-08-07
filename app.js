import { ClawgrabAudio } from "./audio.js";
import {
  ClawgrabGame,
  W,
  H,
  CLAW_MIN_X,
  CLAW_MAX_X,
  COIN_PACK,
  FLOOR_Y,
} from "./game.js";
import {
  drawCabinet,
  drawClaw,
  drawPlush,
  drawBanner,
  drawWinBurst,
} from "./sprites.js";

const audio = new ClawgrabAudio();
const game = new ClawgrabGame();
globalThis.__clawgrab = game;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const creditsEl = document.getElementById("credits");
const scoreEl = document.getElementById("score");
const prizesEl = document.getElementById("prizes");
const statusEl = document.getElementById("status");
const btnStart = document.getElementById("btn-start");
const btnCoin = document.getElementById("btn-coin");
const btnMute = document.getElementById("btn-mute");
const btnReset = document.getElementById("btn-reset");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnDrop = document.getElementById("btn-drop");

canvas.width = W;
canvas.height = H;

/** @type {{ x: number, y: number, t: number }[]} */
const bursts = [];
let lastTs = 0;
let running = true;
let dragging = false;
let lastMoveSound = 0;

function setStatus(msg, tone = "") {
  statusEl.textContent = msg;
  statusEl.dataset.tone = tone;
}

function syncHud() {
  creditsEl.textContent = String(game.credits);
  scoreEl.textContent = String(game.score);
  prizesEl.textContent = String(game.prizes);

  const aiming = game.phase === "aiming";
  const ready = game.phase === "ready" || game.phase === "empty";
  btnStart.textContent = aiming ? "瞄準中" : game.credits > 0 ? "開台" : "代幣不足";
  btnStart.disabled = aiming || game.busy || game.credits <= 0;
  btnDrop.disabled = game.busy;
  btnLeft.disabled = !aiming;
  btnRight.disabled = !aiming;

  if (ready && game.credits <= 0) {
    btnStart.disabled = true;
  }
}

function handleEvents(events) {
  for (const e of events) {
    if (e === "start") {
      audio.startBeep();
      setStatus("左右對準，再按下爪", "");
    } else if (e === "move") audio.move();
    else if (e === "drop") {
      audio.drop();
      setStatus("下爪中…", "");
    } else if (e === "clamp") audio.clamp();
    else if (e === "grab") {
      setStatus(game.flashMsg || "夾到了！", "win");
    } else if (e === "near") {
      audio.slip();
      setStatus(game.flashMsg || "差一點！", "warn");
    } else if (e === "slip") {
      audio.slip();
      setStatus(game.flashMsg || "滑掉了", "lose");
    } else if (e === "miss") {
      audio.miss();
      setStatus(game.flashMsg || "沒夾到", "lose");
    } else if (e === "win") {
      audio.win();
      bursts.push({ x: game.clawX, y: game.clawY + 40, t: performance.now() });
      setStatus(game.flashMsg || "出貨！", "win");
    } else if (e === "empty") {
      audio.empty();
      setStatus("代幣用完了 · 點「投幣」再玩", "warn");
    } else if (e === "idle") {
      if (game.credits > 0) {
        setStatus("再來一爪？點開台或下爪", "");
      } else {
        setStatus("代幣用完了 · 點「投幣」再玩", "warn");
      }
    }
  }
}

function draw() {
  const now = performance.now();
  drawCabinet(ctx, W, H);

  // Painter: back plushies first by y
  const sorted = [...game.plushies].sort((a, b) => a.y - b.y);
  for (const p of sorted) {
    if (p.grabbed && game.held && p.id === game.held.id) continue;
    const mood =
      game.phase === "miss" &&
      Math.abs(p.x - game.clawX) < p.r + 20 &&
      Math.abs(p.y - game.clawY) < p.r + 40
        ? "slip"
        : "idle";
    drawPlush(ctx, p, now, mood);
  }

  if (game.held) {
    drawPlush(ctx, game.held, now, "held");
  }

  drawClaw(ctx, game.clawX, game.clawY, game.jaw, game.busy);

  // Aim guide while aiming
  if (game.phase === "aiming") {
    ctx.strokeStyle = "rgba(244,63,94,0.35)";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(game.clawX, game.clawY + 36);
    ctx.lineTo(game.clawX, FLOOR_Y - 8);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i];
    const age = (now - b.t) / 520;
    if (age >= 1) bursts.splice(i, 1);
    else drawWinBurst(ctx, b.x, b.y, age);
  }

  if (game.phase === "ready" && game.attempts === 0) {
    drawBanner(ctx, "投幣開台 · 對準再下爪", W, H);
  } else if (game.phase === "empty" || (game.phase === "ready" && game.credits <= 0)) {
    drawBanner(ctx, "代幣不足 · 點投幣", W, H);
  }
}

function frame(ts) {
  if (!running) return;
  const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
  lastTs = ts;
  const { events } = game.update(ts, dt);
  if (events.length) handleEvents(events);
  draw();
  syncHud();
  requestAnimationFrame(frame);
}

async function tryStart() {
  await audio.unlock();
  const { ok, events, reason } = game.startPlay();
  handleEvents(events);
  if (!ok && reason === "empty") {
    setStatus("代幣不足 · 點「投幣 +3」", "warn");
  } else if (ok) {
    setStatus("左右對準，再按下爪");
  }
  syncHud();
}

async function tryDrop() {
  await audio.unlock();
  const { ok, events, reason } = game.drop();
  handleEvents(events);
  if (!ok && reason === "empty") {
    setStatus("代幣不足 · 點「投幣 +3」", "warn");
  }
  syncHud();
}

function canvasToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * W,
    y: ((clientY - rect.top) / rect.height) * H,
  };
}

btnStart.addEventListener("click", () => {
  void tryStart();
});

btnCoin.addEventListener("click", async () => {
  await audio.unlock();
  const n = game.addCoins(COIN_PACK);
  audio.coin();
  if (game.phase === "empty") game.phase = "ready";
  setStatus(`投入 ${n} 枚代幣 · 餘 ${game.credits}`, "win");
  syncHud();
});

btnReset.addEventListener("click", async () => {
  await audio.unlock();
  game.resetAll();
  bursts.length = 0;
  setStatus("已重來 · 投幣開台");
  syncHud();
});

btnMute.addEventListener("click", async () => {
  await audio.unlock();
  audio.setEnabled(!audio.enabled);
  btnMute.textContent = audio.enabled ? "音效開" : "音效關";
  btnMute.setAttribute("aria-pressed", audio.enabled ? "true" : "false");
});

btnDrop.addEventListener("click", () => {
  void tryDrop();
});

function bindHold(btn, dir) {
  const go = async (e) => {
    e.preventDefault();
    await audio.unlock();
    if (game.phase === "ready" && game.credits > 0) {
      game.startPlay();
      audio.startBeep();
      setStatus("左右對準，再按下爪");
    }
    game.setMoveDir(dir);
    syncHud();
  };
  const stop = () => game.setMoveDir(0);
  btn.addEventListener("pointerdown", go);
  btn.addEventListener("pointerup", stop);
  btn.addEventListener("pointerleave", stop);
  btn.addEventListener("pointercancel", stop);
}

bindHold(btnLeft, -1);
bindHold(btnRight, 1);

canvas.addEventListener("pointerdown", async (e) => {
  await audio.unlock();
  if (game.phase === "ready" && game.credits > 0) {
    const { ok, events } = game.startPlay();
    handleEvents(events);
    if (!ok) return;
  }
  if (game.phase !== "aiming") return;
  dragging = true;
  canvas.setPointerCapture(e.pointerId);
  const { x } = canvasToWorld(e.clientX, e.clientY);
  game.setClawX(Math.max(CLAW_MIN_X, Math.min(CLAW_MAX_X, x)));
});

canvas.addEventListener("pointermove", (e) => {
  if (!dragging || game.phase !== "aiming") return;
  const { x } = canvasToWorld(e.clientX, e.clientY);
  const prev = game.clawX;
  game.setClawX(x);
  const now = performance.now();
  if (Math.abs(game.clawX - prev) > 2 && now - lastMoveSound > 90) {
    audio.move();
    lastMoveSound = now;
  }
});

canvas.addEventListener("pointerup", () => {
  dragging = false;
});
canvas.addEventListener("pointercancel", () => {
  dragging = false;
});

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    e.preventDefault();
    if (game.phase === "ready" && game.credits > 0) void tryStart();
    game.setMoveDir(-1);
  } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    e.preventDefault();
    if (game.phase === "ready" && game.credits > 0) void tryStart();
    game.setMoveDir(1);
  } else if (e.key === " " || e.key === "Enter" || e.key === "ArrowDown") {
    e.preventDefault();
    void tryDrop();
  }
});

window.addEventListener("keyup", (e) => {
  if (
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "a" ||
    e.key === "A" ||
    e.key === "d" ||
    e.key === "D"
  ) {
    game.setMoveDir(0);
  }
});

document.body.addEventListener(
  "pointerdown",
  () => {
    void audio.unlock();
  },
  { once: true },
);

setStatus("投幣開台，對準再下爪");
syncHud();
requestAnimationFrame((ts) => {
  lastTs = ts;
  requestAnimationFrame(frame);
});
