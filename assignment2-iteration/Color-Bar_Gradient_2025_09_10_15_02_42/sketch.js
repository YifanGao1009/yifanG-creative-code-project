function setup() {
  createCanvas(400, 400);
  noStroke();
}

function draw() {
  background(255);

  const N = 17;
  const w = width / N;

  for (let i = 0; i < N; i++) {
    let BlueVal  = map(i, 0, N - 1, 0, 255);
    let YelloVal = map(i, 0, N - 1, 255, 0);
    fill(255, YelloVal, BlueVal);

    rect(i * w, 0, w-3, height);
  }

  fill(255, 0, 0);
  noLoop();
}

