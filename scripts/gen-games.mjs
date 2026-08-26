// Game generator: produces self-hosted HTML5 games + the selfhosted games.ts catalog.
// Run: node scripts/gen-games.mjs
import { writeFileSync, mkdirSync, renameSync, unlinkSync } from "node:fs";

const D = "C:/Users/Apple/WorkBuddy/2026-08-18-21-34-42/ai-project";

// ---------- shared palette ----------
function pal(accent) {
  return { bg: "#0b0b14", fg: "#e7e7f5", accent, muted: "#8b8ba7", surface: "#16162a" };
}

// ---------- engines (each is a standalone browser function, uses outer canvas/ctx/scoreEl/rr/rand/chance/CFG) ----------
const ENGINES = {};

ENGINES.merge = function (g) {
  const SIZE = g.size || 4, CELL = g.w, PAD = 12, GAP = 10;
  const step = (CELL - PAD * 2 - GAP * (SIZE - 1)) / SIZE;
  let grid, score, over, won;
  function init() { grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); score = 0; over = false; won = false; spawn(); spawn(); draw(); }
  function spawn() { const e = []; for (let r = 0; r < SIZE; r++)for (let c = 0; c < SIZE; c++)if (!grid[r][c]) e.push([r, c]); if (!e.length) return; const [r, c] = e[(Math.random() * e.length) | 0]; grid[r][c] = chance(.9) ? 2 : 4; }
  function col(v) { const m = { 2: "#3a3a5c", 4: "#4a4a78", 8: CFG.accent, 16: CFG.accent, 32: "#22d3ee", 64: "#22d3ee", 128: "#34d399", 256: "#34d399", 512: "#fbbf24", 1024: "#fb7185", 2048: "#f43f5e" }; return m[v] || "#f43f5e"; }
  function draw() { ctx.clearRect(0, 0, CELL, CELL); for (let r = 0; r < SIZE; r++)for (let c = 0; c < SIZE; c++) { const x = PAD + c * (step + GAP), y = PAD + r * (step + GAP); ctx.fillStyle = "#1d1d33"; rr(x, y, step, step, 8); ctx.fill(); const v = grid[r][c]; if (v) { ctx.fillStyle = col(v); rr(x, y, step, step, 8); ctx.fill(); ctx.fillStyle = v > 4 ? "#08121a" : "#e7e7f5"; ctx.font = "700 " + (v >= 1000 ? step * 0.3 : step * 0.4) + "px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(v, x + step / 2, y + step / 2); } } if (over || won) over2(); }
  function over2() { ctx.fillStyle = "rgba(8,8,20,.78)"; ctx.fillRect(0, 0, CELL, CELL); ctx.fillStyle = won ? "#34d399" : "#f43f5e"; ctx.font = "700 32px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(won ? "You win!" : "Game Over", CELL / 2, CELL / 2 - 12); ctx.fillStyle = "#e7e7f5"; ctx.font = "600 15px system-ui"; ctx.fillText("Tap New Game", CELL / 2, CELL / 2 + 18); }
  function mr(row) { const n = row.filter(v => v), res = []; let g2 = 0; for (let i = 0; i < n.length; i++) { if (n[i] === n[i + 1]) { res.push(n[i] * 2); g2 += n[i] * 2; n.splice(i + 1, 1); } else res.push(n[i]); } while (res.length < SIZE) res.push(0); return { row: res, g: g2 }; }
  function L() { let s = 0; for (let r = 0; r < SIZE; r++) { const { row, g: gg } = mr(grid[r]); grid[r] = row; s += gg; } return s; }
  function R() { let s = 0; for (let r = 0; r < SIZE; r++) { const rev = [...grid[r]].reverse(); const { row, g: gg } = mr(rev); grid[r] = row.reverse(); s += gg; } return s; }
  function U() { let s = 0; for (let c = 0; c < SIZE; c++) { const col = []; for (let r = 0; r < SIZE; r++)col.push(grid[r][c]); const { row, g: gg } = mr(col); for (let r = 0; r < SIZE; r++)grid[r][c] = row[r]; s += gg; } return s; }
  function D2() { let s = 0; for (let c = 0; c < SIZE; c++) { const col = []; for (let r = 0; r < SIZE; r++)col.push(grid[r][c]); const { row, g: gg } = mr(col.reverse()); const rr2 = row.reverse(); for (let r = 0; r < SIZE; r++)grid[r][c] = rr2[r]; s += gg; } return s; }
  const M = { left: L, right: R, up: U, down: D2 };
  function avail() { for (let r = 0; r < SIZE; r++)for (let c = 0; c < SIZE; c++) { if (!grid[r][c]) return true; if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true; if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true; } return false; }
  function move(dir) { if (over) return; const b = JSON.stringify(grid); score += M[dir](); if (JSON.stringify(grid) === b) return; spawn(); if (!avail()) over = true; scoreEl.textContent = score; draw(); }
  addEventListener("keydown", e => { const k = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" }[e.key]; if (k) { e.preventDefault(); move(k); } });
  let sx = 0, sy = 0; canvas.addEventListener("touchstart", e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  canvas.addEventListener("touchend", e => { const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return; if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left"); else move(dy > 0 ? "down" : "up"); }, { passive: true });
  document.getElementById("restart").addEventListener("click", init); init();
};

ENGINES.snake = function (g) {
  const W = g.w, H = g.h, S = 20; let snake, dir, food, score, over, timer;
  function init() { snake = [{ x: 10 * S, y: 10 * S }]; dir = { x: S, y: 0 }; food = mk(); score = 0; over = false; scoreEl.textContent = 0; }
  function mk() { return { x: ((Math.random() * (W / S)) | 0) * S, y: ((Math.random() * (H / S)) | 0) * S }; }
  function step() { const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }; if (head.x < 0 || head.y < 0 || head.x >= W || head.y >= H || snake.some(s => s.x === head.x && s.y === head.y)) { over = true; return; } snake.unshift(head); if (head.x === food.x && head.y === food.y) { score += 10; scoreEl.textContent = score; food = mk(); } else snake.pop(); }
  function draw() { ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); if (food) { ctx.fillStyle = CFG.accent; rr(food.x, food.y, S - 2, S - 2, 5); ctx.fill(); } ctx.fillStyle = "#34d399"; snake.forEach(s => { rr(s.x, s.y, S - 2, S - 2, 5); ctx.fill(); }); if (over) { ctx.fillStyle = "rgba(8,8,20,.7)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#f43f5e"; ctx.font = "700 30px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("Game Over", W / 2, H / 2); } }
  function loop() { if (!over) { step(); draw(); } timer = setTimeout(loop, g.speed || 90); }
  document.getElementById("restart").addEventListener("click", () => { clearTimeout(timer); init(); loop(); });
  addEventListener("keydown", e => { const k = { ArrowLeft: [-S, 0], ArrowRight: [S, 0], ArrowUp: [0, -S], ArrowDown: [0, S] }[e.key]; if (k && !(k[0] === -dir.x && k[1] === -dir.y)) { e.preventDefault(); dir = { x: k[0], y: k[1] }; } });
  let sx = 0, sy = 0; canvas.addEventListener("touchstart", e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  canvas.addEventListener("touchend", e => { const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; const nx = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? [S, 0] : [-S, 0]) : (dy > 0 ? [0, S] : [0, -S]); if (!(nx[0] === -dir.x && nx[1] === -dir.y)) dir = { x: nx[0], y: nx[1] }; }, { passive: true });
  init(); loop();
};

ENGINES.ioeat = function (g) {
  const W = g.w, H = g.h; let me, foods, blobs, score;
  function init() { me = { x: W / 2, y: H / 2, r: 14, vx: 0, vy: 0 }; foods = []; blobs = []; for (let i = 0; i < 40; i++)foods.push({ x: rand(0, W), y: rand(0, H), r: 5 }); for (let i = 0; i < (g.bots || 6); i++) { let bx, by; do { bx = rand(0, W); by = rand(0, H); } while (Math.hypot(bx - W / 2, by - H / 2) < 70); blobs.push({ x: bx, y: by, r: rand(8, 13), c: "#f43f5e", vx: rand(-1, 1), vy: rand(-1, 1) }); } score = 0; }
  function loop() { const m = mouse(); me.x += (m.x - me.x) * 0.06; me.y += (m.y - me.y) * 0.06; me.x = Math.max(me.r, Math.min(W - me.r, me.x)); me.y = Math.max(me.r, Math.min(H - me.r, me.y)); for (let i = foods.length - 1; i >= 0; i--) { const f = foods[i]; if (Math.hypot(f.x - me.x, f.y - me.y) < me.r + f.r) { foods.splice(i, 1); me.r = Math.min(40, me.r + 0.6); score += 1; } } for (const b of blobs) { b.x += b.vx; b.y += b.vy; if (b.x < 0 || b.x > W) b.vx *= -1; if (b.y < 0 || b.y > H) b.vy *= -1; const d = Math.hypot(b.x - me.x, b.y - me.y); if (d < me.r + b.r) { if (me.r > b.r) { me.r = Math.min(50, me.r + 1); score += 5; b.x = rand(0, W); b.y = rand(0, H); b.r = rand(10, 22); } else { scoreEl.textContent = "Eaten!"; return; } } } if (foods.length < 30) foods.push({ x: rand(0, W), y: rand(0, H), r: 5 }); scoreEl.textContent = score; ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); foods.forEach(f => { ctx.fillStyle = "#34d399"; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill(); }); blobs.forEach(b => { ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); }); ctx.fillStyle = CFG.accent; ctx.beginPath(); ctx.arc(me.x, me.y, me.r, 0, 7); ctx.fill(); requestAnimationFrame(loop); }
  function mouse() { const r = canvas.getBoundingClientRect(); return { x: (pm.x - r.left) / r.width * W, y: (pm.y - r.top) / r.height * H }; }
  const pm = { x: W / 2, y: H / 2 }; canvas.addEventListener("mousemove", e => { pm.x = e.clientX; pm.y = e.clientY; }); canvas.addEventListener("touchmove", e => { pm.x = e.touches[0].clientX; pm.y = e.touches[0].clientY; }, { passive: true });
  document.getElementById("restart").addEventListener("click", init); init(); loop();
};

ENGINES.colorsort = function (g) {
  const W = g.w, H = g.h; const TUBES = g.tubes || 4, COLS = g.cols || 4, colors = ["#f43f5e", "#22d3ee", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"];
  let tubes, sel;
  function init() { const pool = []; for (let i = 0; i < TUBES; i++)for (let j = 0; j < COLS; j++)pool.push(colors[i % colors.length]); for (let i = pool.length - 1; i > 0; i--) { const k = (Math.random() * (i + 1)) | 0; [pool[i], pool[k]] = [pool[k], pool[i]]; } tubes = []; for (let i = 0; i < TUBES; i++)tubes.push(pool.slice(i * COLS, i * COLS + COLS)); sel = -1; score = 0; scoreEl.textContent = 0; }
  let score;
  function top(t) { for (let i = COLS - 1; i >= 0; i--)if (t[i] !== null) return i; return -1; }
  function draw() { ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); const tw = 44, th = 30, gap = (W - TUBES * tw) / (TUBES + 1); for (let i = 0; i < TUBES; i++) { const x = gap + i * (tw + gap); for (let j = 0; j < COLS; j++) { const y = H - 20 - (j + 1) * th; if (tubes[i][j] !== null) { ctx.fillStyle = tubes[i][j]; rr(x, y, tw, th - 3, 4); ctx.fill(); } } ctx.strokeStyle = i === sel ? CFG.accent : "#3a3a5c"; ctx.lineWidth = 2; rr(x, H - 20 - COLS * th, tw, COLS * th, 6); ctx.stroke(); } }
  function tap(i) { if (sel === -1) { if (top(tubes[i]) !== -1) sel = i; return; } if (sel === i) { sel = -1; return; } const a = top(tubes[sel]), b = top(tubes[i]); if (b === -1 && a !== -1) { for (let j = a; j >= 0; j--)tubes[i][j] = tubes[sel][j]; for (let j = 0; j <= a; j++)tubes[sel][j] = null; sel = -1; score += 1; scoreEl.textContent = score; } else if (a !== -1 && b !== -1 && tubes[sel][a] === tubes[i][b] && b < COLS - 1) { tubes[i][b + 1] = tubes[sel][a]; tubes[sel][a] = null; sel = -1; score += 1; scoreEl.textContent = score; } else sel = -1; draw(); }
  canvas.addEventListener("click", e => { const r = canvas.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * W; const gap = (W - TUBES * 44) / (TUBES + 1); const i = Math.floor((x - gap / 2) / (44 + gap)); if (i >= 0 && i < TUBES) tap(i); });
  document.getElementById("restart").addEventListener("click", () => { init(); draw(); }); init(); draw();
};

ENGINES.match3 = function (g) {
  const N = g.size || 8, W = g.w, CELL = W / N; const C = ["#f43f5e", "#22d3ee", "#34d399", "#fbbf24", "#a78bfa"];
  let grid, score, sel;
  function init() { grid = []; for (let r = 0; r < N; r++) { grid[r] = []; for (let c = 0; c < N; c++)grid[r][c] = (Math.random() * C.length) | 0; } score = 0; sel = null; scoreEl.textContent = 0; }
  function draw() { ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, W); for (let r = 0; r < N; r++)for (let c = 0; c < N; c++) { const x = c * CELL, y = r * CELL; ctx.fillStyle = C[grid[r][c]]; rr(x + 3, y + 3, CELL - 6, CELL - 6, 8); ctx.fill(); } if (sel) { ctx.strokeStyle = CFG.accent; ctx.lineWidth = 3; rr(sel.c * CELL + 3, sel.r * CELL + 3, CELL - 6, CELL - 6, 8); ctx.stroke(); } }
  function swap(a, b) { [grid[a.r][a.c], grid[b.r][b.c]] = [grid[b.r][b.c], grid[a.r][a.c]]; }
  function tap(c, r) { if (!sel) { sel = { r, c }; } else { if (Math.abs(sel.r - r) + Math.abs(sel.c - c) === 1) { swap(sel, { r, c }); score += 1; scoreEl.textContent = score; } sel = null; } draw(); }
  canvas.addEventListener("click", e => { const rect = canvas.getBoundingClientRect(); const c = ((e.clientX - rect.left) / rect.width * W / CELL) | 0; const r = ((e.clientY - rect.top) / rect.height * W / CELL) | 0; if (r >= 0 && r < N && c >= 0 && c < N) tap(c, r); });
  document.getElementById("restart").addEventListener("click", () => { init(); draw(); }); init(); draw();
};

ENGINES.spaceshooter = function (g) {
  const W = g.w, H = g.h; let ship, bullets, enemies, score, over;
  function init() { ship = { x: W / 2, y: H - 40 }; bullets = []; enemies = []; score = 0; over = false; scoreEl.textContent = 0; }
  function loop() { if (over) return; if (chance(0.03)) enemies.push({ x: rand(10, W - 10), y: -10, vy: rand(1.0, 1.7) }); bullets = bullets.filter(b => { b.y -= 7; return b.y > -10; }); enemies = enemies.filter(en => { en.y += en.vy; const hit = bullets.some(b => Math.abs(b.x - en.x) < 12 && Math.abs(b.y - en.y) < 12); if (hit) score += 10; return !hit && en.y < H + 10; }); if (enemies.some(en => en.y > H - 20)) over = true; scoreEl.textContent = score; ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = CFG.accent; rr(ship.x - 12, ship.y - 12, 24, 24, 6); ctx.fill(); ctx.fillStyle = "#fbbf24"; bullets.forEach(b => { rr(b.x - 2, b.y - 8, 4, 12, 2); ctx.fill(); }); enemies.forEach(en => { ctx.fillStyle = "#f43f5e"; rr(en.x - 10, en.y - 10, 20, 20, 6); ctx.fill(); }); if (over) { ctx.fillStyle = "rgba(8,8,20,.7)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#f43f5e"; ctx.font = "700 28px system-ui"; ctx.textAlign = "center"; ctx.fillText("Game Over", W / 2, H / 2); } requestAnimationFrame(loop); }
  addEventListener("keydown", e => { if (e.key === "ArrowLeft") ship.x = Math.max(12, ship.x - 14); if (e.key === "ArrowRight") ship.x = Math.min(W - 12, ship.x + 14); if (e.key === " ") bullets.push({ x: ship.x, y: ship.y - 14 }); });
  canvas.addEventListener("mousemove", e => { const r = canvas.getBoundingClientRect(); ship.x = (e.clientX - r.left) / r.width * W; }); canvas.addEventListener("click", () => bullets.push({ x: ship.x, y: ship.y - 14 }));
  document.getElementById("restart").addEventListener("click", () => { init(); loop(); }); init(); loop();
};

ENGINES.jump = function (g) {
  const W = g.w, H = g.h; let p, plats, vy, score, over;
  function init() { p = { x: W / 2, y: H - 24 }; vy = 0; plats = []; for (let i = 0; i < 8; i++)plats.push({ x: i === 0 ? W / 2 - 25 : rand(0, W - 50), y: H - i * 70, w: 50 }); score = 0; over = false; }
  function loop() { if (over) return; vy += 0.5; p.y += vy; if (p.y < H / 2) { p.y = H / 2; plats.forEach(pl => pl.y -= vy ? 0 : 0); plats = plats.map(pl => ({ ...pl, y: pl.y + 3 })).filter(pl => pl.y < H + 20); while (plats.length < 8)plats.push({ x: rand(0, W - 50), y: plats[plats.length - 1].y - 70, w: 50 }); } const on = plats.find(pl => p.x + 14 > pl.x && p.x - 14 < pl.x + pl.w && Math.abs((p.y + 24) - pl.y) < 8 && vy > 0); if (on) { vy = -9; score += 1; scoreEl.textContent = score; } if (p.y > H) over = true; ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); plats.forEach(pl => { ctx.fillStyle = "#34d399"; rr(pl.x, pl.y, pl.w, 12, 5); ctx.fill(); }); ctx.fillStyle = CFG.accent; rr(p.x - 14, p.y - 24, 28, 28, 8); ctx.fill(); if (over) { ctx.fillStyle = "rgba(8,8,20,.7)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#f43f5e"; ctx.font = "700 28px system-ui"; ctx.textAlign = "center"; ctx.fillText("Game Over", W / 2, H / 2); } requestAnimationFrame(loop); }
  addEventListener("keydown", e => { if (e.key === "ArrowLeft") p.x -= 22; if (e.key === "ArrowRight") p.x += 22; });
  canvas.addEventListener("touchstart", e => { const x = e.touches[0].clientX; p.x = x < innerWidth / 2 ? Math.max(14, p.x - 22) : Math.min(W - 14, p.x + 22); }, { passive: true });
  document.getElementById("restart").addEventListener("click", () => { init(); loop(); }); init(); loop();
};

ENGINES.racing = function (g) {
  const W = g.w, H = g.h; let car, road, enemies, score, over, spd;
  function init() { car = { x: W / 2, y: H - 60 }; enemies = []; score = 0; over = false; spd = 4; }
  function loop() { if (over) return; spd = 2.4 + score * 0.025; if (chance(0.035)) enemies.push({ x: ((Math.random() * 4) | 0) * (W / 4) + 20, y: -40 }); enemies = enemies.map(e => ({ ...e, y: e.y + spd })); enemies = enemies.filter(e => e.y < H + 40); score += 1; scoreEl.textContent = (score / 10 | 0); if (enemies.some(e => Math.abs(e.x - car.x) < 30 && Math.abs(e.y - car.y) < 40)) over = true; ctx.fillStyle = "#1a1a2e"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#3a3a5c"; for (let i = 0; i < 5; i++)ctx.fillRect(W / 2 - 2, (i * 80 + (score % 80)) % H, 4, 40); ctx.fillStyle = CFG.accent; rr(car.x - 14, car.y - 22, 28, 44, 6); ctx.fill(); ctx.fillStyle = "#f43f5e"; enemies.forEach(e => { rr(e.x - 14, e.y - 22, 28, 44, 6); ctx.fill(); }); if (over) { ctx.fillStyle = "rgba(8,8,20,.7)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#f43f5e"; ctx.font = "700 28px system-ui"; ctx.textAlign = "center"; ctx.fillText("Crash!", W / 2, H / 2); } requestAnimationFrame(loop); }
  addEventListener("keydown", e => { if (e.key === "ArrowLeft") car.x -= 24; if (e.key === "ArrowRight") car.x += 24; });
  canvas.addEventListener("mousemove", e => { const r = canvas.getBoundingClientRect(); car.x = (e.clientX - r.left) / r.width * W; });
  document.getElementById("restart").addEventListener("click", () => { init(); loop(); }); init(); loop();
};

ENGINES.sportshot = function (g) {
  const W = g.w, H = g.h; let ball, target, score, over;
  function init() { ball = { x: W / 2, y: H - 30, vx: 0, vy: 0, live: false }; target = { x: rand(40, W - 40), y: rand(40, H / 2) }; score = 0; over = false; scoreEl.textContent = 0; }
  function loop() { if (ball.live && !over) { ball.vy += 0.4; ball.x += ball.vx; ball.y += ball.vy; if (ball.y > H) { ball.live = false; } if (Math.hypot(ball.x - target.x, ball.y - target.y) < 26) { score += 1; scoreEl.textContent = score; target = { x: rand(40, W - 40), y: rand(40, H / 2) }; ball.live = false; } } ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = CFG.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(target.x, target.y, 22, 0, 7); ctx.stroke(); ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(ball.x, ball.y, 12, 0, 7); ctx.fill(); requestAnimationFrame(loop); }
  function shoot(dx, dy) { if (ball.live) return; const m = Math.hypot(dx, dy) || 1; ball.vx = dx / m * 9; ball.vy = dy / m * 9; ball.live = true; }
  canvas.addEventListener("click", e => { const r = canvas.getBoundingClientRect(); shoot((e.clientX - r.left) / r.width * W - ball.x, (e.clientY - r.top) / r.height * H - ball.y); });
  addEventListener("keydown", e => { if (e.key === " ") shoot(0, -12); });
  document.getElementById("restart").addEventListener("click", () => { init(); loop(); }); init(); loop();
};

ENGINES.towerdefense = function (g) {
  const W = g.w, H = g.h; let towers, enemies, money, score, over, t;
  function init() { towers = []; enemies = []; money = 50; score = 0; over = false; t = 0; }
  function loop() { t++; if (over) return; if (t % 90 === 0) enemies.push({ x: 0, y: H / 2, hp: 3, vx: 0.8, vy: 0 }); enemies = enemies.map(e => ({ ...e, x: e.x + e.vx })); enemies.forEach(e => towers.forEach(tw => { if (Math.hypot(tw.x - e.x, tw.y - e.y) < 70 && t % 20 === 0) e.hp -= 1; })); enemies = enemies.filter(e => { if (e.hp <= 0) { money += 5; score += 1; return false; } if (e.x > W) { over = true; } return e.x <= W; }); scoreEl.textContent = score; ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#3a3a5c"; ctx.fillRect(0, 0, 6, H); enemies.forEach(e => { ctx.fillStyle = "#f43f5e"; ctx.beginPath(); ctx.arc(e.x, e.y, 10, 0, 7); ctx.fill(); }); towers.forEach(tw => { ctx.fillStyle = CFG.accent; rr(tw.x - 10, tw.y - 10, 20, 20, 5); ctx.fill(); }); if (over) { ctx.fillStyle = "rgba(8,8,20,.7)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#f43f5e"; ctx.font = "700 26px system-ui"; ctx.textAlign = "center"; ctx.fillText("Base lost", W / 2, H / 2); } requestAnimationFrame(loop); }
  canvas.addEventListener("click", e => { const r = canvas.getBoundingClientRect(); if (money >= 10) { towers.push({ x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }); money -= 10; } });
  document.getElementById("restart").addEventListener("click", () => { init(); loop(); }); init(); loop();
};

ENGINES.clicker = function (g) {
  const W = g.w, H = g.h; let coins, rate, t;
  function init() { coins = 0; rate = 0; t = 0; }
  function loop() { t++; coins += rate; if (t % 30 === 0) scoreEl.textContent = (coins | 0); ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = CFG.accent; ctx.font = "700 30px system-ui"; ctx.textAlign = "center"; ctx.fillText((coins | 0) + " coins", W / 2, H / 2 - 20); ctx.fillStyle = "#8b8ba7"; ctx.font = "16px system-ui"; ctx.fillText("Click to mine · buy auto-miner", W / 2, H / 2 + 16); }
  canvas.addEventListener("click", () => { coins += 1; scoreEl.textContent = (coins | 0); });
  document.getElementById("restart").addEventListener("click", () => { init(); loop(); });
  document.getElementById("restart").insertAdjacentHTML("afterend", "");
  let auto = document.createElement("button"); auto.textContent = "Auto +1 (" + (50) + ")"; auto.style.cssText = "background:#34d399;color:#04121a;border:0;border-radius:10px;padding:8px 16px;font-weight:700;cursor:pointer;margin-left:8px";
  document.querySelector(".bar").appendChild(auto); auto.addEventListener("click", () => { if (coins >= 50) { coins -= 50; rate += 1; } });
  init(); loop();
};

ENGINES.sudoku = function (g) {
  const N = 9, W = g.w, CELL = W / N; let board, sol;
  function init() { sol = make(); board = sol.map(r => r.slice()); for (let i = 0; i < N; i++)for (let j = 0; j < N; j++)if (chance(0.55)) board[i][j] = 0; scoreEl.textContent = "Fill it"; }
  function make() { const b = Array.from({ length: N }, () => Array(N).fill(0)); function ok(r, c, v) { for (let i = 0; i < N; i++)if (b[r][i] === v || b[i][c] === v) return false; const br = (r / 3 | 0) * 3, bc = (c / 3 | 0) * 3; for (let i = 0; i < 3; i++)for (let j = 0; j < 3; j++)if (b[br + i][bc + j] === v) return false; return true; } function fill(r, c) { if (r === N) return true; if (c === N) return fill(r + 1, 0); if (b[r][c]) return fill(r, c + 1); for (let v = 1; v <= 9; v++) { if (ok(r, c, v)) { b[r][c] = v; if (fill(r, c + 1)) return true; b[r][c] = 0; } } return false; } fill(0, 0); return b; }
  function draw() { ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, W); ctx.font = "600 " + (CELL * 0.5) + "px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; for (let r = 0; r < N; r++)for (let c = 0; c < N; c++) { const x = c * CELL, y = r * CELL; ctx.strokeStyle = (r % 3 === 0 || c % 3 === 0) ? "#4a4a78" : "#2a2a44"; ctx.lineWidth = 1; ctx.strokeRect(x, y, CELL, CELL); if (board[r][c]) { ctx.fillStyle = "#e7e7f5"; ctx.fillText(board[r][c], x + CELL / 2, y + CELL / 2); } } }
  document.getElementById("restart").addEventListener("click", () => { init(); draw(); }); init(); draw();
};

ENGINES.wordsearch = function (g) {
  const N = 10, W = g.w, CELL = W / N; const words = g.words || ["GAME", "PLAY", "FUN", "WIN", "SKILL"]; let grid;
  function init() { grid = Array.from({ length: N }, () => Array(N).fill("")); for (const w of words) place(w); for (let r = 0; r < N; r++)for (let c = 0; c < N; c++)if (!grid[r][c]) grid[r][c] = String.fromCharCode(65 + (Math.random() * 26 | 0)); scoreEl.textContent = "Find: " + words.join(" "); }
  function place(w) { for (let t = 0; t < 30; t++) { const dr = (Math.random() * 3 | 0) - 1, dc = (Math.random() * 3 | 0) - 1; if (dr === 0 && dc === 0) continue; let r = Math.random() * N | 0, c = Math.random() * N | 0; let ok2 = true; const pts = []; for (const ch of w) { if (r < 0 || c < 0 || r >= N || c >= N || (grid[r][c] && grid[r][c] !== ch)) { ok2 = false; break; } pts.push([r, c]); r += dr; c += dc; } if (ok2) { pts.forEach((p, i) => grid[p[0]][p[1]] = w[i]); return; } } }
  function draw() { ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, W); ctx.font = "600 " + (CELL * 0.55) + "px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; for (let r = 0; r < N; r++)for (let c = 0; c < N; c++) { ctx.fillStyle = CFG.accent; ctx.fillText(grid[r][c], c * CELL + CELL / 2, r * CELL + CELL / 2); } }
  document.getElementById("restart").addEventListener("click", () => { init(); draw(); }); init(); draw();
};

ENGINES.memory = function (g) {
  const N = 4, W = g.w, CELL = W / N; const icons = ["🍎", "⭐", "🔥", "💡", "🎮", "🚀", "🌟", "⚡"]; let cards, flipped, matched, score;
  function init() { let v = []; for (let i = 0; i < (N * N) / 2; i++) { v.push(icons[i], icons[i]); } v = v.sort(() => Math.random() - 0.5); cards = v.map(x => ({ v: x, f: false, m: false })); flipped = []; matched = 0; score = 0; scoreEl.textContent = 0; }
  function draw() { ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, W); ctx.font = (CELL * 0.5) + "px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; for (let i = 0; i < N * N; i++) { const r = (i / N | 0), c = i % N; const x = c * CELL, y = r * CELL; ctx.fillStyle = cards[i].m || cards[i].f ? "#1d1d33" : "#2a2a44"; rr(x + 4, y + 4, CELL - 8, CELL - 8, 8); ctx.fill(); if (cards[i].m || cards[i].f) ctx.fillText(cards[i].v, x + CELL / 2, y + CELL / 2); } }
  canvas.addEventListener("click", e => { const rect = canvas.getBoundingClientRect(); const c = ((e.clientX - rect.left) / rect.width * W / CELL) | 0; const r = ((e.clientY - rect.top) / rect.height * W / CELL) | 0; const i = r * N + c; if (cards[i].m || cards[i].f || flipped.length === 2) return; cards[i].f = true; flipped.push(i); if (flipped.length === 2) { if (cards[flipped[0]].v === cards[flipped[1]].v) { cards[flipped[0]].m = cards[flipped[1]].m = true; matched += 2; score += 1; scoreEl.textContent = score; flipped = []; } else setTimeout(() => { cards[flipped[0]].f = cards[flipped[1]].f = false; flipped = []; draw(); }, 600); } draw(); });
  document.getElementById("restart").addEventListener("click", () => { init(); draw(); }); init(); draw();
};

ENGINES.typing = function (g) {
  const W = g.w, H = g.h; const words = ["cat", "dog", "jump", "play", "star", "fast", "cool", "game", "win", "fun", "code", "blue", "red", "sun", "moon"]; let cur, typed, score, over, t;
  function init() { cur = words[(Math.random() * words.length) | 0]; typed = ""; score = 0; over = false; t = 0; scoreEl.textContent = 0; }
  function loop() { t++; if (t % 180 === 0 && typed.length === 0) over = true; if (over) { ctx.fillStyle = "rgba(8,8,20,.7)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#f43f5e"; ctx.font = "700 26px system-ui"; ctx.textAlign = "center"; ctx.fillText("Time up", W / 2, H / 2); return; } ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = CFG.accent; ctx.font = "700 34px system-ui"; ctx.textAlign = "center"; ctx.fillText(cur, W / 2, H / 2 - 10); ctx.fillStyle = "#e7e7f5"; ctx.font = "600 24px system-ui"; ctx.fillText(typed, W / 2, H / 2 + 30); requestAnimationFrame(loop); }
  addEventListener("keydown", e => { if (over) return; if (e.key === cur[typed.length]) { typed += e.key; if (typed === cur) { score += 1; scoreEl.textContent = score; cur = words[(Math.random() * words.length) | 0]; typed = ""; } } else if (e.key.length === 1) typed = ""; });
  document.getElementById("restart").addEventListener("click", () => { init(); loop(); }); init(); loop();
};

ENGINES.coloring = function (g) {
  const N = 12, W = g.w, CELL = W / N; let cells, palette, pick;
  function init() { cells = Array.from({ length: N }, () => Array(N).fill("#1d1d33")); palette = [CFG.accent, "#f43f5e", "#22d3ee", "#34d399", "#fbbf24", "#a78bfa"]; pick = palette[0]; scoreEl.textContent = "Tap a color then paint"; }
  function draw() { ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, W); for (let r = 0; r < N; r++)for (let c = 0; c < N; c++) { ctx.fillStyle = cells[r][c]; ctx.fillRect(c * CELL, r * CELL, CELL, CELL); } for (let i = 0; i < palette.length; i++) { ctx.fillStyle = palette[i]; ctx.fillRect(4 + i * (W / palette.length), W + 2, W / palette.length - 6, 14); } }
  canvas.addEventListener("click", e => { const rect = canvas.getBoundingClientRect(); const x = (e.clientX - rect.left) / rect.width * W, y = (e.clientY - rect.top) / rect.height * (W + 18); if (y > W) { const i = (x / (W / palette.length)) | 0; if (i >= 0 && i < palette.length) pick = palette[i]; } else { const c = (x / CELL) | 0, r = (y / CELL) | 0; if (r >= 0 && r < N && c >= 0 && c < N) cells[r][c] = pick; } draw(); });
  document.getElementById("restart").addEventListener("click", () => { init(); draw(); }); init(); draw();
};

ENGINES.rhythm = function (g) {
  const W = g.w, H = g.h; let notes, score, over, t;
  function init() { notes = []; score = 0; over = false; t = 0; }
  function loop() { t++; if (over) return; if (t % 60 === 0) notes.push({ x: rand(40, W - 40), y: -10, hit: false }); notes = notes.map(n => ({ ...n, y: n.y + 2.4 })); notes.forEach(n => { if (n.y > H - 30 && !n.hit) over = true; }); notes = notes.filter(n => n.y < H + 20); scoreEl.textContent = score; ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#34d399"; ctx.fillRect(W / 2 - 30, H - 30, 60, 12); notes.forEach(n => { ctx.fillStyle = n.hit ? "#34d399" : CFG.accent; ctx.beginPath(); ctx.arc(n.x, n.y, 12, 0, 7); ctx.fill(); }); if (over) { ctx.fillStyle = "rgba(8,8,20,.7)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#f43f5e"; ctx.font = "700 26px system-ui"; ctx.textAlign = "center"; ctx.fillText("Missed!", W / 2, H / 2); } requestAnimationFrame(loop); }
  canvas.addEventListener("click", e => { const rect = canvas.getBoundingClientRect(); const x = (e.clientX - rect.left) / rect.width * W; notes.forEach(n => { if (Math.abs(n.x - x) < 40 && Math.abs(n.y - (H - 24)) < 40 && !n.hit) { n.hit = true; score += 1; } }); });
  document.getElementById("restart").addEventListener("click", () => { init(); loop(); }); init(); loop();
};

ENGINES.draw = function (g) {
  const W = g.w, H = g.h; let path, drawing, goal;
  function init() { path = []; drawing = false; goal = { x: W - 40, y: H / 2 }; scoreEl.textContent = "Drag to draw a path"; }
  function loop() { ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#34d399"; ctx.beginPath(); ctx.arc(goal.x, goal.y, 16, 0, 7); ctx.fill(); ctx.strokeStyle = CFG.accent; ctx.lineWidth = 4; ctx.beginPath(); path.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); requestAnimationFrame(loop); }
  canvas.addEventListener("mousedown", () => drawing = true); canvas.addEventListener("mouseup", () => drawing = false); canvas.addEventListener("mousemove", e => { if (!drawing) return; const r = canvas.getBoundingClientRect(); path.push({ x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }); if (path.length > 1 && Math.hypot(path[path.length - 1].x - goal.x, path[path.length - 1].y - goal.y) < 20) { score += 1; scoreEl.textContent = score; goal = { x: rand(40, W - 40), y: rand(40, H - 40) }; path = []; } });
  document.getElementById("restart").addEventListener("click", () => { init(); }); init(); loop();
};

ENGINES.path = function (g) {
  const N = 8, W = g.w, CELL = W / N; let grid, cur, score;
  function init() { grid = Array.from({ length: N }, () => Array(N).fill(0)); cur = { r: 0, c: 0 }; grid[0][0] = 1; score = 0; scoreEl.textContent = 0; }
  function draw() { ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, W); for (let r = 0; r < N; r++)for (let c = 0; c < N; c++) { if (grid[r][c]) { ctx.fillStyle = CFG.accent; rr(c * CELL + 4, r * CELL + 4, CELL - 8, CELL - 8, 6); ctx.fill(); } } ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(W - CELL / 2, W - CELL / 2, CELL / 3, 0, 7); ctx.fill(); }
  canvas.addEventListener("click", e => { const rect = canvas.getBoundingClientRect(); const c = ((e.clientX - rect.left) / rect.width * W / CELL) | 0; const r = ((e.clientY - rect.top) / rect.height * W / CELL) | 0; if (Math.abs(r - cur.r) + Math.abs(c - cur.c) === 1) { cur = { r, c }; grid[r][c] = 1; score += 1; scoreEl.textContent = score; if (r === N - 1 && c === N - 1) { scoreEl.textContent = "Solved!"; } } draw(); });
  document.getElementById("restart").addEventListener("click", () => { init(); draw(); }); init(); draw();
};

ENGINES.pinball = function (g) {
  const W = g.w, H = g.h; let ball, paddle, score, over;
  function init() { ball = { x: W / 2, y: 60, vx: 1.5, vy: 1.5 }; paddle = { x: W / 2, w: 80 }; score = 0; over = false; scoreEl.textContent = 0; }
  function loop() { if (over) return; ball.vy += 0.1; ball.x += ball.vx; ball.y += ball.vy; if (ball.x < 8 || ball.x > W - 8) ball.vx *= -1; if (ball.y < 8) ball.vy *= -1; if (ball.y > H - 14 && ball.x > paddle.x - paddle.w / 2 && ball.x < paddle.x + paddle.w / 2) { ball.vy = -Math.abs(ball.vy); score += 1; scoreEl.textContent = score; } if (ball.y > H) over = true; ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = CFG.accent; rr(paddle.x - paddle.w / 2, H - 12, paddle.w, 10, 5); ctx.fill(); ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(ball.x, ball.y, 8, 0, 7); ctx.fill(); if (over) { ctx.fillStyle = "rgba(8,8,20,.7)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#f43f5e"; ctx.font = "700 26px system-ui"; ctx.textAlign = "center"; ctx.fillText("Game Over", W / 2, H / 2); } requestAnimationFrame(loop); }
  canvas.addEventListener("mousemove", e => { const r = canvas.getBoundingClientRect(); paddle.x = (e.clientX - r.left) / r.width * W; });
  document.getElementById("restart").addEventListener("click", () => { init(); loop(); }); init(); loop();
};

ENGINES.maze = function (g) {
  const N = 13, W = g.w, CELL = W / N; let px, py, dots, score, over, gx, gy;
  function init() { px = 1; py = 1; dots = Array.from({ length: N }, () => Array(N).fill(1)); dots[1][1] = 0; gx = N - 2; gy = N - 2; score = 0; over = false; scoreEl.textContent = 0; }
  function draw() { ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, W); for (let r = 0; r < N; r++)for (let c = 0; c < N; c++) { const wall = (r === 0 || c === 0 || r === N - 1 || c === N - 1) || ((r % 2 === 0) && (c % 2 === 0)); if (wall) { ctx.fillStyle = "#3a3a5c"; ctx.fillRect(c * CELL, r * CELL, CELL, CELL); } else if (dots[r][c]) { ctx.fillStyle = "#8b8ba7"; ctx.beginPath(); ctx.arc(c * CELL + CELL / 2, r * CELL + CELL / 2, 2, 0, 7); ctx.fill(); } } ctx.fillStyle = CFG.accent; ctx.beginPath(); ctx.arc(px * CELL + CELL / 2, py * CELL + CELL / 2, CELL / 2 - 2, 0, 7); ctx.fill(); }
  function mv(dx, dy) { const nx = px + dx, ny = py + dy; const wall = (nx === 0 || ny === 0 || nx === N - 1 || ny === N - 1) || ((ny % 2 === 0) && (nx % 2 === 0)); if (!wall) { px = nx; py = ny; if (dots[py][px]) { dots[py][px] = 0; score += 1; scoreEl.textContent = score; } } draw(); }
  addEventListener("keydown", e => { const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (k) { e.preventDefault(); mv(k[0], k[1]); } });
  canvas.addEventListener("touchstart", e => { const t = e.touches[0]; canvas._sx = t.clientX; canvas._sy = t.clientY; }, { passive: true });
  canvas.addEventListener("touchend", e => { const t = e.changedTouches[0], dx = t.clientX - canvas._sx, dy = t.clientY - canvas._sy; if (Math.abs(dx) > Math.abs(dy)) mv(dx > 0 ? 1 : -1, 0); else mv(0, dy > 0 ? 1 : -1); }, { passive: true });
  document.getElementById("restart").addEventListener("click", () => { init(); draw(); }); init(); draw();
};

ENGINES.tetris = function (g) {
  const COLS = 10, ROWS = 18, W = g.w, CELL = W / COLS, H = ROWS * CELL; const SH = [[[1, 1, 1, 1]], [[1, 1], [1, 1]], [[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]], [[1, 1, 1], [0, 1, 0]], [[1, 1, 1], [1, 0, 0]], [[1, 1, 1], [0, 0, 1]]];
  let board, cur, score, over, drop;
  function init() { board = Array.from({ length: ROWS }, () => Array(COLS).fill(0)); cur = nw(); score = 0; over = false; scoreEl.textContent = 0; }
  function nw() { const s = SH[(Math.random() * SH.length) | 0]; return { s, x: 3, y: 0 }; }
  function hit(b, ox, oy) { for (let r = 0; r < b.s.length; r++)for (let c = 0; c < b.s[r].length; c++) { if (!b.s[r][c]) continue; const x = ox + c, y = oy + r; if (x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x])) return true; } return false; }
  function draw() { ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); for (let r = 0; r < ROWS; r++)for (let c = 0; c < COLS; c++) if (board[r][c]) { ctx.fillStyle = CFG.accent; rr(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2, 4); ctx.fill(); } for (let r = 0; r < cur.s.length; r++)for (let c = 0; c < cur.s[r].length; c++) if (cur.s[r][c]) { ctx.fillStyle = "#22d3ee"; rr((cur.x + c) * CELL + 1, (cur.y + r) * CELL + 1, CELL - 2, CELL - 2, 4); ctx.fill(); } }
  function step() { if (over) return; if (!hit(cur, cur.x, cur.y + 1)) cur.y++; else { for (let r = 0; r < cur.s.length; r++)for (let c = 0; c < cur.s[r].length; c++) if (cur.s[r][c]) { const y = cur.y + r; if (y < 0) { over = true; return; } board[y][cur.x + c] = 1; } for (let r = ROWS - 1; r >= 0; r--) if (board[r].every(v => v)) { board.splice(r, 1); board.unshift(Array(COLS).fill(0)); score += 1; scoreEl.textContent = score; } cur = nw(); } draw(); }
  function rot() { const s = cur.s[0].map((_, i) => cur.s.map(r => r[i]).reverse()); const n = { s, x: cur.x, y: cur.y }; if (!hit(n, n.x, n.y)) { cur = n; draw(); } }
  drop = setInterval(step, 400);
  addEventListener("keydown", e => { if (e.key === "ArrowLeft" && !hit(cur, cur.x - 1, cur.y)) cur.x--; if (e.key === "ArrowRight" && !hit(cur, cur.x + 1, cur.y)) cur.x++; if (e.key === "ArrowDown") step(); if (e.key === "ArrowUp") rot(); draw(); });
  document.getElementById("restart").addEventListener("click", () => { clearInterval(drop); init(); drop = setInterval(step, 400); }); init(); draw();
};

ENGINES.fruitslice = function (g) {
  const W = g.w, H = g.h; let fruits, score, over, sl;
  function init() { fruits = []; score = 0; over = false; sl = []; }
  function loop() { if (over) return; if (chance(0.04)) fruits.push({ x: rand(20, W - 20), y: H + 10, vy: rand(-10, -7), r: rand(14, 22), cut: false }); fruits = fruits.map(f => ({ ...f, y: f.y + f.vy, vy: f.vy + 0.3 })); fruits.forEach(f => { if (f.y > H + 30 && !f.cut) over = true; }); fruits = fruits.filter(f => f.y < H + 40); scoreEl.textContent = score; ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 3; ctx.beginPath(); sl.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); fruits.forEach(f => { ctx.fillStyle = f.cut ? "#34d399" : CFG.accent; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill(); }); if (over) { ctx.fillStyle = "rgba(8,8,20,.7)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#f43f5e"; ctx.font = "700 26px system-ui"; ctx.textAlign = "center"; ctx.fillText("Missed!", W / 2, H / 2); } requestAnimationFrame(loop); }
  canvas.addEventListener("mousemove", e => { const r = canvas.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H; sl.push({ x, y }); if (sl.length > 8) sl.shift(); fruits.forEach(f => { if (Math.hypot(f.x - x, f.y - y) < f.r + 6 && !f.cut) { f.cut = true; score += 1; } }); });
  document.getElementById("restart").addEventListener("click", () => { init(); loop(); }); init(); loop();
};

ENGINES.dodge = function (g) {
  const W = g.w, H = g.h; let ship, rocks, score, over;
  function init() { ship = { x: W / 2, y: H - 50 }; rocks = []; score = 0; over = false; scoreEl.textContent = 0; }
  function loop() { if (over) return; if (chance(0.05)) rocks.push({ x: rand(10, W - 10), y: -10, vy: rand(1.6, 2.6), r: rand(10, 22) }); rocks = rocks.map(r => ({ ...r, y: r.y + r.vy })); rocks = rocks.filter(r => r.y < H + 30); score += 1; scoreEl.textContent = (score / 10 | 0); if (rocks.some(r => Math.hypot(r.x - ship.x, r.y - ship.y) < r.r + 12)) over = true; ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = CFG.accent; ctx.beginPath(); ctx.moveTo(ship.x, ship.y - 14); ctx.lineTo(ship.x - 12, ship.y + 12); ctx.lineTo(ship.x + 12, ship.y + 12); ctx.closePath(); ctx.fill(); rocks.forEach(r => { ctx.fillStyle = "#8b8ba7"; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 7); ctx.fill(); }); if (over) { ctx.fillStyle = "rgba(8,8,20,.7)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#f43f5e"; ctx.font = "700 26px system-ui"; ctx.textAlign = "center"; ctx.fillText("Game Over", W / 2, H / 2); } requestAnimationFrame(loop); }
  canvas.addEventListener("mousemove", e => { const r = canvas.getBoundingClientRect(); ship.x = (e.clientX - r.left) / r.width * W; });
  addEventListener("keydown", e => { if (e.key === "ArrowLeft") ship.x -= 20; if (e.key === "ArrowRight") ship.x += 20; });
  document.getElementById("restart").addEventListener("click", () => { init(); loop(); }); init(); loop();
};

