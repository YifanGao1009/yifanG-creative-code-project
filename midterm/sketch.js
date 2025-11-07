// Part 1 — Face Tracking
let camera;
let facemeshModel;
let lastPts = null;
let currentTool = "🪡";


let handpose;
let hands = [];
let pinchClosed = false;
let prevPinchClosed = false;
const PINCH_CLOSE = 60;
const PINCH_OPEN  = 70;

// Part 2 — Pimples
const EYE_BLOCK_SCALE = 0.9;
const EYE_EXTRA_PROTECT_PADDING = 8;

const howManyPimples = 0.08;
const MAX_PIMPLES     = 35;
const MIN_GAP         = 25;
const pressRadius     = 50;
const pressPower      = 0.008;
const clickBump       = 0.05;
const growSpeed       = [0.0007, 0.0010];
const popLevelRange   = [0.97, 0.99];
const restTimeRange   = [200, 300];
const smalldropCount  = 6;
const bigdropCount    = 1; 
const smallDropSpeed  = 1.6;
const bigDropSpeed    = 3.0;
const gravity         = 0.09;

// Perlin / blush
let blushSpots = [];
const BLUSH_BASE_RADIUS  = 70;
const BLUSH_LIFE         = 50;
const BLUSH_MAX_ALPHA    = 200;
const BLUSH_NOISE_SCALE  = 0.030;

const pimpleColors = [
  { outer:[255, 211, 208], inner:[240, 0, 12],  highlight:[255, 243, 243] },
  { outer:[255, 180, 190], inner:[210, 70, 90], highlight:[255, 243, 243] },
  { outer:[255, 200, 205], inner:[255,108,100], highlight:[255, 243, 243] }
];

const FINGER_HOLD_FRAMES = 24;
let pimple = [];
let Drop   = [];
let pimpleCounter = 1;
let pimpleCreated = false;
let anchorById = {};

function mid2(ax, ay, bx, by) {
  return { x:(ax+bx)/2, y:(ay+by)/2 };
}

function getEyeZones(pts) {
  const L_OUT = 33, L_IN = 133;
  const R_OUT = 362, R_IN = 263;
  if (!pts[L_OUT] || !pts[L_IN] || !pts[R_OUT] || !pts[R_IN]) return null;

  const L = mid2(pts[L_OUT][0], pts[L_OUT][1], pts[L_IN][0], pts[L_IN][1]);
  const R = mid2(pts[R_OUT][0], pts[R_OUT][1], pts[R_IN][0], pts[R_IN][1]);

  const lWidth = dist(pts[L_OUT][0], pts[L_OUT][1], pts[L_IN][0], pts[L_IN][1]);
  const rWidth = dist(pts[R_OUT][0], pts[R_OUT][1], pts[R_IN][0], pts[R_IN][1]);

  const lRad = lWidth * EYE_BLOCK_SCALE + EYE_EXTRA_PROTECT_PADDING;
  const rRad = rWidth * EYE_BLOCK_SCALE + EYE_EXTRA_PROTECT_PADDING;
  return { L, R, lRad, rRad };
}

function setup() {
  const c = createCanvas(640, 480);
  c.parent(document.body);
  c.style("display", "block");
  c.style("margin", "0 auto");

  c.mouseOver(() => noCursor());
  c.mouseOut(() => cursor());

  camera = createCapture(VIDEO);
  camera.size(640, 480);
  camera.hide();

  // Face (facemesh)
  facemeshModel = ml5.facemesh(camera, () => console.log("facemesh ready"));
  facemeshModel.on("predict", gotFaces);


  handpose = ml5.handpose(camera, () => console.log("handpose ready"));
  handpose.on('predict', gotHands);

  // 可选 UI
  const needleBtn = document.getElementById("needle-btn");
  const fingerBtn = document.getElementById("finger-btn");
  if (needleBtn && fingerBtn) {
    needleBtn.addEventListener("click", () => {
      currentTool = "🪡";
      needleBtn.classList.add("active");
      fingerBtn.classList.remove("active");
    });
    fingerBtn.addEventListener("click", () => {
      currentTool = "👆";
      fingerBtn.classList.add("active");
      needleBtn.classList.remove("active");
    });
  }
}

