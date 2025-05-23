import Player from "./Player.js";
import Ground from "./Ground.js";
import BalliController from "./BalliController.js";
import Score from "./Score.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const GAME_SPEED_START = 1; // 1.0
const GAME_SPEED_INCREMENT = 0.00001;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 1546 / 26; // 59.0
const PLAYER_HEIGHT = 1776 / 26; // 68.0
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_AND_BALL_SPEED = 0.5;

// balls obstacles config
const BALLI_CONFIG = [
  { width: 1000 / 19, height: 1000 / 19, image: "images/world_cup_ball.png" },
  { width: 500 / 13, height: 500 / 13, image: "images/gold_ball.png" },
  { width: 1500 / 16, height: 1159 / 16, image: "images/bulk_balls.png" },
];

const backgroundImage = new Image();
backgroundImage.src = "images/stadium.png";


//Game Objects
let player = null;
let ground = null;
let balliController = null;
let score = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameOver = false;
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;


function createSprites() {
  const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
  const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
  const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

  const groundWidthInGame = GROUND_WIDTH * scaleRatio;
  const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

  player = new Player(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio
  );

  ground = new Ground(
    ctx,
    groundWidthInGame,
    groundHeightInGame,
    GROUND_AND_BALL_SPEED,
    scaleRatio
  );

  const balliImages = BALLI_CONFIG.map((ball) => {
    const image = new Image();
    image.src = ball.image;
    return {
      image: image,
      width: ball.width * scaleRatio,
      height: ball.height * scaleRatio,
    };
  });

  balliController = new BalliController(
    ctx,
    balliImages,
    scaleRatio,
    GROUND_AND_BALL_SPEED
  );

  score = new Score(ctx, scaleRatio);
}

// Set the canvas size based on the screen size and the game size
function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}

setScreen();
//Use setTimeout on Safari mobile rotation otherwise works fine on desktop
window.addEventListener("resize", () => setTimeout(setScreen, 500));

if (screen.orientation) {
  screen.orientation.addEventListener("change", setScreen);
}

function getScaleRatio() {
  const screenHeight = Math.min(
    window.innerHeight,
    document.documentElement.clientHeight
  );

  const screenWidth = Math.min(
    window.innerWidth,
    document.documentElement.clientWidth
  );

  //window is wider than the game width
  if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
    return screenWidth / GAME_WIDTH;
  } else {
    return screenHeight / GAME_HEIGHT;
  }
}

// Show game over text when the game is over
function showGameOver() {
  const fontSize = 70 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "blue";
  const x = canvas.width / 4.5;
  const y = canvas.height / 2;
  ctx.fillText("GAME OVER", x, y);
}

// Setup event listeners for restarting the game
function setupGameReset() {
  if (!hasAddedEventListenersForRestart) {
    hasAddedEventListenersForRestart = true;

    setTimeout(() => {
      window.addEventListener("keyup", reset, { once: true });
      window.addEventListener("touchstart", reset, { once: true });
    }, 1000);
  }
}

// Reset game state
function reset() {
  hasAddedEventListenersForRestart = false;
  gameOver = false;
  waitingToStart = false;
  ground.reset();
  balliController.reset();
  score.reset();
  gameSpeed = GAME_SPEED_START;
}

// Show the start game text
function showStartGameText() {
  const fontSize = 40 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "blue";
  const x = canvas.width / 14;
  const y = canvas.height / 2;
  ctx.fillText("Tap Screen or Press Space To Start", x, y);
}

// Update game speed based on frame time delta
// This function is called in the game loop to adjust the game speed
function updateGameSpeed(frameTimeDelta) {
  gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT;
}

// Clear the screen and draw the background
function clearScreen() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Start the game loop
function gameLoop(currentTime) {
  if (previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }
  const frameTimeDelta = currentTime - previousTime;
  previousTime = currentTime;

  clearScreen();

  if (!gameOver && !waitingToStart) {
    //Update game objects
    ground.update(gameSpeed, frameTimeDelta);
    balliController.update(gameSpeed, frameTimeDelta);
    player.update(gameSpeed, frameTimeDelta);
    score.update(frameTimeDelta);
    updateGameSpeed(frameTimeDelta);
  }

  if (!gameOver && balliController.collideWith(player)) {
    gameOver = true;
    player.setGameOverImage();

    setupGameReset();
    score.setHighScore();
  }

  //Draw game objects
  ground.draw();
  balliController.draw();
  player.draw();
  score.draw();

  if (gameOver) {
    showGameOver();
  }

  if (waitingToStart) {
    showStartGameText();
  }

  requestAnimationFrame(gameLoop);
}

// requestAnimationFrame(gameLoop);
backgroundImage.onload = () => {
  requestAnimationFrame(gameLoop);
};


window.addEventListener("keyup", reset, { once: true });
window.addEventListener("touchstart", reset, { once: true });