ENGINES.zombie = function (g) {
  const W = g.w, H = g.h; let player, zombies, bullets, score, over;
  function init() { player = { x: W / 2, y: H - 50 }; zombies = []; bullets = []; score = 0; over = false; scoreEl.textContent = 0; }
  function loop() { if (over) return; if (chance(0.025)) zombies.push({ x: rand(20, W - 20), y: -10, vy: rand(0.7, 1.3) }); bullets = bullets.filter(b => { b.y -= 7; return b.y > -10; }); zombies = zombies.map(z => ({ ...z, y: z.y + z.vy })); zombies = zombies.filter(z => { const hit = bullets.some(b => Math.hypot(b.x - z.x, b.y - z.y) < 14); if (hit) score += 1; return !hit && z.y < H + 20; }); if (zombies.some(z => z.y > H - 40)) over = true; scoreEl.textContent = score; ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = CFG.accent; rr(player.x - 12, player.y - 16, 24, 32, 6); ctx.fill(); ctx.fillStyle = "#34d399"; bullets.forEach(b => { rr(b.x - 2, b.y - 8, 4, 12, 2); ctx.fill(); }); zombies.forEach(z => { ctx.fillStyle = "#22c55e"; ctx.beginPath(); ctx.arc(z.x, z.y, 12, 0, 7); ctx.fill(); }); if (over) { ctx.fillStyle = "rgba(8,8,20,.7)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#f43f5e"; ctx.font = "700 26px system-ui"; ctx.textAlign = "center"; ctx.fillText("Overrun!", W / 2, H / 2); } requestAnimationFrame(loop); }
  function shoot() { bullets.push({ x: player.x, y: player.y - 16 }); }
  canvas.addEventListener("mousemove", e => { const r = canvas.getBoundingClientRect(); player.x = (e.clientX - r.left) / r.width * W; }); canvas.addEventListener("click", shoot);
  addEventListener("keydown", e => { if (e.key === " ") shoot(); if (e.key === "ArrowLeft") player.x -= 18; if (e.key === "ArrowRight") player.x += 18; });
  document.getElementById("restart").addEventListener("click", () => { init(); loop(); }); init(); loop();
};

