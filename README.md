### For the sake of my internship application at LFC, May 2025

# LFC Runner – Web Game

**LFC Runner** is a lightweight, responsive endless runner game inspired by the classic Dino game — reimagined with Les Freres Chaussettes (LFC) vibes. The game is built using the HTML5 Canvas API.

## Features

-  Animated LFC-themed player
-  Obstacles (ball images)
-  Increasing game speed over time
-  Supports keyboard and mobile touch input
-  Responsive design using screen scaling
-  Game over detection with player image swap
-  Score + high score tracking

## Folder Structure


project-root/
│
├── index.html
├── index.js
├── Player.js
├── Ground.js
├── BalliController.js
├── Score.js
├── Ball.js
├── /images/
│   ├── logo_lfc_no_bck.png
│   ├── logo_lfc_run_1.png
│   ├── logo_lfc_run_2.png
│   ├── logo_lfc_end.png
│   ├── world_cup_ball.png
│   ├── gold_ball.jpg
│   ├── bulk_balls.png
│   ├── logo_lfc.png
│   ├── stadium.png
│   └── running-track.jpg
└── README.md


## How to Play (you certainly know how to play dino, just pretend you don't and read, just, please ...)

1. **Start**: Tap the screen or press the **spacebar**.
2. **Jump**: Tap or press **space** to jump(long press to jump higher).
3. **Avoid**: Don't collide with the balls (obstacles)!
4. **Restart**: After a game over, tap or press space again.

## Tech Stack

- **JavaScript
- **HTML5 Canvas API**
- **No frameworks, no dependencies**

## Setup

1. Clone the repository

2. Open `index.html` in your browser (or use Live Server).

   No build tools or servers required.

OR, you can play the game at `https://mini-sad.github.io/` ( not sure it will be there forever)

##  Responsive Design

The game uses a dynamic scale ratio so it adjusts to different screen sizes (including mobile). Touch input is supported for mobile.

## Credits

Built with passion and motivation by Mini Sad, inspired by the T-Rex game developped byt the youtuber **coding with adam**.

Images and animations are customized for an LFC-themed experience for the sake of my internship application ..
