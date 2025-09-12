let pts = [];
let count = 140;
let t = 0;
let s = 0.008;

let emoji = '🌸';
let emojiSize = 30;
let bgCol;

function setup() {
  createCanvas(windowWidth, windowHeight);

  bgCol = color(248, 242, 236);
  background(bgCol);
  strokeWeight(1.2);


  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  textSize(emojiSize);
  textFont('Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif');

  for (let i = 0; i < count; i++) {
    pts.push({
      x: random(width),
      y: random(height),
      c: color(236, 72, 153, 60)
    });
  }
}

function draw() {
  let loops = (frameCount < 60) ? 8 : 1;

  for (let k = 0; k < loops; k++) {
    for (let i = 0; i < pts.length; i++) {
      let p = pts[i];
      let n = noise(p.x * s, p.y * s, t);
      let a = n * TWO_PI;

      p.x += cos(a);
      p.y += sin(a);

      stroke(p.c);
      point(p.x, p.y);
    }
    t += (frameCount < 60) ? 0.02 : 0.005;
  }

  push();
  noStroke();
  circle(mouseX, mouseY, emojiSize * 0.9);
  text(emoji, mouseX, mouseY);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(bgCol);
}