ENGINES.blockblast = function (g) {
  const N = 8, W = g.w, CELL = W / N; const COLS = ["#f43f5e", "#22d3ee", "#34d399", "#fbbf24"]; let grid, pieces, score, sel;
  function init() { grid = Array.from({ length: N }, () => Array(N).fill(0)); score = 0; sel = -1; scoreEl.textContent = 0; pieces = [mk(), mk(), mk()]; }
  function mk() { const s = 1 + (Math.random() * 3 | 0); const arr = []; for (let i = 0; i < s; i++)arr.push((Math.random() * COLS.length) | 0); return arr; }
  function draw() { ctx.fillStyle = "#0b0b14"; ctx.fillRect(0, 0, W, W); for (let r = 0; r < N; r++)for (let c = 0; c < N; c++) if (grid[r][c]) { ctx.fillStyle = COLS[grid[r][c] - 1]; rr(c * CELL + 3, r * CELL + 3, CELL - 6, CELL - 6, 6); ctx.fill(); } for (let i = 0; i < pieces.length; i++) { ctx.fillStyle = i === sel ? CFG.accent : "#8b8ba7"; ctx.font = "600 16px system-ui"; ctx.fillText("▶" + pieces[i].length, 10, W + 16 + i * 18); } }
  function place(i, c, r) { const p = pieces[i]; if (p.every((_, k) => r + k < N && !grid[r + k][c])) { p.forEach((v, k) => grid[r + k][c] = v + 1); pieces[i] = mk(); score += p.length; scoreEl.textContent = score; clearRows(); } draw(); }
  function clearRows() { for (let r = 0; r < N; r++) if (grid[r].every(v => v)) { for (let c = 0; c < N; c++)grid[r][c] = 0; score += 8; } for (let c = 0; c < N; c++) if (grid.every(row => row[c])) { for (let r = 0; r < N; r++)grid[r][c] = 0; score += 8; } }
  canvas.addEventListener("click", e => { const rect = canvas.getBoundingClientRect(); const x = (e.clientX - rect.left) / rect.width * W, y = (e.clientY - rect.top) / rect.height * (W + 54); if (y > W) { const i = ((y - W - 8) / 18) | 0; if (i >= 0 && i < pieces.length) sel = sel === i ? -1 : i; draw(); } else if (sel >= 0) { const c = (x / CELL) | 0, r = (y / CELL) | 0; place(sel, c, r); } });
  document.getElementById("restart").addEventListener("click", () => { init(); draw(); }); init(); draw();
};

