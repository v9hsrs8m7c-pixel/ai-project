const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const finalScoreEl = document.getElementById("finalScore");
const bestScoreEl = document.getElementById("bestScore");

const W = canvas.width;
const H = canvas.height;

// --- Tuning ---
const GRAVITY = 1400;        // px/s^2
const FLAP_VELOCITY = -420;  // px/s
const PIPE_SPEED = 160;      // px/s
const PIPE_GAP = 150;        // px
const PIPE_WIDTH = 70;       // px
const PIPE_SPACING = 220;    // px between pipe pairs
const GROUND_HEIGHT = 80;    // px
const BIRD_X = 100;
const BIRD_RADIUS = 16;

// --- State ---
let state = "start"; // "start" | "playing" | "dead"
let bird, pipes, score, groundOffset, lastTime;
let best = Number(localStorage.getItem("flappyBest")) || 0;

function reset() {
  bird = { y: H / 2, vy: 0, rotation: 0, wingPhase: 0 };
  pipes = [];
  score = 0;
  groundOffset = 0;
  lastTime = null;
  spawnPipe(W + 100);
  spawnPipe(W + 100 + PIPE_SPACING);
  spawnPipe(W + 100 + PIPE_SPACING * 2);
}

function spawnPipe(x) {
  const margin = 60;
  const maxGapTop = H - GROUND_HEIGHT - PIPE_GAP - margin;
  const gapTop = margin + Math.random() * (maxGapTop - margin);
  pipes.push({ x, gapTop, scored: false });
}

function flap() {
  if (state === "start") {
    startGame();
    return;
  }
  if (state === "playing") {
    bird.vy = FLAP_VELOCITY;
    bird.wingPhase = 0;
  }
}

function startGame() {
  reset();
  state = "playing";
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  bird.vy = FLAP_VELOCITY;
}

function gameOver() {
  state = "dead";
  if (score > best) {
    best = score;
    localStorage.setItem("flappyBest", best);
  }
  finalScoreEl.textContent = score;
  bestScoreEl.textContent = best;
  gameOverScreen.classList.remove("hidden");
}

// --- Update ---
function update(dt) {
  if (state !== "playing") {
    // Idle bobbing on start screen
    if (state === "start") {
      bird.y = H / 2 + Math.sin(performance.now() / 300) * 8;
      bird.wingPhase += dt * 8;
    }
    return;
  }

  bird.vy += GRAVITY * dt;
  bird.y += bird.vy * dt;
  bird.rotation = Math.max(-0.5, Math.min(1.4, bird.vy / 500));
  bird.wingPhase += dt * 20;

  groundOffset = (groundOffset + PIPE_SPEED * dt) % 24;

  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED * dt;

    if (!pipe.scored && pipe.x + PIPE_WIDTH < BIRD_X) {
      pipe.scored = true;
      score++;
    }
  }

  // Recycle pipes
  if (pipes[0].x + PIPE_WIDTH < -10) {
    pipes.shift();
    spawnPipe(pipes[pipes.length - 1].x + PIPE_SPACING);
  }

  // Collisions
  if (bird.y + BIRD_RADIUS >= H - GROUND_HEIGHT) {
    bird.y = H - GROUND_HEIGHT - BIRD_RADIUS;
    gameOver();
    return;
  }
  if (bird.y - BIRD_RADIUS <= 0) {
    bird.y = BIRD_RADIUS;
    bird.vy = 0;
  }

  for (const pipe of pipes) {
    if (circleRectCollide(BIRD_X, bird.y, BIRD_RADIUS, pipe.x, 0, PIPE_WIDTH, pipe.gapTop) ||
        circleRectCollide(BIRD_X, bird.y, BIRD_RADIUS, pipe.x, pipe.gapTop + PIPE_GAP, PIPE_WIDTH, H - GROUND_HEIGHT - pipe.gapTop - PIPE_GAP)) {
      gameOver();
      return;
    }
  }
}