function gotFaces(results) {
  if (results.length > 0) {
    lastPts = results[0].scaledMesh;
    if (!pimpleCreated) {
      spawnPimplesFromMesh(lastPts);
      pimpleCreated = true;
    }
  }
}

function draw() {
  background(0);


  push();
  translate(width, 0);
  scale(-1, 1);
  image(camera, 0, 0, width, height);
  runPimplesSystem();
  pop();

  drawBlushLayer();

  // 工具光标
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    textSize(36);
    textAlign(CENTER, CENTER);
    text(currentTool, mouseX, mouseY);
  }

  // —— 手势检测（稳定版 handpose 的数据结构）——
  prevPinchClosed = pinchClosed;

  if (hands.length > 0) {
    // 稳定版：hands[0].annotations 里分组好的关键点
    const ann = hands[0].annotations;
    if (ann && ann.thumb && ann.indexFinger) {
      // 指尖在每个分组数组的第 4 个（索引 3）
      const thumbTip = createVector(ann.thumb[3][0],       ann.thumb[3][1]);
      const indexTip = createVector(ann.indexFinger[3][0],  ann.indexFinger[3][1]);

      const d = dist(thumbTip.x, thumbTip.y, indexTip.x, indexTip.y);

      // 迟滞逻辑
      if (d < PINCH_CLOSE)       pinchClosed = true;
      else if (d > PINCH_OPEN)   pinchClosed = false;

      // 刚刚夹住 → 在两指中点附近“爆”最近 growing 痘痘（注意：这里用相机坐标系）
      if (pinchClosed && !prevPinchClosed) {
        const mx = (thumbTip.x + indexTip.x) * 0.5;
        const my = (thumbTip.y + indexTip.y) * 0.5;
        popNearestPimpleAt(mx, my);
      }

      // （可选）调试可视化
      // push();
      // noFill(); stroke(255,255,0); strokeWeight(2);
      // line(thumbTip.x, thumbTip.y, indexTip.x, indexTip.y);
      // pop();
    }
  }
}

// 在相机坐标系寻找最近的 growing 痘痘并击破
function popNearestPimpleAt(x, y) {
  let target = null;
  let bestD = Infinity;
  const RANGE = 60; // 手势作用半径

  for (const p of pimple) {
    if (p.state !== 'growing') continue;
    const d = dist(x, y, p.pos.x, p.pos.y);
    if (d < bestD && d <= RANGE) {
      bestD = d;
      target = p;
    }
  }
  if (target) {
    popOne(target);
    target.state = 'popped';
    target.holdTime = 0;
  }
}

function spawnPimplesFromMesh(pts) {
  let need = floor(pts.length * howManyPimples);
  need = min(need, MAX_PIMPLES);

  const eyes = getEyeZones(pts);
  const used = new Set();
  let guard = 0;

  while (pimple.length < need && used.size < pts.length && guard < pts.length * 3) {
    guard++;
    const meshIdx = floor(random(pts.length));
    if (used.has(meshIdx)) continue;
    used.add(meshIdx);

    const x = pts[meshIdx][0];
    const y = pts[meshIdx][1];

    if (eyes) {
      const inLeft  = dist(x, y, eyes.L.x, eyes.L.y) < eyes.lRad;
      const inRight = dist(x, y, eyes.R.x, eyes.R.y) < eyes.rRad;
      if (inLeft || inRight) continue;
    }

    let howfar = true;
    for (const other of pimple) {
      if (dist(x, y, other.pos.x, other.pos.y) < MIN_GAP) { howfar = false; break; }
    }
    if (!howfar) continue;

    const tone = random(pimpleColors);
    const obj = {
      pimpleId: pimpleCounter++,
      pos: createVector(x, y),
      baseSize: random(2.5, 6.0),
      growRate: random(growSpeed[0], growSpeed[1]),
      pressure: random(0.01, 0.08),
      popThreshold: random(popLevelRange[0], popLevelRange[1]),
      colorTone: tone,
      cooldown: floor(random(restTimeRange[0], restTimeRange[1])),
      state: 'growing',
      holdTime: 0
    };
    pimple.push(obj);
    anchorById[obj.pimpleId] = meshIdx;
  }
}