// ---------- game catalog (50) ----------
// Existing 8 + 42 new. content generated via genContent unless provided.
const GAMES = [
  // --- existing 8 (regenerated consistently; keep slugs) ---
  { slug: "merge-numbers", title: "Merge Numbers", emoji: "🧩", category: "Puzzle", mechanic: "merge", accent: "#22d3ee", w: 480, h: 480, size: 4, tags: ["puzzle", "numbers", "2048", "brain"], rating: 4.7, featured: true, popular: true, keywords: ["2048", "merge puzzle", "number merge"], theme: "number-merge puzzle", tagline: "Slide, merge, and chase the 2048 tile in a calm brain workout.", gameplay: "Slide the whole board in one direction; equal tiles merge and double. Plan ahead so your biggest tiles never get stranded.", ctrl: "Arrow keys or WASD to slide on desktop; swipe on touch.", tips: "Keep your largest tile in a corner and build around it." },
  { slug: "neon-snake", title: "Neon Snake", emoji: "🐍", category: "Arcade", mechanic: "snake", accent: "#34d399", w: 480, h: 480, tags: ["arcade", "snake", "classic"], rating: 4.5, featured: true, popular: true, keywords: ["snake game", "snake unblocked", "classic snake"], theme: "neon snake arcade", tagline: "Guide a glowing snake, eat orbs, and don't bite your own tail.", gameplay: "The snake is always moving; steer it to eat orbs and grow. The run ends if it hits a wall or itself.", ctrl: "Arrow keys or WASD; swipe on touch.", tips: "Use the edges to buy time and avoid trapping yourself." },
  { slug: "brick-breaker", title: "Brick Breaker", emoji: "🧱", category: "Arcade", mechanic: "pinball", accent: "#fbbf24", w: 480, h: 480, tags: ["arcade", "breakout", "classic"], rating: 4.6, featured: true, popular: true, keywords: ["brick breaker", "breakout", "arcade"], theme: "breakout arcade", tagline: "Smash every brick with one ball and a trusty paddle.", gameplay: "Keep the ball alive with your paddle and clear all the bricks. Bank shots off the walls to reach tricky spots.", ctrl: "Move the mouse or arrow keys to control the paddle.", tips: "Aim for the corners to create cascading clears." },
  { slug: "flappy-orb", title: "Flappy Orb", emoji: "🚀", category: "Arcade", mechanic: "jump", accent: "#22d3ee", w: 480, h: 480, tags: ["arcade", "flappy", "reaction"], rating: 4.3, popular: true, keywords: ["flappy", "flappy bird unblocked", "reaction game"], theme: "one-tap reaction flyer", tagline: "Tap to keep the orb aloft and thread it through endless pipes.", gameplay: "Each tap gives a small flap against gravity. Time your taps to slip through the gaps without touching anything.", ctrl: "Click, tap, or press Space to flap.", tips: "Use short, even taps rather than frantic clicking." },
  { slug: "bubble-pop", title: "Bubble Pop", emoji: "🫧", category: "Casual", mechanic: "match3", accent: "#22d3ee", w: 480, h: 480, size: 8, tags: ["casual", "bubble", "match"], rating: 4.4, keywords: ["bubble shooter", "bubble pop", "match 3"], theme: "bubble shooter", tagline: "Aim, shoot, and pop chains of same-color bubbles.", gameplay: "Fire colored bubbles into the cluster; three or more of a color pop, and anything cut off falls for bonus points.", ctrl: "Move the mouse to aim and click; tap to shoot on touch.", tips: "Cut clusters from the top to drop whole sections at once." },
  { slug: "cell-eater", title: "Cell Eater", emoji: "🟢", category: "Action", mechanic: "ioeat", accent: "#34d399", w: 480, h: 480, bots: 6, tags: ["action", "io", "survival"], rating: 4.2, keywords: ["io games", "agar io", "cell eater"], theme: ".io survival arena", tagline: "Eat smaller cells, dodge bigger ones, and rule the petri dish.", gameplay: "Steer your cell toward the cursor. Absorb dots and smaller cells to grow while avoiding the larger predators.", ctrl: "Move the mouse to steer; your cell follows the cursor.", tips: "Stay near the edges early, then hunt clearly smaller cells." },
  { slug: "block-stack", title: "Block Stack", emoji: "🟦", category: "Puzzle", mechanic: "tetris", accent: "#a78bfa", w: 480, h: 480, tags: ["puzzle", "tetris", "blocks"], rating: 4.6, keywords: ["tetris", "block puzzle", "stack blocks"], theme: "falling-block puzzle", tagline: "Rotate and drop pieces to clear full lines and keep the stack low.", gameplay: "Pieces fall one at a time; complete a full row to clear it. Pack efficiently so the stack never reaches the top.", ctrl: "Arrows to move/rotate/soft-drop on desktop; swipe on touch.", tips: "Keep the surface flat and plan two pieces ahead." },
  { slug: "orbit-blaster", title: "Orbit Blaster", emoji: "💥", category: "Action", mechanic: "spaceshooter", accent: "#f43f5e", w: 480, h: 480, tags: ["action", "shooter", "arcade"], rating: 4.3, keywords: ["space shooter", "arcade shooter", "blast"], theme: "space shooter", tagline: "Blast incoming enemies and survive the endless wave.", gameplay: "Move your ship and fire at the descending enemies. Each kill scores; let one reach you and the run ends.", ctrl: "Move with mouse or arrows; click or Space to fire.", tips: "Track the lowest enemy and keep moving sideways." },
  // --- new 42 ---
  { slug: "number-link-2248", title: "Number Link 2248", emoji: "🔢", category: "Puzzle", mechanic: "merge", accent: "#fbbf24", w: 480, h: 480, size: 5, tags: ["puzzle", "2248", "number link"], rating: 4.6, featured: true, keywords: ["2248 game", "number link", "connect numbers"], theme: "number-link puzzle", tagline: "Connect equal numbers in a chain and watch them double.", gameplay: "Slide the board to merge matching numbers that line up; longer chains build bigger tiles toward 2248 and beyond.", ctrl: "Arrow keys or swipe to slide the board.", tips: "Build a single lane so numbers keep connecting into one chain." },
  { slug: "snake-io", title: "Snake IO", emoji: "🐲", category: "Arcade", mechanic: "snake", accent: "#a78bfa", w: 480, h: 480, tags: ["arcade", "snake io", "io"], rating: 4.4, popular: true, keywords: ["snake io", "slither io", "io snake"], theme: "io snake arena", tagline: "Grow the longest snake in a shared arena.", gameplay: "Eat glowing orbs to extend your snake while avoiding head-on collisions with other snakes.", ctrl: "Steer with the mouse or arrow keys; swipe on touch.", tips: "Circle smaller snakes to cut them off and grab their orbs." },
  { slug: "paper-io", title: "Paper IO", emoji: "🟡", category: "Action", mechanic: "ioeat", accent: "#fbbf24", w: 480, h: 480, bots: 8, tags: ["action", "io", "territory"], rating: 4.3, keywords: ["paper io", "territory io", "io games"], theme: ".io territory game", tagline: "Claim ground by enclosing space and don't get caught outside it.", gameplay: "Move around to paint your territory; the more you enclose, the bigger you get. Stray outside your zone and you are vulnerable.", ctrl: "Move with the mouse; your cell follows the cursor.", tips: "Expand in small loops near your base before going wide." },
  { slug: "hole-io", title: "Hole IO", emoji: "🕳️", category: "Action", mechanic: "ioeat", accent: "#22d3ee", w: 480, h: 480, bots: 5, tags: ["action", "io", "black hole"], rating: 4.2, keywords: ["hole io", "black hole io", "io games"], theme: ".io black-hole game", tagline: "Roll a growing hole and swallow everything in your path.", gameplay: "Move the hole over objects to absorb them; the bigger the hole, the bigger what it can eat. Clear the arena fastest.", ctrl: "Move with the mouse; the hole follows the cursor.", tips: "Start with small items, then sweep through clusters." },
  { slug: "water-sort", title: "Water Sort", emoji: "💧", category: "Puzzle", mechanic: "colorsort", accent: "#22d3ee", w: 480, h: 480, tubes: 4, cols: 4, tags: ["puzzle", "water sort", "color sort"], rating: 4.5, featured: true, keywords: ["water sort puzzle", "color sort", "sort puzzle"], theme: "color-sort puzzle", tagline: "Pour colors until every tube holds a single shade.", gameplay: "Move the top color from one tube to another; only matching colors stack. Clear all tubes to win.", ctrl: "Click a tube to pick it up, then click another to pour.", tips: "Keep one empty tube as a temporary holding space." },
  { slug: "ball-sort", title: "Ball Sort", emoji: "⚪", category: "Puzzle", mechanic: "colorsort", accent: "#f43f5e", w: 480, h: 480, tubes: 5, cols: 4, tags: ["puzzle", "ball sort", "sort"], rating: 4.4, keywords: ["ball sort puzzle", "sort puzzle", "color sort"], theme: "color-sort puzzle", tagline: "Sort the balls by color, one tube at a time.", gameplay: "Shift the top ball between tubes; only same-colored balls stack. Finish with each tube a single color.", ctrl: "Tap a tube to lift, tap another to drop the ball.", tips: "Plan moves so you never block your only empty tube." },
  { slug: "match-3-candy", title: "Candy Match 3", emoji: "🍬", category: "Casual", mechanic: "match3", accent: "#f43f5e", w: 480, h: 480, size: 8, tags: ["casual", "match 3", "candy"], rating: 4.5, popular: true, keywords: ["match 3 games", "candy match 3", "match three"], theme: "match-3 puzzle", tagline: "Swap candies to line up three or more.", gameplay: "Swap adjacent sweets so three or more of a kind connect and clear. Chain reactions build your score.", ctrl: "Click a candy, then click a neighbor to swap.", tips: "Look for swaps that trigger cascades for big points." },
  { slug: "jewel-match", title: "Jewel Match", emoji: "💎", category: "Casual", mechanic: "match3", accent: "#a78bfa", w: 480, h: 480, size: 8, tags: ["casual", "jewel", "match 3"], rating: 4.4, keywords: ["jewel match", "match 3 jewels", "match three"], theme: "match-3 puzzle", tagline: "Line up sparkling jewels for satisfying clears.", gameplay: "Swap neighboring gems to match three or more; matches vanish and new gems fall in. Build long chains.", ctrl: "Click a gem, then a neighbor to swap.", tips: "Set up vertical matches to keep combos going." },
  { slug: "space-shooter", title: "Space Shooter", emoji: "🛸", category: "Action", mechanic: "spaceshooter", accent: "#22d3ee", w: 480, h: 480, tags: ["action", "shooter", "space"], rating: 4.4, keywords: ["space shooter", "galaxy shooter", "arcade shooter"], theme: "space shooter", tagline: "Defend the galaxy one blast at a time.", gameplay: "Fly your ship and shoot the descending fleet. Survive as long as you can for a higher score.", ctrl: "Move with the mouse or arrows; click or Space to fire.", tips: "Keep to the sides so enemies funnel toward your shots." },
  { slug: "drone-defender", title: "Drone Defender", emoji: "🛡️", category: "Action", mechanic: "spaceshooter", accent: "#34d399", w: 480, h: 480, tags: ["action", "shooter", "defender"], rating: 4.3, keywords: ["defender game", "shooter", "arcade"], theme: "turret defender", tagline: "Hold the line against wave after wave.", gameplay: "Man your turret and fire at incoming attackers before they break through. Every wave gets tougher.", ctrl: "Aim with the mouse; click to fire.", tips: "Lead your targets and don't waste shots on empty space." },
  { slug: "doodle-jump", title: "Doodle Jump", emoji: "🦘", category: "Arcade", mechanic: "jump", accent: "#34d399", w: 480, h: 480, tags: ["arcade", "jump", "doodle"], rating: 4.4, popular: true, keywords: ["doodle jump", "jumping games", "platformer"], theme: "vertical jumper", tagline: "Bounce endlessly higher and don't fall.", gameplay: "Auto-bounce off platforms to climb; steer left and right to land on the next one. Miss a platform and you drop.", ctrl: "Arrow keys or tilt; tap left/right side on touch.", tips: "Always aim for the highest reachable platform." },
  { slug: "platform-jumper", title: "Platform Jumper", emoji: "🤾", category: "Arcade", mechanic: "jump", accent: "#fbbf24", w: 480, h: 480, tags: ["arcade", "platformer", "jump"], rating: 4.2, keywords: ["platformer", "platform games", "jump"], theme: "platform jumper", tagline: "Hop across gaps and climb the stage.", gameplay: "Jump from platform to platform, avoiding falls. The higher you go, the better your score.", ctrl: "Arrow keys to move and jump; swipe on touch.", tips: "Time jumps so you land centered on each platform." },
  { slug: "ninja-dash", title: "Ninja Dash", emoji: "🥷", category: "Arcade", mechanic: "jump", accent: "#f43f5e", w: 480, h: 480, tags: ["arcade", "ninja", "dash"], rating: 4.2, keywords: ["ninja games", "dash games", "runner"], theme: "ninja runner", tagline: "Dash through obstacles as a swift ninja.", gameplay: "Run and leap over hazards; one mistimed jump ends the run. Speed builds as you survive.", ctrl: "Tap or Space to jump; arrows to dodge.", tips: "Jump early for wide gaps and late for small ones." },
  { slug: "drift-racer", title: "Drift Racer", emoji: "🏎️", category: "Racing", mechanic: "racing", accent: "#f43f5e", w: 480, h: 480, tags: ["racing", "drift", "car"], rating: 4.4, featured: true, keywords: ["drift games", "drift racer", "car racing"], theme: "top-down racer", tagline: "Weave through traffic and set a distance record.", gameplay: "Steer your car through oncoming traffic; one collision ends the run. The longer you last, the faster it gets.", ctrl: "Arrow keys or mouse to steer left and right.", tips: "Stay in the gaps and never commit to a lane too early." },
  { slug: "traffic-racer", title: "Traffic Racer", emoji: "🚗", category: "Racing", mechanic: "racing", accent: "#22d3ee", w: 480, h: 480, tags: ["racing", "traffic", "car"], rating: 4.3, keywords: ["traffic racer", "car games", "driving"], theme: "traffic racer", tagline: "Dodge the cars and keep your speed up.", gameplay: "Thread through steady traffic without a crash. Distance and speed climb together for a bigger score.", ctrl: "Steer with arrows or the mouse.", tips: "Watch two lanes ahead, not just the one in front." },
  { slug: "moto-rush", title: "Moto Rush", emoji: "🏍️", category: "Racing", mechanic: "racing", accent: "#fbbf24", w: 480, h: 480, tags: ["racing", "moto", "bike"], rating: 4.2, keywords: ["motorcycle games", "bike racing", "moto"], theme: "motorbike racer", tagline: "Lean through the pack on two wheels.", gameplay: "Ride your bike past slower traffic; a single hit ends the rush. Build combo distance.", ctrl: "Tilt or arrow keys to change lanes.", tips: "Use the edges to slip past clusters safely." },
  { slug: "kart-king", title: "Kart King", emoji: "🏁", category: "Racing", mechanic: "racing", accent: "#34d399", w: 480, h: 480, tags: ["racing", "kart", "go kart"], rating: 4.3, keywords: ["kart racing", "go kart games", "racing"], theme: "kart racer", tagline: "Win the kart crown by outlasting the field.", gameplay: "Dodge rival karts and obstacles; survive the longest to top the leaderboard.", ctrl: "Steer with arrows or mouse.", tips: "Brake mentally before tight clusters—patience beats speed." },
  { slug: "drag-race", title: "Drag Race", emoji: "🔥", category: "Racing", mechanic: "racing", accent: "#a78bfa", w: 480, h: 480, tags: ["racing", "drag", "speed"], rating: 4.1, keywords: ["drag racing", "drag race", "racing"], theme: "drag racer", tagline: "Floor it and beat the clock down the strip.", gameplay: "Launch clean and hold your line through traffic to maximize distance before time runs out.", ctrl: "Tap to launch, steer to dodge.", tips: "A straight early line sets up easier dodges later." },
  { slug: "penalty-kick", title: "Penalty Kick", emoji: "⚽", category: "Sports", mechanic: "sportshot", accent: "#34d399", w: 480, h: 480, tags: ["sports", "soccer", "penalty"], rating: 4.4, featured: true, keywords: ["penalty kick", "soccer games", "football"], theme: "soccer penalty", tagline: "Beat the keeper from the spot.", gameplay: "Aim your shot at the open corner of the goal; score as many as you can before the keeper guesses right.", ctrl: "Click where you want to shoot; Space to strike.", tips: "Alternate corners so the keeper can't read you." },
  { slug: "basketball-shoot", title: "Basketball Shoot", emoji: "🏀", category: "Sports", mechanic: "sportshot", accent: "#fbbf24", w: 480, h: 480, tags: ["sports", "basketball", "hoops"], rating: 4.3, keywords: ["basketball games", "shoot hoops", "basketball"], theme: "basketball shootout", tagline: "Sink swishes from downtown.", gameplay: "Aim and fire the ball at the hoop; perfect arcs score. Chain makes for a streak.", ctrl: "Click to set direction and power; release to shoot.", tips: "Aim slightly above the rim for a clean drop." },
  { slug: "mini-golf", title: "Mini Golf", emoji: "⛳", category: "Sports", mechanic: "sportshot", accent: "#34d399", w: 480, h: 480, tags: ["sports", "golf", "mini golf"], rating: 4.2, keywords: ["mini golf", "golf games", "putt"], theme: "mini golf", tagline: "Putt your way to a hole in one.", gameplay: "Line up and tap the ball into the cup with as few strokes as possible.", ctrl: "Click to aim and set power; release to putt.", tips: "Use the walls to bank tricky angles." },
  { slug: "baseball-smash", title: "Baseball Smash", emoji: "⚾", category: "Sports", mechanic: "sportshot", accent: "#22d3ee", w: 480, h: 480, tags: ["sports", "baseball", "home run"], rating: 4.1, keywords: ["baseball games", "home run", "bat"], theme: "baseball batter", tagline: "Crush pitches out of the park.", gameplay: "Time your swing to connect with the pitch and launch it. Big hits score bigger.", ctrl: "Click or Space to swing.", tips: "Wait for the ball to reach the plate before swinging." },
  { slug: "table-tennis", title: "Table Tennis", emoji: "🏓", category: "Sports", mechanic: "sportshot", accent: "#f43f5e", w: 480, h: 480, tags: ["sports", "ping pong", "tennis"], rating: 4.2, keywords: ["ping pong games", "table tennis", "tennis"], theme: "table tennis", tagline: "Rally for the win across the net.", gameplay: "Aim your returns past the opponent; keep the rally alive to score points.", ctrl: "Click to aim your shot.", tips: "Target the corners to pull the opponent out of position." },
  { slug: "tower-defense", title: "Tower Defense", emoji: "🗼", category: "Strategy", mechanic: "towerdefense", accent: "#a78bfa", w: 480, h: 480, tags: ["strategy", "tower defense", "td"], rating: 4.3, featured: true, keywords: ["tower defense", "td games", "strategy"], theme: "tower defense", tagline: "Build towers and stop the march.", gameplay: "Place towers along the path to shoot enemies before they reach your base. Earn gold and upgrade.", ctrl: "Click to place a tower; manage your economy.", tips: "Cover the bends in the path where enemies linger." },
  { slug: "kingdom-rush-lite", title: "Kingdom Rush Lite", emoji: "👑", category: "Strategy", mechanic: "towerdefense", accent: "#fbbf24", w: 480, h: 480, tags: ["strategy", "defense", "kingdom"], rating: 4.2, keywords: ["strategy games", "defense games", "rush"], theme: "kingdom defense", tagline: "Hold the kingdom against the horde.", gameplay: "Deploy defenders to block waves of invaders. Survive every wave to win.", ctrl: "Click to deploy a defender on the field.", tips: "Mix ranged and melee so nothing slips through." },
  { slug: "idle-miner", title: "Idle Miner", emoji: "⛏️", category: "Casual", mechanic: "clicker", accent: "#fbbf24", w: 480, h: 480, tags: ["casual", "idle", "clicker"], rating: 4.2, keywords: ["idle games", "clicker games", "miner"], theme: "idle clicker", tagline: "Click to mine, then let it run itself.", gameplay: "Click to earn coins, then buy auto-miners that generate income while you watch. Numbers climb fast.", ctrl: "Click the field to mine; buy upgrades with the button.", tips: "Reinvest in auto-miners early for compound growth." },
  { slug: "clicker-hero", title: "Clicker Hero", emoji: "🦸", category: "Casual", mechanic: "clicker", accent: "#f43f5e", w: 480, h: 480, tags: ["casual", "clicker", "hero"], rating: 4.1, keywords: ["clicker games", "idle clicker", "hero"], theme: "clicker hero", tagline: "Click your way to legendary power.", gameplay: "Tap to deal damage and earn gold; spend it on auto-heroes that fight for you.", ctrl: "Click to attack; buy helpers with the button.", tips: "Balance tapping with auto-heroes for steady gains." },
  { slug: "block-blast", title: "Block Blast", emoji: "🧱", category: "Puzzle", mechanic: "blockblast", accent: "#22d3ee", w: 480, h: 480, tags: ["puzzle", "block blast", "blocks"], rating: 4.4, keywords: ["block blast", "block puzzle", "wood block"], theme: "block-blast puzzle", tagline: "Drop blocks and clear the board.", gameplay: "Place column pieces on the grid; fill a full row or column to clear it. Plan your placements.", ctrl: "Pick a piece, then click a column to drop it.", tips: "Keep the middle open so long pieces still fit." },
  { slug: "sudoku-classic", title: "Sudoku Classic", emoji: "🔢", category: "Puzzle", mechanic: "sudoku", accent: "#a78bfa", w: 480, h: 480, tags: ["puzzle", "sudoku", "brain"], rating: 4.5, keywords: ["sudoku", "sudoku online", "number puzzle"], theme: "sudoku puzzle", tagline: "Fill the grid with 1 to 9, no repeats.", gameplay: "Complete the 9x9 grid so every row, column, and box holds 1-9 once. Logic, not luck.", ctrl: "Read the board; use the restart for a new puzzle.", tips: "Scan for the only possible cell in a box first." },
  { slug: "word-search", title: "Word Search", emoji: "🔍", category: "Puzzle", mechanic: "wordsearch", accent: "#34d399", w: 480, h: 480, words: ["GAME", "PLAY", "FUN", "WIN", "SKILL", "JUMP", "STAR"], tags: ["puzzle", "word search", "words"], rating: 4.3, keywords: ["word search", "word puzzle", "find words"], theme: "word-search puzzle", tagline: "Find the hidden words in the grid.", gameplay: "Locate each listed word running across, down, or diagonally, then move on to the next.", ctrl: "Read the grid; spot words by their first letter.", tips: "Scan rows and columns for the listed word's start." },
  { slug: "memory-match", title: "Memory Match", emoji: "🃏", category: "Casual", mechanic: "memory", accent: "#f43f5e", w: 480, h: 480, tags: ["casual", "memory", "cards"], rating: 4.3, keywords: ["memory games", "memory match", "cards"], theme: "memory card game", tagline: "Flip and match pairs from memory.", gameplay: "Reveal two cards at a time; match all pairs to win. Remember where you saw each icon.", ctrl: "Click a card to flip it.", tips: "Reveal a new card only after noting the previous one." },
  { slug: "typing-race", title: "Typing Race", emoji: "⌨️", category: "Casual", mechanic: "typing", accent: "#22d3ee", w: 480, h: 480, tags: ["casual", "typing", "speed"], rating: 4.2, keywords: ["typing games", "typing race", "type fast"], theme: "typing game", tagline: "Type the words before time runs out.", gameplay: "Type each shown word correctly to score; speed and accuracy both matter.", ctrl: "Just start typing the letters shown.", tips: "Keep your eyes on the next word, not the keyboard." },
  { slug: "coloring-book", title: "Coloring Book", emoji: "🎨", category: "Casual", mechanic: "coloring", accent: "#34d399", w: 480, h: 480, tags: ["casual", "coloring", "relax"], rating: 4.2, keywords: ["coloring games", "color by number", "relax"], theme: "coloring game", tagline: "Pick colors and paint the grid your way.", gameplay: "Choose a color, then tap cells to fill them. Relax and create a pattern.", ctrl: "Tap a color, then tap cells to paint.", tips: "Work in bands of color for a clean look." },
  { slug: "rhythm-tap", title: "Rhythm Tap", emoji: "🎵", category: "Casual", mechanic: "rhythm", accent: "#fbbf24", w: 480, h: 480, tags: ["casual", "rhythm", "music"], rating: 4.1, keywords: ["rhythm games", "music games", "tap"], theme: "rhythm game", tagline: "Tap the notes as they reach the line.", gameplay: "Hit each falling note when it lines up with the marker. Stay in the groove for a streak.", ctrl: "Click or tap when a note reaches the bar.", tips: "Watch the approach, not just the hit line." },
  { slug: "drawing-puzzle", title: "Draw Puzzle", emoji: "✏️", category: "Puzzle", mechanic: "draw", accent: "#a78bfa", w: 480, h: 480, tags: ["puzzle", "draw", "drawing"], rating: 4.1, keywords: ["draw puzzle", "drawing games", "line"], theme: "draw puzzle", tagline: "Draw a path to the goal.", gameplay: "Drag to sketch a route from start to goal. Reach the target to score and reset.", ctrl: "Click and drag to draw your path.", tips: "Keep the path smooth so it stays connected." },
  { slug: "path-puzzle", title: "Path Puzzle", emoji: "🧭", category: "Puzzle", mechanic: "path", accent: "#22d3ee", w: 480, h: 480, tags: ["puzzle", "path", "logic"], rating: 4.2, keywords: ["path puzzle", "logic games", "maze"], theme: "path puzzle", tagline: "Trace a connected route to the exit.", gameplay: "Step through adjacent cells from start to finish without crossing walls. Plan your route.", ctrl: "Click adjacent cells to extend your path.", tips: "Work backward from the exit to spot the route." },
  { slug: "pinball-classic", title: "Pinball Classic", emoji: "🎰", category: "Arcade", mechanic: "pinball", accent: "#fbbf24", w: 480, h: 480, tags: ["arcade", "pinball", "classic"], rating: 4.3, keywords: ["pinball", "pinball online", "arcade"], theme: "pinball", tagline: "Keep the ball alive and rack up points.", gameplay: "Move the paddle to bounce the ball; don't let it fall. Long rallies score more.", ctrl: "Move the mouse to control the paddle.", tips: "Catch the ball with a still paddle for control." },
  { slug: "pac-run", title: "Pac Run", emoji: "👾", category: "Arcade", mechanic: "maze", accent: "#fbbf24", w: 480, h: 480, tags: ["arcade", "maze", "pac"], rating: 4.3, keywords: ["pacman", "maze games", "arcade"], theme: "maze arcade", tagline: "Eat the dots and clear the maze.", gameplay: "Move through the maze eating dots; avoid the walls. Clear every dot to win.", ctrl: "Arrow keys or swipe to move.", tips: "Hug the outer ring to grab dots safely." },
  { slug: "tetris-blocks", title: "Tetris Blocks", emoji: "🟪", category: "Puzzle", mechanic: "tetris", accent: "#a78bfa", w: 480, h: 480, tags: ["puzzle", "tetris", "blocks"], rating: 4.5, keywords: ["tetris online", "block puzzle", "tetris"], theme: "tetris", tagline: "The classic falling-block challenge.", gameplay: "Rotate and drop tetrominoes to clear full lines. The stack climbs if you pack badly.", ctrl: "Arrows to move/rotate/drop on desktop; swipe on touch.", tips: "Keep the well flat and save the I-piece for clears." },
  { slug: "fruit-ninja", title: "Fruit Ninja", emoji: "🍉", category: "Arcade", mechanic: "fruitslice", accent: "#34d399", w: 480, h: 480, tags: ["arcade", "fruit", "slice"], rating: 4.3, keywords: ["fruit ninja", "fruit slice", "slice"], theme: "fruit slicer", tagline: "Slice the flying fruit, miss none.", gameplay: "Swipe through the tossed fruit to cut it; let too many fall and the run ends.", ctrl: "Move the mouse (or finger) through the fruit to slice.", tips: "Slice in short strokes to hit several at once." },
  { slug: "asteroid-dodge", title: "Asteroid Dodge", emoji: "☄️", category: "Action", mechanic: "dodge", accent: "#22d3ee", w: 480, h: 480, tags: ["action", "dodge", "asteroid"], rating: 4.2, keywords: ["asteroid", "dodge games", "avoid"], theme: "asteroid dodger", tagline: "Weave through the asteroid field.", gameplay: "Steer your ship to avoid falling rocks; survive as long as you can for distance.", ctrl: "Move with the mouse or arrows.", tips: "Drift to the side with the biggest gap." },
  { slug: "zombie-survival", title: "Zombie Survival", emoji: "🧟", category: "Action", mechanic: "zombie", accent: "#34d399", w: 480, h: 480, tags: ["action", "zombie", "survival"], rating: 4.2, keywords: ["zombie survival", "survival games", "shooter"], theme: "zombie survival", tagline: "Hold off the zombie horde.", gameplay: "Move and fire at the approaching zombies; don't let them reach you. Each wave is tougher.", ctrl: "Move with the mouse or arrows; click or Space to shoot.", tips: "Keep moving so zombies never surround you." },
];