function circleRectCollide(cx, cy, r, rx, ry, rw, rh) {
  const nearestX = Math.max(rx, Math.min(cx, rx + rw));
  const nearestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < r * r;
}

// --- Render ---
function draw() {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#4ec0ca");
  sky.addColorStop(1, "#a8e4e8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  drawClouds();

  for (const pipe of pipes) drawPipe(pipe);

  drawGround();
  drawBird();

  // Score during play
  if (state !== "start") {
    ctx.font = "bold 42px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.strokeText(score, W / 2, 70);
    ctx.fillStyle = "#fff";
    ctx.fillText(score, W / 2, 70);
  }
}

function drawClouds() {
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  const t = performance.now() / 1000;
  for (let i = 0; i < 4; i++) {
    const x = ((i * 137 - t * 12) % (W + 120) + W + 120) % (W + 120) - 60;
    const y = 60 + i * 55;
    ctx.beginPath();
    ctx.ellipse(x, y, 34, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 22, y - 8, 22, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 22, y - 5, 20, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPipe(pipe) {
  const bottomY = pipe.gapTop + PIPE_GAP;
  drawPipeBody(pipe.x, 0, pipe.gapTop, true);
  drawPipeBody(pipe.x, bottomY, H - GROUND_HEIGHT - bottomY, false);
}

function drawPipeBody(x, y, height, isTop) {
  if (height <= 0) return;
  const capH = 26;

  const grad = ctx.createLinearGradient(x, 0, x + PIPE_WIDTH, 0);
  grad.addColorStop(0, "#5eb548");
  grad.addColorStop(0.3, "#8fd472");
  grad.addColorStop(0.7, "#5eb548");
  grad.addColorStop(1, "#3d7a2e");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, PIPE_WIDTH, height);

  // Cap (lip) at the gap edge
  const capY = isTop ? y + height - capH : y;
  ctx.fillRect(x - 4, capY, PIPE_WIDTH + 8, capH);
  ctx.strokeStyle = "#2d5a22";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 4, capY, PIPE_WIDTH + 8, capH);
  ctx.strokeRect(x, y, PIPE_WIDTH, height);
}

function drawGround() {
  const y = H - GROUND_HEIGHT;
  ctx.fillStyle = "#ded895";
  ctx.fillRect(0, y, W, GROUND_HEIGHT);

  // Grass strip
  ctx.fillStyle = "#7ec850";
  ctx.fillRect(0, y, W, 14);

  // Diagonal stripes scrolling with the game
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y, W, 14);
  ctx.clip();
  ctx.strokeStyle = "#5eb548";
  ctx.lineWidth = 8;
  for (let x = -24; x < W + 24; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x - groundOffset, y + 18);
    ctx.lineTo(x - groundOffset + 14, y - 4);
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = "#b8b06a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y + 14);
  ctx.lineTo(W, y + 14);
  ctx.stroke();
}

function drawBird() {
  ctx.save();
  ctx.translate(BIRD_X, bird.y);
  ctx.rotate(bird.rotation);

  // Body
  ctx.fillStyle = "#f8d347";
  ctx.beginPath();
  ctx.ellipse(0, 0, BIRD_RADIUS + 2, BIRD_RADIUS, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Wing (flapping)
  const wingY = Math.sin(bird.wingPhase) * 5;
  ctx.fillStyle = "#f0b429";
  ctx.beginPath();
  ctx.ellipse(-4, 2 + wingY, 9, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eye
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(7, -5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(9, -5, 3, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = "#f2701d";
  ctx.beginPath();
  ctx.moveTo(13, 0);
  ctx.lineTo(24, 3);
  ctx.lineTo(13, 8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// --- Main loop ---
function loop(timestamp) {
  if (lastTime === null) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // clamp to avoid tunneling on tab-switch
  lastTime = timestamp;

  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// --- Input ---
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    if (state === "dead") return; // use the button to restart
    flap();
  }
});

canvas.addEventListener("pointerdown", flap);
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

reset();
requestAnimationFrame(loop);