function runPimplesSystem() {
  const mx = width - mouseX; // 鼠标在相机坐标系下的 X
  const my = mouseY;

  for (let i = 0; i < pimple.length; i++) {
    const p = pimple[i];

    // 位置跟随锚点
    if (lastPts && anchorById[p.pimpleId] !== undefined) {
      const idx = anchorById[p.pimpleId];
      if (lastPts[idx]) {
        p.pos.x = lastPts[idx][0];
        p.pos.y = lastPts[idx][1];
      }
    }

    if (p.state === 'growing') {
      p.pressure = constrain(p.pressure + p.growRate, 0, 1);
      if (mouseIsPressed) {
        const d = dist(mx, my, p.pos.x, p.pos.y);
        if (d < pressRadius) {
          const t = 1 - d / pressRadius;
          if (currentTool === "👆") {
            p.holdTime = (p.holdTime || 0) + 1;
            p.pressure = constrain(p.pressure + pressPower * (0.25 + t * 0.5), 0, 1);
            if (p.holdTime >= FINGER_HOLD_FRAMES) {
              popOne(p);
              p.state = 'popped';
            }
          } else {
            p.pressure = constrain(p.pressure + pressPower * 8, 0, 1);
            p.holdTime = 0;
          }
        } else {
          p.holdTime = 0;
        }
      } else {
        p.holdTime = 0;
      }

      if (p.pressure >= p.popThreshold) {
        popOne(p);
        p.state = 'popped';
      }

    } else if (p.state === 'popped') {
      p.state = 'scar';
      p.cooldown = floor(random(restTimeRange[0], restTimeRange[1]));
      p.pressure = 0.10;

    } else if (p.state === 'scar') {
      p.cooldown--;
      if (p.cooldown <= 0) {
        if (lastPts) {
          let tries = 0;
          while (tries < 200) {
            tries++;
            const idx = floor(random(lastPts.length));
            const nx = lastPts[idx][0];
            const ny = lastPts[idx][1];

            const eyes = getEyeZones(lastPts);
            if (eyes) {
              const tooNearEye = dist(nx, ny, eyes.L.x, eyes.L.y) < eyes.lRad ||
                                 dist(nx, ny, eyes.R.x, eyes.R.y) < eyes.rRad;
              if (tooNearEye) continue;
            }

            let ok = true;
            for (const other of pimple) {
              if (other === p) continue;
              if (dist(nx, ny, other.pos.x, other.pos.y) < MIN_GAP) { ok = false; break; }
            }
            if (ok) {
              p.pos.x = nx;
              p.pos.y = ny;
              anchorById[p.pimpleId] = idx;
              break;
            }
          }
        }
        p.baseSize     = random(2.5, 6.0);
        p.growRate     = random(growSpeed[0], growSpeed[1]);
        p.pressure     = random(0.01, 0.08);
        p.popThreshold = random(popLevelRange[0], popLevelRange[1]);
        p.state        = 'growing';
      }
    }

    drawPimple(p);
  }

  for (let i = Drop.length - 1; i >= 0; i--) {
    const d = Drop[i];
    d.vy += gravity;
    d.x  += d.vx;
    d.y  += d.vy;
    d.life--;
    d.vx *= 0.99;
    d.vy *= 0.99;

    if (d.life <= 0) {
      Drop.splice(i, 1);
    } else {
      noStroke();
      fill(255, 245, 235, map(d.life, 0, d.maxLife, 0, 180));
      circle(d.x, d.y, d.size);
    }
  }
}

