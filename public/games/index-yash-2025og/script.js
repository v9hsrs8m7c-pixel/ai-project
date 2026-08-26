const gameBoard = document.getElementById("game-board");
const restartBtn = document.getElementById("restart-btn");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const gameOverPopup = document.getElementById("game-over-popup");
const finalScoreDisplay = document.getElementById("final-score");
const closePopupBtn = document.getElementById("close-popup");
const restartPopupBtn = document.getElementById("restart-popup");
const moveSound = new Audio('sound.mp3'); 

const size = 4;
let tiles = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

highScoreDisplay.textContent = highScore;

let startX, startY, endX, endY;

function createBoard() {
  tiles = Array(size * size).fill(null);
  gameBoard.innerHTML = "";
  for (let i = 0; i < tiles.length; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    gameBoard.appendChild(tile);
  }
  score = 0;
  updateScore();
  addNewTile();
  addNewTile();
}

function addNewTile() {
  const emptyTiles = tiles
    .map((value, index) => (value === null ? index : null))
    .filter((value) => value !== null);

  if (emptyTiles.length > 0) {
    const randomIndex = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    tiles[randomIndex] = 2;
    updateBoard();
  }
}

function updateBoard() {
  const allTiles = document.querySelectorAll(".tile");
  allTiles.forEach((tile, index) => {
    const value = tiles[index];
    tile.textContent = value || "";
    tile.className = "tile";
    if (value) tile.classList.add(`tile-${value}`);
  });
}

function slide(row) {
  const filtered = row.filter((num) => num !== null);
  const missing = size - filtered.length;
  const zeros = Array(missing).fill(null);
  return filtered.concat(zeros);
}

function combine(row) {
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] && row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];
      row[i + 1] = null;
    }
  }
  return row;
}

function move(direction) {
  let hasMoved = false;

  for (let i = 0; i < size; i++) {
    let row = [];
    for (let j = 0; j < size; j++) {
      const index = direction === "left" || direction === "right"
        ? i * size + j
        : j * size + i;

      row.push(tiles[index]);
    }

    if (direction === "right" || direction === "down") row.reverse();

    const originalRow = [...row];
    row = slide(row);
    row = combine(row);
    row = slide(row);

    if (direction === "right" || direction === "down") row.reverse();

    for (let j = 0; j < size; j++) {
      const index = direction === "left" || direction === "right"
        ? i * size + j
        : j * size + i;

      if (tiles[index] !== row[j]) hasMoved = true;
      tiles[index] = row[j];
    }
  }

  if (hasMoved) addNewTile();
  updateScore();
  if (isGameOver()) showGameOverPopup();
}

function updateScore() {
  scoreDisplay.textContent = score;
  if (score > highScore) {
    highScore = score;
    highScoreDisplay.textContent = highScore;
    localStorage.setItem("highScore", highScore);
  }
}











function playMoveSound() {
  moveSound.play();
}

function move(direction) {
  let hasMoved = false;

  for (let i = 0; i < size; i++) {
    let row = [];
    for (let j = 0; j < size; j++) {
      const index = direction === "left" || direction === "right"
        ? i * size + j
        : j * size + i;

      row.push(tiles[index]);
    }

    if (direction === "right" || direction === "down") row.reverse();

    const originalRow = [...row];
    row = slide(row);
    row = combine(row);
    row = slide(row);

    if (direction === "right" || direction === "down") row.reverse();

    for (let j = 0; j < size; j++) {
      const index = direction === "left" || direction === "right"
        ? i * size + j
        : j * size + i;

      if (tiles[index] !== row[j]) hasMoved = true;
      tiles[index] = row[j];
    }

    if (originalRow.some((value, index) => value !== row[index])) {
      playMoveSound();
    }
  }

  if (hasMoved) addNewTile();
  updateScore();
  if (isGameOver()) showGameOverPopup();
}













function isGameOver() {
  return !tiles.includes(null);
}

function showGameOverPopup() {
  finalScoreDisplay.textContent = score;
  gameOverPopup.style.display = "flex";
}

restartBtn.addEventListener("click", createBoard);

closePopupBtn.addEventListener("click", () => {
  gameOverPopup.style.display = "none";
});

restartPopupBtn.addEventListener("click", () => {
  createBoard();
  gameOverPopup.style.display = "none";
});

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      move("up");
      break;
    case "ArrowDown":
      move("down");
      break;
    case "ArrowLeft":
      move("left");
      break;
    case "ArrowRight":
      move("right");
      break;
  }
  updateBoard();
});

gameBoard.addEventListener("mousedown", (event) => {
  startX = event.clientX;
  startY = event.clientY;
});

gameBoard.addEventListener("mouseup", (event) => {
  endX = event.clientX;
  endY = event.clientY;
  handleSwipe();
});

gameBoard.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
});

gameBoard.addEventListener("touchend", (event) => {
  const touch = event.changedTouches[0];
  endX = touch.clientX;
  endY = touch.clientY;
  handleSwipe();
});

function handleSwipe() {
  const deltaX = endX - startX;
  const deltaY = endY - startY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      move("right");
    } else {
      move("left");
    }
  } else {
    if (deltaY > 0) {
      move("down");
    } else {
      move("up");
    }
  }

  updateBoard();
}

restartBtn.addEventListener("click", createBoard);
createBoard();
