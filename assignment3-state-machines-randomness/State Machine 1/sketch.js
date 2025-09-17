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

  //白→黑
  fill(boxFill);
  stroke(0);
  strokeWeight(1);
  rect(width/2, height/2, size, size);

  if (wasClicked) {
    noStroke();
    fill(255);
    textSize(40);
    text("Clicked", width/2, height/2);
  }
}

function mousePressed() {
  if (
    mouseX > width/2  - size/2 &&
    mouseX < width/2  + size/2 &&
    mouseY > height/2 - size/2 &&
    mouseY < height/2 + size/2
  ) {
    wasClicked = true; // 保持不动
    boxFill = 0;       
  }
}
