function setup() {
  createCanvas(400, 400);
  stroke(0);
  strokeWeight(2);
}

function draw() {
  background(250);

  const n = 10;
  const margin = 20;
  for (let i = 0; i < n; i++) {
    const x = map(i, 0, n - 1, margin, width - margin); // 顶部等距点
    const y = margin;                                    // 顶部 y
    line(mouseX, mouseY, x, y);                         // 鼠标 → 顶部点
  }
}
