let size = 100;
let wasClicked = false;
let boxFill = 255;

function setup() {
  createCanvas(400, 400);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(220);
  fill(boxFill);
  rect(width/2, height/2, size, size);
}

function mousePressed() {
  if (
    mouseX > width/2 - size/2 &&
    mouseX < width/2 + size/2 &&
    mouseY > height/2 - size/2 &&
    mouseY < height/2 + size/2
  ) {
    wasClicked = !wasClicked;
    boxFill = (boxFill === 255) ? 0 : 255;
  }
}