function drawPimple(p) {
  const r = p.baseSize * (0.6 + p.pressure * 1.4);
  const col = p.colorTone;

  noStroke();

  if (p.state === 'scar') {
    fill(120, 30, 40, 190);
    circle(p.pos.x, p.pos.y, max(2.0, r * 0.8));
    return;
  }

  fill(col.outer[0], col.outer[1], col.outer[2], 200);
  circle(p.pos.x, p.pos.y, r * 2);

  fill(col.inner[0], col.inner[1], col.inner[2]);
  circle(p.pos.x, p.pos.y, r * 1.2);

  fill(col.highlight[0], col.highlight[1], col.highlight[2], 170);
  circle(p.pos.x - r * 0.25, p.pos.y - r * 0.25, r * 0.38);
}

function popOne(p) {
  addBlushSpot(width - p.pos.x, p.pos.y, BLUSH_BASE_RADIUS);

  for (let i = 0; i < smalldropCount; i++) {
    const a = random(TWO_PI);
    const s = random(0.6, smallDropSpeed);
    Drop.push({
      x: p.pos.x, y: p.pos.y,
      vx: cos(a) * s,
      vy: sin(a) * s - random(0.15, 0.7),
      size: random(1.6, 2.6),
      life: random(28, 56),
      maxLife: 56
    });
  }
  for (let k = 0; k < bigdropCount; k++) {
    const a = random(TWO_PI);
    const s = random(2.0, bigDropSpeed);
    Drop.push({
      x: p.pos.x, y: p.pos.y,
      vx: cos(a) * s,
      vy: sin(a) * s - random(0.15, 0.9),
      size: random(3.0, 5.0),
      life: random(36, 76),
      maxLife: 76
    });
  }
}

function mousePressed() {
  const mx = width - mouseX;
  const my = mouseY;

  let target = null;
  let bestD = Infinity;

  for (let i = 0; i < pimple.length; i++) {
    const p = pimple[i];
    if (p.state !== "growing") continue;
    const d = dist(mx, my, p.pos.x, p.pos.y);
    if (d < pressRadius && d < bestD) {
      bestD = d;
      target = p;
    }
  }

  if (!target) return;

  if (currentTool === "🪡") {
    target.pressure = target.popThreshold + 0.01;
    popOne(target);
    target.state = 'popped';
    target.holdTime = 0;
  } else {
    target.pressure = constrain(target.pressure + clickBump, 0, 1);
    target.holdTime = 0;
  }
}

function addBlushSpot(x, y, rad = BLUSH_BASE_RADIUS) {
  blushSpots.push({ x, y, rad, life: BLUSH_LIFE, max: BLUSH_LIFE });
}

function drawBlushLayer() {
  if (blushSpots.length === 0) return;

  push();
  blendMode(SOFT_LIGHT);
  noStroke();

  const step = 3;
  for (let i = blushSpots.length - 1; i >= 0; i--) {
    const b = blushSpots[i];
    const k = b.life / b.max;
    const baseA = BLUSH_MAX_ALPHA * k;

    for (let yy = -b.rad; yy <= b.rad; yy += step) {
      for (let xx = -b.rad; xx <= b.rad; xx += step) {
        const rr2 = xx * xx + yy * yy;
        if (rr2 > b.rad * b.rad) continue;

        const falloff = 1 - sqrt(rr2) / b.rad;
        const nn = noise(
          (b.x + xx) * BLUSH_NOISE_SCALE,
          (b.y + yy) * BLUSH_NOISE_SCALE,
          frameCount * 0.02
        );
        const a = baseA * (0.55 + 0.45 * nn) * falloff;

        fill(255, 60, 60, a);
        rect(b.x + xx, b.y + yy, step, step);
      }
    }
    b.life--;
    if (b.life <= 0) blushSpots.splice(i, 1);
  }
  pop();
}


function gotHands(results) {
  hands = results;
}