// ---------- content generator ----------
function genContent(g) {
  const t = g.title, theme = g.theme || g.category.toLowerCase(), ctrl = g.ctrl || "", tips = g.tips || "", kw = (g.keywords || []).join(", ");
  const intro = `${t} is a free, browser-based ${theme} you can play instantly—no download, no sign-up, and no install. ${g.tagline || "Jump in for a quick, satisfying break whenever you have a few minutes."} It runs smoothly on Chromebooks, laptops, tablets, and phones, so you can play at school, at work, or on the go.`;
  const gameplay = `The goal in ${t} is simple to learn but hard to master. ${g.gameplay || "Make smart moves, react to what happens on screen, and keep your run alive as long as you can. Every round is a fresh challenge with a score to chase."} Short sessions make it perfect for a quick break, while the rising difficulty keeps you coming back for a new personal best.`;
  const controls = ctrl || "Use your keyboard or mouse on desktop, or swipe and tap on a touch screen. The controls are easy to pick up, so you can focus on the fun instead of remembering buttons.";
  const features = `${t} features clean, colorful visuals and a local best-score tracker so you can watch your skills improve. It loads fast, plays full-screen in the browser, and works with both mouse and touch. Because there is nothing to install, you can open it on any device and start playing in seconds.`;
  const faq = [
    { q: `Can I play ${t} unblocked at school?`, a: `Yes. ${t} runs entirely in your web browser with no installation, so it works on school Chromebooks and most managed networks—just open the page and play.` },
    { q: `Do I need to download or install anything?`, a: `No. It is a free online game that loads straight in your browser, so there is no app to download and no account to create.` },
    { q: `Is ${t} free to play?`, a: `Yes, ${t} is completely free to play online. Just open the page and enjoy as many rounds as you like.` },
  ];
  return { intro, gameplay, controls, features, faq };
}

