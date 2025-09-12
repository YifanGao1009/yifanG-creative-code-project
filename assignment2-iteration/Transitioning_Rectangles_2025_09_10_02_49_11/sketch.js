function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  background(245);

  let count = 14;
  let margin = 25;
  let w = (width - margin*2) / count;
  let baseline = height - margin;

  for (let i = 0; i < count; i++) {
    let h = map(i, 0, count-1, 30, height - margin*2);
    //h:高度i：第几个矩形（从 0 开始计数）。0, count-1:i 会从最小 0 到最大 count-1 30输出范围的最小值 height - margin*2：输出范围的最大值，也就是最高能到的高度。
    let x = margin + i * w;
    let y = baseline - h;
    let g = map(i, 0, count-1, 20, 240);

    fill(g); 
    stroke(60);
    rect(x, y, w, h);
  }
}

//i：第几个矩形。
//count：多少个矩形。
//margin：左右/上下的边距像素。
//w：宽
//h：当前这个矩形的高。
//x：当前矩形左上角的 x 坐标
//y：当前矩形左上角的 y 坐标
//base：所有矩形共用的底线 y 坐标（贴着这条线“站立”）。
//g：灰度值（20→暗，240→亮），用来 fill(g)。