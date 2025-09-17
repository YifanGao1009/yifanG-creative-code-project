let myCircles = [];
let numCircles = 160;
let faceImg;

const FACE_X_PCT = 0.50;
const FACE_Y_PCT = 0.42;
let   FACE_SCALE = 0.18;

// emoji
let myEmojis = [];
const EMOJIS = ['👀','👃','👄'];
const EMOJI_COUNT = 40;

function preload(){
  faceImg = loadImage('face.jpeg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);

  for (let i = 0; i < numCircles; i++) {
    myCircles.push({
      x: random(width),
      y: random(height),
      size: random(60, 140)
    });
  }

  for (let i = 0; i < EMOJI_COUNT; i++) {
    myEmojis.push({
      x: random(width),
      y: random(height),
      size: random(48, 96),
      char: random(EMOJIS)
    });
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background('#faff6cf1');


  for (const c of myCircles) {
    drawFaceBubble(c.x, c.y, c.size);

    c.size += 0.12;
    c.x += random(-0.6, 0.6);

    if (c.size > min(width, height) * 0.15) {
      c.size = random(60, 140);
      c.x = random(width);
      c.y = random(height);
    }
  }

  for (const e of myEmojis) {
    e.x += random(-0.6, 0.6);
    e.y += random(-0.4, 0.4);
    textSize(e.size);
    text(e.char, e.x, e.y);
  }
}

function drawFaceBubble(x, y, d){
  const r = d/2;

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.arc(x, y, r, 0, TWO_PI);
  drawingContext.clip();

  const s  = FACE_SCALE;
  const fx = faceImg.width  * FACE_X_PCT;
  const fy = faceImg.height * FACE_Y_PCT;
  image(faceImg, x - fx*s, y - fy*s, faceImg.width*s, faceImg.height*s);

  drawingContext.restore();

  // 金黄色外发光
  push();
  noStroke();
  for (let i = 0; i < 8; i++) {
    const rr = d * 1.05 + i * 6;
    fill(255, 220, 60, 28 - i * 3);
    ellipse(x, y, rr, rr);
  }
  pop();

  // 金色细描边
  noFill();
  stroke(255, 220, 60, 180);
  strokeWeight(1.4);
  circle(x, y, d * 1.02);
}
