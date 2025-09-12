function setup() {
  createCanvas(400, 400);
  noStroke();

  let numSquares = 8;
  let squareSize = width / numSquares;

  for (let x = 0; x < numSquares; x++) {
    for (let y = 0; y < numSquares; y++) {

      if ((x + y) % 2 === 0) {
        fill(255); // 白
      } else {
        fill(0);   // 黑
      }

      rect(x * squareSize, y * squareSize, squareSize, squareSize);
    }
  }
}

function draw() {}