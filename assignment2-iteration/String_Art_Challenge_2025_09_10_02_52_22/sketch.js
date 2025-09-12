function setup() {
  createCanvas(400, 400);
  background(255);
  stroke(20);
  strokeWeight(2);
  noLoop();
  
  const b = 20;                  // margin设为 20 像素
  const total = 10;
  const inner = total - 2;
  
  line(b, b, b, height - b);
  line(b, height - b, width - b, height - b);
  
   for (let i = 0; i < inner; i++) {             // Loop 8 times
    const y = map(i, 0, inner - 1, b, height - b); 
    const x = map(i, 0, inner - 1, b, width - b);
    line(b, y, x, height - b); 
  }
}