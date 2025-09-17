function setup() {
  createCanvas(400, 400);
  textAlign(CENTER, CENTER);
  textSize(25);
}

function draw() {
  background(250);

  push();
  stroke(0);
  strokeWeight(2);
  drawingContext.setLineDash([10, 6]);
  line(width / 2, 0, width / 2, height);
  drawingContext.setLineDash([]);
  pop();

  let position, txtColor;
  if (mouseX < width / 2) {
    position = "Cursor is on the LEFT";
    txtColor = color(200, 60, 60);
  } else {
    position = "Cursor is on the RIGHT";
    txtColor = color(50, 90, 200);
  }

  fill(txtColor);
  text(position, width / 2, height / 2);
}
