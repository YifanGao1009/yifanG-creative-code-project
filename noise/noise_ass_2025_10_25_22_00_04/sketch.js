const noiseScale = 0.01;
const numShapes = 16;
let shapes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  angleMode(DEGREES);
  noStroke();

  for (let i = 0; i < numShapes; i++) {
    let isBlue = random() < 0.40;
    shapes.push({
      x: random(width),
      y: random(height),
      vx: random(-1.2, 1.2),
      vy: random(-1.2, 1.2),
      offset: random(1000),
      baseSize: isBlue ? random(30, 60) : random(50, 100),
      isBlue: isBlue
    });
  }
}

function draw() {
  background('#FBDDFAEA');
  blendMode(MULTIPLY);

  for (let s of shapes) {
    s.x += s.vx;
    s.y += s.vy;

    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    for (let w = s.baseSize; w > 8; w -= 2) {
      let lightC, darkC;

      if (s.isBlue) {
        lightC = color(220, 240, 255);
        darkC = color(150, 190, 255);
      } else {
        lightC = color(190, 255, 170);
        darkC = color(1, 148, 26);
      }

      let t = map(w, 8, s.baseSize, 0, 1);
      let c = lerpColor(lightC, darkC, t);
      c.setAlpha(25);
      fill(c);

      let n = noise(w * noiseScale, frameCount * noiseScale * 2.5 + s.offset);
      let a = map(n, 0, 1, 0, 360);

      drawSquare(s.x, s.y, a, w);
    }
  }

  blendMode(BLEND);
}

function drawSquare(x, y, a, w) {
  push();
  translate(x, y);
  rotate(a);
  square(0, 0, w);
  pop();
}


