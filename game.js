/**
 * Crane claw cabinet — original pacing & comedy grip. Homage to claw machines, not a clone.
 */

export const W = 480;
export const H = 640;

/** Playfield glass interior */
export const GLASS = { x: 36, y: 72, w: 408, h: 430 };
export const FLOOR_Y = GLASS.y + GLASS.h - 28;
export const RAIL_Y = GLASS.y + 18;
export const CLAW_MIN_X = GLASS.x + 42;
export const CLAW_MAX_X = GLASS.x + GLASS.w - 42;
export const CHUTE_X = GLASS.x + 28;

const START_CREDITS = 5;
const COIN_PACK = 3;
const DROP_SPEED = 220; // px/s
const LIFT_SPEED = 190;
const MOVE_SPEED = 160; // px/s while holding
const JAW_OPEN = 28;
const JAW_CLOSE = 10;

/**
 * @typedef {{
 *   id: number,
 *   x: number,
 *   y: number,
 *   r: number,
 *   variant: number,
 *   wobble: number,
 *   grabbed: boolean,
 * }} Plush
 */

/**
 * @typedef {'ready'|'aiming'|'dropping'|'clamping'|'lifting'|'deliver'|'miss'|'empty'} Phase
 */

export class ClawgrabGame {
  constructor() {
    this.resetAll();
  }

  resetAll() {
    this.credits = START_CREDITS;
    this.score = 0;
    this.prizes = 0;
    this.attempts = 0;
    this.nearMisses = 0;
    /** @type {Phase} */
    this.phase = "ready";
    this.clawX = (CLAW_MIN_X + CLAW_MAX_X) / 2;
    this.clawY = RAIL_Y + 36;
    this.jaw = JAW_OPEN;
    this.moveDir = 0; // -1 | 0 | 1
    /** @type {Plush[]} */
    this.plushies = [];
    /** @type {Plush | null} */
    this.held = null;
    this.phaseAt = 0;
    this.targetY = FLOOR_Y - 40;
    this._nextId = 1;
    this.flashMsg = "";
    this.flashTone = "";
    this.seedPlushies();
  }

  seedPlushies() {
    this.plushies = [];
    const layouts = [
      { x: 0.22, y: 0.78, r: 28, v: 0 },
      { x: 0.48, y: 0.72, r: 32, v: 1 },
      { x: 0.74, y: 0.8, r: 26, v: 2 },
      { x: 0.34, y: 0.88, r: 24, v: 3 },
      { x: 0.62, y: 0.86, r: 30, v: 4 },
      { x: 0.5, y: 0.92, r: 22, v: 5 },
    ];
    for (const L of layouts) {
      this.plushies.push({
        id: this._nextId++,
        x: GLASS.x + L.x * GLASS.w,
        y: GLASS.y + L.y * GLASS.h,
        r: L.r,
        variant: L.v,
        wobble: Math.random() * Math.PI * 2,
        grabbed: false,
      });
    }
  }

  /** Refill a few dolls if the pit looks empty */
  restockIfNeeded() {
    const live = this.plushies.filter((p) => !p.grabbed);
    if (live.length >= 4) return;
    const need = 4 - live.length;
    for (let i = 0; i < need; i++) {
      const x =
        GLASS.x + 50 + Math.random() * (GLASS.w - 100);
      const y = FLOOR_Y - 20 - Math.random() * 50;
      this.plushies.push({
        id: this._nextId++,
        x,
        y,
        r: 22 + Math.floor(Math.random() * 12),
        variant: Math.floor(Math.random() * 6),
        wobble: Math.random() * Math.PI * 2,
        grabbed: false,
      });
    }
  }

  addCoins(n = COIN_PACK) {
    this.credits += n;
    return n;
  }

  get canAim() {
    return this.phase === "aiming" || this.phase === "ready";
  }

  get busy() {
    return (
      this.phase === "dropping" ||
      this.phase === "clamping" ||
      this.phase === "lifting" ||
      this.phase === "deliver" ||
      this.phase === "miss"
    );
  }

  /**
   * Start a play (spend 1 credit) or resume aiming if already paid.
   * @returns {{ ok: boolean, events: string[], reason?: string }}
   */
  startPlay() {
    /** @type {string[]} */
    const events = [];
    if (this.busy) return { ok: false, events, reason: "busy" };
    if (this.phase === "aiming") return { ok: true, events };
    if (this.credits <= 0) {
      this.phase = "empty";
      return { ok: false, events: ["empty"], reason: "empty" };
    }
    this.credits -= 1;
    this.attempts += 1;
    this.phase = "aiming";
    this.clawY = RAIL_Y + 36;
    this.jaw = JAW_OPEN;
    this.held = null;
    this.restockIfNeeded();
    events.push("start");
    return { ok: true, events };
  }

  setMoveDir(dir) {
    if (!this.canAim || this.phase === "ready") {
      this.moveDir = 0;
      return;
    }
    this.moveDir = Math.sign(dir);
  }

  setClawX(x) {
    if (!this.canAim || this.phase === "ready") return;
    this.clawX = Math.max(CLAW_MIN_X, Math.min(CLAW_MAX_X, x));
  }

  /**
   * @returns {{ ok: boolean, events: string[], reason?: string }}
   */
  drop() {
    /** @type {string[]} */
    const events = [];
    if (this.phase === "ready") {
      const s = this.startPlay();
      if (!s.ok) return s;
      events.push(...s.events);
    }
    if (this.phase !== "aiming") {
      return { ok: false, events, reason: "not_aiming" };
    }
    this.phase = "dropping";
    this.phaseAt = performance.now();
    this.moveDir = 0;
    // Aim a bit above the tallest plush under claw, or floor
    const under = this.plushNearClaw(48);
    this.targetY = under
      ? under.y - under.r - 8
      : FLOOR_Y - 36;
    events.push("drop");
    return { ok: true, events };
  }

