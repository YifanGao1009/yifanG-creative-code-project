let size = 100;
let cx, cy;

let isWhite = true;
let clicksInState = 0;
let threshold = 3;

function setup() {
  createCanvas(400, 400);
  rectMode(CENTER);
  cx = width / 2;
  cy = height / 2;
}

function draw() {
  background(220);
  strokeWeight(1);
  fill(isWhite ? 255 : 0);
  square(cx, cy, size);
}

function mousePressed() {
  if (
    mouseX > cx - size/2 &&
    mouseX < cx + size/2 &&
    mouseY > cy - size/2 &&
    mouseY < cy + size/2
  ) {
    clicksInState++;
    if (clicksInState >= threshold) {
      isWhite = !isWhite;
      clicksInState = 0;
      threshold = isWhite ? 3 : 2;
    }
  }
}