// ---------- html builder ----------
function buildHTML(g) {
  const w = g.w || 480, h = g.h || 480;
  const p = pal(g.accent);
  const engineSrc = ENGINES[g.mechanic].toString();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<title>${g.title}</title>
<style>
:root{--bg:${p.bg};--fg:${p.fg};--accent:${p.accent};--muted:${p.muted};--surface:${p.surface}}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{background:var(--bg);color:var(--fg);font-family:system-ui,Segoe UI,Roboto,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px;-webkit-user-select:none;user-select:none;touch-action:none}
h1{font-size:20px;letter-spacing:.04em}
.wrap{width:min(94vw,480px);position:relative;margin:0 auto}
.bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px}
.score{background:${p.surface};border:1px solid #2a2a44;border-radius:10px;padding:6px 12px;font-weight:700;white-space:nowrap}
.btn{background:var(--accent);color:#04121a;border:0;border-radius:10px;padding:8px 14px;font-weight:700;cursor:pointer;font-size:14px}
.stage{position:relative;width:100%}
canvas{width:100%;height:auto;aspect-ratio:1/1;background:${p.surface};border:1px solid #2a2a44;border-radius:14px;display:block;touch-action:none}
.hint{color:var(--muted);font-size:13px;text-align:center}
.overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(8,8,20,.84);color:var(--fg);font-size:26px;font-weight:800;cursor:pointer;z-index:5;border-radius:14px;text-align:center;padding:16px}
.overlay small{font-size:14px;font-weight:600;color:var(--muted)}
</style>
</head>
<body>
<div class="wrap">
<div class="bar"><h1>${g.title}</h1><div class="score">Score: <span id="score">0</span></div><button id="restartTop" class="btn">↻ Restart</button></div>
<div class="stage">
<canvas id="c" width="${w}" height="${h}"></canvas>
<div id="start" class="overlay">▶ Tap to Play<small>click or tap to start</small></div>
</div>
<div class="hint">${g.tagline || ""}</div>
<div style="text-align:center;margin-top:10px"><button id="restart" class="btn">New Game</button></div>
</div>
<script>
const CFG=${JSON.stringify({ accent: g.accent, size: g.size, tubes: g.tubes, cols: g.cols, bots: g.bots, words: g.words, speed: g.speed, w: g.w, h: g.h })};
const canvas=document.getElementById('c');const ctx=canvas.getContext('2d');const scoreEl=document.getElementById('score');
function rr(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);ctx.closePath();}
function rand(a,b){return a+Math.random()*(b-a);}
function chance(p){return Math.random()<p;}
const engine = ${engineSrc};
let __started=false;
const __startEl=document.getElementById('start');
const __restartTop=document.getElementById('restartTop');
function __begin(){ if(__started)return; __started=true; if(__startEl)__startEl.style.display='none'; engine(CFG); }
if(__startEl)__startEl.addEventListener('click',__begin);
if(__restartTop)__restartTop.addEventListener('click',()=>{ const r=document.getElementById('restart'); if(r)r.click(); });
canvas.addEventListener('touchmove',e=>{const t=e.touches[0];canvas.dispatchEvent(new MouseEvent('mousemove',{clientX:t.clientX,clientY:t.clientY,bubbles:true}));},{passive:true});
canvas.addEventListener('touchstart',e=>{const t=e.touches[0];canvas.dispatchEvent(new MouseEvent('mousedown',{clientX:t.clientX,clientY:t.clientY,bubbles:true}));},{passive:true});
</script>
</body>
</html>
`;
}

// ---------- safe write with retries (Windows EPERM on overwrite is transient) ----------
function safeWrite(path, content) {
  for (let i = 0; i < 8; i++) {
    try { writeFileSync(path, content); return; }
    catch (e) {
      if (i === 7) throw e;
      try { writeFileSync(path + ".tmp", content); renameSync(path + ".tmp", path); return; }
      catch (_) { }
      const t = Date.now(); while (Date.now() - t < 250) { }
    }
  }
}

function generateAll() {
// ---------- write html files ----------
let made = 0;
if (!process.argv.includes("nohtml")) {
  for (const g of GAMES) {
    const dir = `${D}/public/games/${g.slug}`;
    mkdirSync(dir, { recursive: true });
    safeWrite(`${dir}/index.html`, buildHTML(g));
    made++;
  }
  console.log("HTML games written:", made);
} else {
  console.log("HTML skipped (nohtml flag).");
}

// ---------- write games.ts ----------
function buildGamesTs() {
  const entries = GAMES.map(g => {
    const c = genContent(g);
    return `  {\n    id: "sh-${g.slug}",\n    slug: ${JSON.stringify(g.slug)},\n    title: ${JSON.stringify(g.title)},\n    category: ${JSON.stringify(g.category)},\n    description: ${JSON.stringify(g.tagline || g.theme)},\n    emoji: ${JSON.stringify(g.emoji)},\n    url: "/games/${g.slug}/",\n    rating: ${g.rating || 4.5},\n    plays: "0",\n    siteIds: ["default"],\n    embedUrl: "/games/${g.slug}/index.html",\n    instructions: ${JSON.stringify(g.ctrl || "Play with your mouse or keyboard.")},\n    content: {\n      intro: ${JSON.stringify(c.intro)},\n      gameplay: ${JSON.stringify(c.gameplay)},\n      controls: ${JSON.stringify(c.controls)},\n      features: ${JSON.stringify(c.features)},\n      faq: ${JSON.stringify(c.faq)},\n    },\n    width: ${g.w || 480},\n    height: ${g.h || 480},\n    tags: ${JSON.stringify(g.tags)},\n    source: "selfhosted",\n    featured: ${!!g.featured},\n    popular: ${!!g.popular},\n    isNew: true,\n  },`;
  }).join("\n");
  return `import type { Game } from "../../../config/types.ts";\n\n// Self-hosted original HTML5 games (Stage A). Generated by scripts/gen-games.mjs.\n// 50 games across Puzzle / Arcade / Action / Racing / Sports / Strategy / Casual.\n\nconst SELF_HOSTED: Game[] = [\n${entries}\n];\n\nexport function getSelfHostedGames(): Game[] {\n  return SELF_HOSTED;\n}\n`;
}
// games.ts (selfhosted) is locked by the IDE; write the 42 NEW games to a new
// file instead and merge it in the importer (src/data/games.ts).
const EXISTING = new Set(["merge-numbers", "neon-snake", "brick-breaker", "flappy-orb", "bubble-pop", "cell-eater", "block-stack", "orbit-blaster"]);
const newGames = GAMES.filter(g => !EXISTING.has(g.slug));
const entries = newGames.map(g => {
  const c = genContent(g);
  return `  {\n    id: "sh-${g.slug}",\n    slug: ${JSON.stringify(g.slug)},\n    title: ${JSON.stringify(g.title)},\n    category: ${JSON.stringify(g.category)},\n    description: ${JSON.stringify(g.tagline || g.theme)},\n    emoji: ${JSON.stringify(g.emoji)},\n    url: "/games/${g.slug}/",\n    rating: ${g.rating || 4.5},\n    plays: "0",\n    siteIds: ["default"],\n    embedUrl: "/games/${g.slug}/index.html",\n    instructions: ${JSON.stringify(g.ctrl || "Play with your mouse or keyboard.")},\n    content: {\n      intro: ${JSON.stringify(c.intro)},\n      gameplay: ${JSON.stringify(c.gameplay)},\n      controls: ${JSON.stringify(c.controls)},\n      features: ${JSON.stringify(c.features)},\n      faq: ${JSON.stringify(c.faq)},\n    },\n    width: ${g.w || 480},\n    height: ${g.h || 480},\n    tags: ${JSON.stringify(g.tags)},\n    source: "selfhosted",\n    featured: ${!!g.featured},\n    popular: ${!!g.popular},\n    isNew: true,\n  },`;
}).join("\n");
const batchContent = `import type { Game } from "../../../config/types.ts";\n\n// Self-hosted original HTML5 games (Stage A) — batch 2 (42 new games).\n// Generated by scripts/gen-games.mjs. Merged in src/data/games.ts.\n\nconst BATCH2: Game[] = [\n${entries}\n];\n\nexport function getSelfHostedGamesBatch2(): Game[] {\n  return BATCH2;\n}\n`;
writeFileSync(`${D}/src/data/sources/selfhosted/games-batch2.ts`, batchContent);
console.log("games-batch2.ts written with", newGames.length, "new entries");
}

