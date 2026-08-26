# Tetris Game

A classic Tetris game implementation using HTML5 Canvas, CSS, and JavaScript.

## Features

- Classic Tetris gameplay
- Next piece preview
- Score, level, and lines counter
- Increasing difficulty as you level up
- Responsive design for different screen sizes

## How to Play

1. Click the "Start" button or press "P" to begin
2. Use arrow keys to control the falling pieces:
   - Left/Right: Move horizontally
   - Down: Soft drop (faster fall)
   - Up: Rotate piece
   - Space: Hard drop (instant placement)
3. Complete lines to score points and increase your level
4. The game ends when the pieces stack up to the top

## Controls

- **Left/Right Arrow**: Move the piece horizontally
- **Down Arrow**: Accelerate the piece's descent (soft drop)
- **Up Arrow**: Rotate the piece
- **Space**: Hard drop (instantly place the piece at the lowest possible position)
- **P**: Pause/Resume the game

## Scoring System

- 1 line cleared: 100 × level points
- 2 lines cleared: 300 × level points
- 3 lines cleared: 500 × level points
- 4 lines cleared: 800 × level points

## Development

This game is built using:
- HTML5 Canvas for rendering
- JavaScript for game logic
- CSS for styling

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/gorillafunch/tetris-game.git
   ```
2. Open `index.html` in your browser

## License

This project is open source and available under the [MIT License](LICENSE).

## Future Improvements

- Add touch controls for mobile devices
- Implement high score tracking
- Add sound effects and music
- Add alternative game modes