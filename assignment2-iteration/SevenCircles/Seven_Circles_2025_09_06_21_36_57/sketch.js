function setup() {
  createCanvas(400, 400);
  background(255);

  let n = 7;
  let margin = 50;
  let d = 25;
  let step = (width - 2 * margin) / (n - 1);

  stroke(0);
  strokeWeight(2);
  fill(225);

  for (let i = 0; i < n; i++) {
    let x = margin + i * step;
    circle(x, height / 2, d);
  }
}