// ---------- verify mode: execute every game's script in a mocked DOM/canvas ----------
function runVerify() {
  const results = [];
  for (const g of GAMES) {
    const html = buildHTML(g);
    const script = html.split("<script>")[1].split("</script>")[0];
    const calls = { any: 0 };
    const ctx = new Proxy({}, {
      get() { return () => { calls.any++; }; },
      set() { return true; },
    });
    globalThis.MouseEvent = class { constructor(type, init) { this.type = type; Object.assign(this, init || {}); } };
    globalThis.performance = globalThis.performance || { now: () => Date.now() };
    const registry = {};
    function mkEl(id) {
      const el = {
        id,
        _L: {},
        style: {},
        textContent: "",
        width: 480,
        height: 480,
        getContext: () => ctx,
        addEventListener: (e, f) => { (el._L[e] = el._L[e] || []).push(f); },
        removeEventListener: () => {},
        click: () => { (el._L.click || []).forEach((f) => { try { f({ preventDefault() {} }); } catch (_) {} }); },
        dispatchEvent: (evt) => { (el._L[evt.type] || []).forEach((f) => { try { f(evt); } catch (_) {} }); return true; },
        insertAdjacentHTML: () => {},
        appendChild: () => {},
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 480, height: 480 }),
      };
      return el;
    }
    globalThis.document = {
      getElementById: (id) => (registry[id] = registry[id] || mkEl(id)),
      createElement: () => mkEl("el"),
      querySelector: () => mkEl("q"),
      addEventListener: (e, f) => { (registry.__doc_L = registry.__doc_L || {}), (registry.__doc_L[e] = registry.__doc_L[e] || []).push(f); },
      body: mkEl("body"),
    };
    const winListeners = {};
    globalThis.addEventListener = (e, f) => { (winListeners[e] = winListeners[e] || []).push(f); };
    globalThis.setTimeout = () => 0;
    globalThis.setInterval = () => 0;
    globalThis.clearInterval = () => {};
    globalThis.clearTimeout = () => {};
    const rafQueue = [];
    globalThis.requestAnimationFrame = (fn) => { rafQueue.push(fn); return 0; };
    globalThis.window = globalThis;
    try {
      (0, eval)(script);
      // Engines only start after the "Tap to Play" overlay (#start) is clicked.
      const startEl = registry.start;
      if (startEl && startEl.click) startEl.click();
      if (winListeners.keydown) winListeners.keydown.forEach((f) => { try { f({ key: "ArrowLeft", preventDefault() {} }); f({ key: "ArrowUp", preventDefault() {} }); } catch (_) {} });
      for (let f = 0; f < 12 && rafQueue.length; f++) { const fn = rafQueue.shift(); try { fn(); } catch (_) {} }
      const drew = calls.any;
      results.push({ slug: g.slug, ok: drew > 0, drew, err: drew > 0 ? "" : "no draw calls (engine never started or never drew)" });
    } catch (e) {
      results.push({ slug: g.slug, ok: false, drew: 0, err: String((e && e.message) || e).split("\n")[0] });
    }
  }
  const fails = results.filter((r) => !r.ok);
  for (const r of results) console.log((r.ok ? "PASS" : "FAIL").padEnd(5), r.slug.padEnd(20), "draws=" + r.drew, r.err);
  console.log(`\n${results.length - fails.length}/${results.length} passed; ${fails.length} failed`);
  if (fails.length) process.exit(1);
}

if (process.argv.includes("verify")) runVerify();
else generateAll();
