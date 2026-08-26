# 🐦 Flappy Bird

A classic Flappy Bird clone built with HTML5 Canvas, CSS, and vanilla JavaScript — no frameworks, no dependencies, works fully offline.

## 🎮 Play Now

**[Play Flappy Bird](https://pierrunoyt.github.io/flappybird/)**

## 🕹️ How to Play

- **Click**, **tap**, or press **Space** / **Arrow Up** to flap
- Navigate through the pipes without hitting them
- Each pipe passed scores 1 point
- Try to beat your best score — it's saved between sessions!

## ✨ Features

- **Frame-rate independent physics** — delta-time based movement plays identically on 60Hz, 120Hz, or 144Hz displays
- Physics-based flapping with gravity and rotation tilt
- Animated bird with flapping wings and idle bobbing on the start screen
- Circle-vs-rectangle collision detection matched to the bird's shape
- Procedurally spawned pipes with randomized gaps and consistent spacing
- Drifting clouds and a scrolling grass strip
- Best score persisted in `localStorage`
- Crisp HTML/CSS overlays for the start and game-over screens
- Zero external dependencies — no fonts, libraries, or network required

## 🛠️ Tech Stack

- HTML5 Canvas
- CSS3
- Vanilla JavaScript

## 📁 Project Structure

```
flappybird/
├── index.html   # Page markup and menu overlays
├── style.css    # Page layout and overlay styles
├── script.js    # Game logic, physics, and rendering
├── LICENSE      # MIT License
└── README.md    # This file
```

## 🚀 Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/PierrunoYT/flappybird.git
   ```

2. Open `index.html` in your browser, or serve with a local server:
   ```bash
   cd flappybird
   python -m http.server 8080
   ```

3. Navigate to `http://localhost:8080`

## ⚙️ Tuning

All gameplay constants live at the top of `script.js` — gravity, flap strength, pipe speed, gap size, and spacing — so difficulty is easy to tweak.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**PierrunoYT**

- GitHub: [@PierrunoYT](https://github.com/PierrunoYT)
