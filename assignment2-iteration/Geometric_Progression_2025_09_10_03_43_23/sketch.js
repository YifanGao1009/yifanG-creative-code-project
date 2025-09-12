function setup() {
  createCanvas(400, 400);
  background(255);
  noFill();
  stroke(0);

  const xCenter = width / 2;
  const yCenter = height * 1.10;
  const thin = 0.9;
  const thick = 30;
  const shape = 2.2;
  const ratio = 1.25;
  let r = 3;     //半径

  const rMax =
    Math.max(
      dist(xCenter, yCenter, 0, 0),
      dist(xCenter, yCenter, width, 0),
      dist(xCenter, yCenter, 0, height),
      dist(xCenter, yCenter, width, height)
    ) + thick / 2;
  let outer = r;
  while (outer * ratio <= rMax) outer *= ratio;

// 从外到内画，内圈最后画在最上面
  for (let radius = outer; radius >= r; radius /= ratio) {
  const t = radius / rMax;
  const w = thin + (thick - thin) * pow(t, shape);
  strokeWeight(w);
  ellipse(xCenter, yCenter, radius * 2, radius * 2);
}
  }
//rr当前半径