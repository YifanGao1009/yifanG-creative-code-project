function setup() {
  createCanvas(400, 400);
  background(255);
  stroke(0);
  strokeWeight(0.6);
  strokeCap(SQUARE);
  noLoop();

  let Lines = 150;
  let leftExtra  = 2500;
  let rightExtra = 2500;
  let topY   = -height * 0.08;
  let middle = width / 2;
  let a = 0.01;

  let startX = -leftExtra;
  let endX   = width + rightExtra;

  let step = (endX - startX) / Lines;
  let x = startX;

  for (let i = 0; i < Lines; i++) {
    let bottomX = x;           // 底部 x
    let bottomY = height;      // 底部 y

    // 顶端 x = 中线 + (底部到中线的距离 * squeeze)
    let topX = middle + (bottomX - middle) * a;

    line(bottomX, bottomY, topX, topY);
    x = x + step;
  }
}





