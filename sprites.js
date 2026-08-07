/**
 * Cabinet, claw & plush sprites — original cast for 夾娃娃.
 */

import { GLASS, RAIL_Y, FLOOR_Y, CHUTE_X } from "./game.js";

const PLUS_PALETTES = [
  { body: ["#fda4af", "#fb7185", "#e11d48"], ear: "#fecdd3", blush: "#fb7185" },
  { body: ["#93c5fd", "#3b82f6", "#1d4ed8"], ear: "#bfdbfe", blush: "#f9a8d4" },
  { body: ["#fde68a", "#f59e0b", "#b45309"], ear: "#fef3c7", blush: "#fb7185" },
  { body: ["#c4b5fd", "#8b5cf6", "#6d28d9"], ear: "#ede9fe", blush: "#f9a8d4" },
  { body: ["#86efac", "#22c55e", "#15803d"], ear: "#dcfce7", blush: "#fda4af" },
  { body: ["#fdba74", "#ea580c", "#9a3412"], ear: "#ffedd5", blush: "#f472b6" },
];

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 */
export function drawCabinet(ctx, W, H) {
  // Outer shell
  const shell = ctx.createLinearGradient(0, 0, 0, H);
  shell.addColorStop(0, "#fce7f3");
  shell.addColorStop(0.4, "#fbcfe8");
  shell.addColorStop(0.75, "#e9d5ff");
  shell.addColorStop(1, "#ddd6fe");
  ctx.fillStyle = shell;
  ctx.fillRect(0, 0, W, H);

  // Marquee
  roundRect(ctx, 28, 14, W - 56, 46, 12);
  ctx.fillStyle = "#9d174d";
  ctx.fill();
  const marq = ctx.createLinearGradient(28, 14, W - 28, 60);
  marq.addColorStop(0, "#db2777");
  marq.addColorStop(0.5, "#c026d3");
  marq.addColorStop(1, "#7c3aed");
  ctx.fillStyle = marq;
  roundRect(ctx, 32, 18, W - 64, 38, 10);
  ctx.fill();

  ctx.fillStyle = "#fef3c7";
  ctx.font = "700 18px system-ui, 'Songti TC', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("☆ 夾娃娃機 ☆", W / 2, 38);

  // Side pillars
  ctx.fillStyle = "#be185d";
  roundRect(ctx, 12, 68, 22, GLASS.h + 20, 6);
  ctx.fill();
  roundRect(ctx, W - 34, 68, 22, GLASS.h + 20, 6);
  ctx.fill();

  // Glass interior
  const glass = ctx.createLinearGradient(0, GLASS.y, 0, GLASS.y + GLASS.h);
  glass.addColorStop(0, "#e0f2fe");
  glass.addColorStop(0.55, "#fce7f3");
  glass.addColorStop(1, "#fef9c3");
  ctx.fillStyle = glass;
  roundRect(ctx, GLASS.x, GLASS.y, GLASS.w, GLASS.h, 10);
  ctx.fill();

  // Soft glass shine
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.moveTo(GLASS.x + 12, GLASS.y + 10);
  ctx.lineTo(GLASS.x + 70, GLASS.y + 10);
  ctx.lineTo(GLASS.x + 40, GLASS.y + GLASS.h - 20);
  ctx.lineTo(GLASS.x + 12, GLASS.y + GLASS.h - 40);
  ctx.closePath();
  ctx.fill();

  // Floor bed
  ctx.fillStyle = "rgba(190,24,93,0.18)";
  roundRect(ctx, GLASS.x + 8, FLOOR_Y - 8, GLASS.w - 16, 28, 8);
  ctx.fill();

  // Prize chute
  ctx.fillStyle = "#44403c";
  roundRect(ctx, CHUTE_X, FLOOR_Y - 4, 52, 22, 4);
  ctx.fill();
  ctx.fillStyle = "#1c1917";
  roundRect(ctx, CHUTE_X + 6, FLOOR_Y, 40, 14, 3);
  ctx.fill();
  ctx.fillStyle = "#fbbf24";
  ctx.font = "700 10px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("出口", CHUTE_X + 26, FLOOR_Y + 10);

  // Rail
  ctx.strokeStyle = "rgba(68,64,60,0.55)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(GLASS.x + 16, RAIL_Y);
  ctx.lineTo(GLASS.x + GLASS.w - 16, RAIL_Y);
  ctx.stroke();

  // Bottom panel / coin box
  ctx.fillStyle = "#831843";
  roundRect(ctx, 28, GLASS.y + GLASS.h + 18, W - 56, 90, 12);
  ctx.fill();
  ctx.fillStyle = "rgba(253,224,71,0.2)";
  roundRect(ctx, 48, GLASS.y + GLASS.h + 34, W - 96, 56, 10);
  ctx.fill();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y tip/body center-ish
 * @param {number} jaw half-gap
 * @param {boolean} [busy]
 */
export function drawClaw(ctx, x, y, jaw, busy = false) {
  // Cable
  ctx.strokeStyle = "#57534e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, RAIL_Y);
  ctx.lineTo(x, y - 18);
  ctx.stroke();

  // Carriage
  ctx.fillStyle = "#a8a29e";
  roundRect(ctx, x - 16, RAIL_Y - 8, 32, 14, 4);
  ctx.fill();
  ctx.fillStyle = busy ? "#f472b6" : "#fbbf24";
  ctx.beginPath();
  ctx.arc(x, RAIL_Y - 1, 4, 0, Math.PI * 2);
  ctx.fill();

  // Claw body
  ctx.fillStyle = "#d6d3d1";
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 2;
  roundRect(ctx, x - 14, y - 20, 28, 22, 5);
  ctx.fill();
  ctx.stroke();

  // Arms
  ctx.lineCap = "round";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#78716c";
  for (const side of [-1, 1]) {
    const tipX = x + side * jaw;
    ctx.beginPath();
    ctx.moveTo(x + side * 8, y);
    ctx.quadraticCurveTo(x + side * (jaw + 6), y + 18, tipX, y + 34);
    ctx.stroke();
    // Tip pad
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(tipX, y + 34, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, r: number, variant: number, wobble: number }} p
 * @param {number} t
 * @param {'idle'|'held'|'slip'} [mood]
 */
export function drawPlush(ctx, p, t, mood = "idle") {
  const pal = PLUS_PALETTES[p.variant % PLUS_PALETTES.length];
  const bounce =
    mood === "held"
      ? Math.sin(t / 90) * 2
      : Math.sin(p.wobble) * 2.2;
  const squash = mood === "slip" ? 0.85 : 1;

  ctx.save();
  ctx.translate(p.x, p.y + bounce);
  ctx.scale(squash, 2 - squash);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, p.r * 0.85, p.r * 0.7, p.r * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  const g = ctx.createRadialGradient(-p.r * 0.25, -p.r * 0.3, 4, 0, 0, p.r);
  g.addColorStop(0, pal.body[0]);
  g.addColorStop(0.55, pal.body[1]);
  g.addColorStop(1, pal.body[2]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.r * 0.92, p.r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Ears
  for (const side of [-1, 1]) {
    ctx.fillStyle = pal.body[1];
    ctx.beginPath();
    ctx.ellipse(side * p.r * 0.62, -p.r * 0.7, p.r * 0.28, p.r * 0.36, side * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.ear;
    ctx.beginPath();
    ctx.ellipse(side * p.r * 0.62, -p.r * 0.7, p.r * 0.14, p.r * 0.18, side * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Face
  const eyeY = -p.r * 0.12;
  if (mood === "slip") {
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(side * p.r * 0.28, eyeY, p.r * 0.12, 0.15, Math.PI - 0.15);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(-p.r * 0.28, eyeY, p.r * 0.16, p.r * 0.18, 0, 0, Math.PI * 2);
    ctx.ellipse(p.r * 0.28, eyeY, p.r * 0.16, p.r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    const look = Math.sin(t / 400 + p.wobble) * p.r * 0.04;
    ctx.beginPath();
    ctx.ellipse(-p.r * 0.28 + look, eyeY + 1, p.r * 0.07, p.r * 0.1, 0, 0, Math.PI * 2);
    ctx.ellipse(p.r * 0.28 + look, eyeY + 1, p.r * 0.07, p.r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Blush + nose
  ctx.fillStyle = pal.blush;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.ellipse(-p.r * 0.48, p.r * 0.08, p.r * 0.12, p.r * 0.08, 0, 0, Math.PI * 2);
  ctx.ellipse(p.r * 0.48, p.r * 0.08, p.r * 0.12, p.r * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#fb7185";
  ctx.beginPath();
  ctx.ellipse(0, p.r * 0.08, p.r * 0.1, p.r * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = "#7c2d12";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  if (mood === "held") {
    ctx.arc(0, p.r * 0.22, p.r * 0.2, 0.15, Math.PI - 0.15);
  } else if (mood === "slip") {
    ctx.arc(0, p.r * 0.32, p.r * 0.14, 0.2, Math.PI - 0.2, true);
  } else {
    ctx.arc(0, p.r * 0.2, p.r * 0.16, 0.2, Math.PI - 0.2);
  }
  ctx.stroke();

  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} msg
 * @param {number} W
 * @param {number} H
 */
export function drawBanner(ctx, msg, W, H) {
  ctx.fillStyle = "rgba(76,5,25,0.58)";
  roundRect(ctx, 48, H / 2 - 30, W - 96, 60, 12);
  ctx.fill();
  ctx.fillStyle = "#fce7f3";
  ctx.font = "700 17px system-ui, 'PingFang TC', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(msg, W / 2, H / 2);
}

/**
 * Soft sparkles on win
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} age 0..1
 */
export function drawWinBurst(ctx, x, y, age) {
  if (age >= 1) return;
  const a = 1 - age;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = "#fbbf24";
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + age * 2;
    const r = 12 + age * 36;
    ctx.beginPath();
    ctx.arc(x + Math.cos(ang) * r, y + Math.sin(ang) * r, 3 * a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
