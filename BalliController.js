import Ball from "./Ball.js";

export default class BalliController {
  BALL_INTERVAL_MIN = 500;
  BALL_INTERVAL_MAX = 2000;

  nextBallInterval = null;
  balli = [];

  constructor(ctx, balliImages, scaleRatio, speed) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.balliImages = balliImages;
    this.scaleRatio = scaleRatio;
    this.speed = speed;

    this.setNextBallTime();
  }

  // Set the next ball interval to a random value between the minimum and maximum
  setNextBallTime() {
    const num = this.getRandomNumber(
      this.BALL_INTERVAL_MIN,
      this.BALL_INTERVAL_MAX
    );

    this.nextBallInterval = num;
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // Create a new ball at a random position on the right side of the canvas
  createBall() {
    const index = this.getRandomNumber(0, this.balliImages.length - 1);
    const ballImage = this.balliImages[index];
    const x = this.canvas.width * 1.5;
    const y = this.canvas.height - ballImage.height;
    const ball = new Ball(
      this.ctx,
      x,
      y,
      ballImage.width,
      ballImage.height,
      ballImage.image
    );

    this.balli.push(ball);
  }

  
  update(gameSpeed, frameTimeDelta) {
    if (this.nextBallInterval <= 0) {
      this.createBall();
      this.setNextBallTime();
    }
    this.nextBallInterval -= frameTimeDelta;

    this.balli.forEach((ball) => {
      ball.update(this.speed, gameSpeed, frameTimeDelta, this.scaleRatio);
    });

    this.balli = this.balli.filter((ball) => ball.x > -ball.width);
  }

  draw() {
    this.balli.forEach((ball) => ball.draw());
  }

  // Check if any ball collides with the player
  collideWith(sprite) {
    return this.balli.some((ball) => ball.collideWith(sprite));
  }

  reset() {
    this.balli = [];
  }
}