  /**
   * @param {number} [maxDist]
   * @returns {Plush | null}
   */
  plushNearClaw(maxDist = 40) {
    let best = null;
    let bestD = Infinity;
    for (const p of this.plushies) {
      if (p.grabbed) continue;
      const dx = Math.abs(p.x - this.clawX);
      const dy = Math.abs(p.y - this.clawY);
      if (dx > maxDist) continue;
      const d = dx + dy * 0.15;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  }

  /**
   * Comedy grip: skill (alignment) + luck. Near-misses common, not impossible.
   * @param {Plush} p
   */
  rollGrab(p) {
    const align = Math.abs(p.x - this.clawX);
    const reach = Math.max(0, 1 - align / (p.r + 18));
    // Base success: ~18% at edge, ~52% dead-center; then comedy slip layer
    let chance = 0.12 + reach * 0.4;
    // Slight size bias — bigger dolls are harder (classic claw comedy)
    chance -= Math.max(0, (p.r - 24) / 80);
    chance = Math.max(0.08, Math.min(0.62, chance));
    const roll = Math.random();
    if (roll < chance) return "win";
    if (reach > 0.55 && roll < chance + 0.28) return "near"; // almost!
    if (reach > 0.2) return "slip";
    return "miss";
  }

  /**
   * @param {number} now
   * @param {number} dt seconds
   * @returns {{ events: string[] }}
   */
  update(now, dt) {
    /** @type {string[]} */
    const events = [];

    // Idle wobble
    for (const p of this.plushies) {
      if (!p.grabbed) p.wobble += dt * 1.6;
    }

    if (this.phase === "aiming" && this.moveDir) {
      const prev = this.clawX;
      this.clawX += this.moveDir * MOVE_SPEED * dt;
      this.clawX = Math.max(CLAW_MIN_X, Math.min(CLAW_MAX_X, this.clawX));
      if (Math.abs(this.clawX - prev) > 0.5 && Math.random() < 0.08) {
        events.push("move");
      }
    }

    if (this.phase === "dropping") {
      this.clawY += DROP_SPEED * dt;
      if (this.clawY >= this.targetY) {
        this.clawY = this.targetY;
        this.phase = "clamping";
        this.phaseAt = now;
        events.push("clamp");
      }
    } else if (this.phase === "clamping") {
      const t = Math.min(1, (now - this.phaseAt) / 320);
      this.jaw = JAW_OPEN + (JAW_CLOSE - JAW_OPEN) * t;
      if (t >= 1) {
        const target = this.plushNearClaw(36);
        if (!target) {
          this.phase = "miss";
          this.phaseAt = now;
          this.flashMsg = "空氣夾！再瞄準一點";
          this.flashTone = "lose";
          events.push("miss");
        } else {
          const result = this.rollGrab(target);
          if (result === "win") {
            this.held = target;
            target.grabbed = true;
            this.phase = "lifting";
            this.phaseAt = now;
            this.flashMsg = "夾到了！";
            this.flashTone = "win";
            events.push("grab");
          } else if (result === "near") {
            this.nearMisses += 1;
            this.phase = "miss";
            this.phaseAt = now;
            this.flashMsg = "差一點！絨毛滑掉了…";
            this.flashTone = "warn";
            events.push("near");
          } else {
            this.nearMisses += 1;
            this.phase = "miss";
            this.phaseAt = now;
            this.flashMsg =
              result === "slip" ? "爪子鬆了，好險沒夾穩" : "偏了…再來一次";
            this.flashTone = "lose";
            events.push(result === "slip" ? "slip" : "miss");
          }
        }
      }
    } else if (this.phase === "lifting") {
      this.clawY -= LIFT_SPEED * dt;
      if (this.held) {
        this.held.x = this.clawX;
        this.held.y = this.clawY + 28;
      }
      if (this.clawY <= RAIL_Y + 36) {
        this.clawY = RAIL_Y + 36;
        this.phase = "deliver";
        this.phaseAt = now;
      }
    } else if (this.phase === "deliver") {
      // Slide toward prize chute
      const dest = CHUTE_X + 24;
      this.clawX += (dest - this.clawX) * Math.min(1, dt * 3.2);
      if (this.held) {
        this.held.x = this.clawX;
        this.held.y = this.clawY + 28;
      }
      if (Math.abs(this.clawX - dest) < 4) {
        const pts = 50 + (this.held ? this.held.variant * 5 : 0);
        this.score += pts;
        this.prizes += 1;
        if (this.held) {
          this.plushies = this.plushies.filter((p) => p.id !== this.held.id);
        }
        this.held = null;
        this.jaw = JAW_OPEN;
        this.phase = "ready";
        this.clawX = (CLAW_MIN_X + CLAW_MAX_X) / 2;
        this.flashMsg = `出貨！+${pts} · 收藏 ${this.prizes}`;
        this.flashTone = "win";
        events.push("win");
        this.restockIfNeeded();
      }
    } else if (this.phase === "miss") {
      // Open jaw & retract
      this.jaw = Math.min(JAW_OPEN, this.jaw + 60 * dt);
      this.clawY -= LIFT_SPEED * dt;
      if (this.clawY <= RAIL_Y + 36) {
        this.clawY = RAIL_Y + 36;
        this.jaw = JAW_OPEN;
        this.phase = "ready";
        events.push("idle");
      }
    }

    return { events };
  }
}

export { COIN_PACK, START_CREDITS, JAW_OPEN, JAW_CLOSE };
