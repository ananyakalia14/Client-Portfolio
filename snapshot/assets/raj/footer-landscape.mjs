// Mountain contour geometry adapted from Lingdong Huang's {Shan, Shui}*.
// https://github.com/LingDong-/shan-shui-inf (see shan-shui-license.txt)
const tileWidth = 640;
const height = 300;
const layers = [
  { floor: 193, peaks: 2, lift: 221, fill: "#e2e2d1", ink: "#586c63" },
  { floor: 236, peaks: 2, lift: 216, fill: "#b8c2aa", ink: "#314f46" },
  { floor: 266, peaks: 2, lift: 150, fill: "#818f77", ink: "#203e36" },
];

function random(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function createNoise(seed) {
  const next = random(seed);
  const values = Float32Array.from({ length: 4096 }, next);
  const sample = (x, y) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const dx = (1 - Math.cos((x - ix) * Math.PI)) / 2;
    const dy = (1 - Math.cos((y - iy) * Math.PI)) / 2;
    const i = ix + iy * 64;
    const top = values[i & 4095] * (1 - dx) + values[(i + 1) & 4095] * dx;
    const bottom = values[(i + 64) & 4095] * (1 - dx) + values[(i + 65) & 4095] * dx;
    return top * (1 - dy) + bottom * dy;
  };
  return (x, y) => .64 * sample(x, y) + .25 * sample(x * 2, y * 2) + .11 * sample(x * 4, y * 4);
}

function trace(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
}

function mountain(ctx, x, y, width, lift, layer, seed) {
  const next = random(seed);
  const noise = createNoise(seed);
  const rows = 12;
  const columns = 70;
  const rings = Array.from({ length: rows }, (_, row) => {
    const perspective = 1 - row / rows;
    return Array.from({ length: columns + 1 }, (_, column) => {
      const angle = (column / columns - .5) * Math.PI;
      const ridge = Math.cos(angle) * (.29 + noise((angle + 2) * 3, row * .18));
      return [x + angle / Math.PI * width * perspective, y + row * 2.1 - ridge * lift * perspective];
    });
  });

  trace(ctx, rings[0]);
  ctx.lineTo(x + width / 2, y + 10);
  ctx.quadraticCurveTo(x, y + 32, x - width / 2, y + 10);
  ctx.closePath();
  ctx.fillStyle = layer.fill;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = layer.ink;
  ctx.lineCap = "round";
  for (const [row, ring] of rings.entries()) {
    ctx.globalAlpha = row === 0 ? .55 : .12;
    ctx.lineWidth = row === 0 ? 1.55 : .7;
    trace(ctx, ring);
    ctx.stroke();
  }
  // Short broken strokes between successive contours give the slope its ink wash.
  for (let i = 0; i < 320; i++) {
    const latitude = Math.floor(next() * columns);
    const depth = Math.floor(next() * (rows - 3));
    const blend = next();
    const length = 2 + Math.floor(next() * Math.min(8, columns - latitude - 1));
    const points = rings.slice(depth, depth + 2);
    const stroke = points[0].slice(latitude, latitude + length).map(([x1, y1], j) => {
      const [x2, y2] = points[1][latitude + j];
      return [x1 + (x2 - x1) * blend, y1 + (y2 - y1) * blend];
    });
    ctx.globalAlpha = .06 + next() * .3;
    ctx.lineWidth = .5 + next() * 1.3;
    trace(ctx, stroke);
    ctx.stroke();
  }
  ctx.restore();
}

function paintTile(number, ratio) {
  const tile = document.createElement("canvas");
  tile.width = tileWidth * ratio;
  tile.height = height * ratio;
  const ctx = tile.getContext("2d");
  ctx.scale(ratio, ratio);
  const next = random((number + 1) * 93563);
  ctx.strokeStyle = "#607666";
  for (let i = 0; i < 100; i++) {
    const x = next() * tileWidth;
    const y = 147 + next() * 144;
    ctx.globalAlpha = .03 + next() * .17;
    trace(ctx, [[x, y], [Math.min(tileWidth, x + 5 + next() * 48), y]]);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  layers.forEach((layer, depth) => {
    for (let neighbor = number - 1; neighbor <= number + 1; neighbor++) {
      const seed = Math.imul(neighbor + 4827, 3079) + depth * 204961;
      const layout = random(seed);
      const interval = tileWidth / layer.peaks;
      for (let peak = 0; peak < layer.peaks; peak++) {
        const center = (neighbor - number) * tileWidth + (peak + .2 + layout() * .6) * interval;
        const width = interval * (1.13 + layout() * .52);
        const floor = layer.floor + (layout() - .5) * 21;
        const rise = Math.min(layer.lift * (.58 + layout() * .46), (floor - 17) / 1.29);
        if (center + width / 2 > 0 && center - width / 2 < tileWidth) {
          mountain(ctx, center, floor, width, rise, layer, seed + 7919 * peak + 23);
        }
      }
    }
  });
  return tile;
}

function mountLandscape(footer) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const panel = document.createElement("div");
  panel.className = "raj-footer-landscape";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "raj-landscape-toggle";
  panel.append(canvas, button);
  footer.append(panel);

  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const tiles = new Map();
  let paused = preference.matches;
  let visible = false;
  let frame = 0;
  let lastTime = 0;
  let offset = 210;
  let width = 0;
  let ratio = 1;

  function draw() {
    if (!width) return;
    const start = Math.floor(offset / tileWidth);
    const end = Math.floor((offset + width) / tileWidth);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let number = start; number <= end; number++) {
      if (!tiles.has(number)) tiles.set(number, paintTile(number, ratio));
      ctx.drawImage(tiles.get(number), Math.round((number * tileWidth - offset) * ratio), 0, tileWidth * ratio, canvas.height);
    }
    for (const number of tiles.keys()) {
      if (number < start || number > end) tiles.delete(number);
    }
  }

  function animate(time) {
    if (lastTime) offset += Math.min(time - lastTime, 50) * .024;
    lastTime = time;
    draw();
    frame = requestAnimationFrame(animate);
  }

  function sync() {
    button.textContent = paused ? "Play" : "Pause";
    button.setAttribute("aria-label", paused ? "Play landscape animation" : "Pause landscape animation");
    if (visible && !paused && !document.hidden) {
      if (!frame) frame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    }
  }

  const resize = new ResizeObserver(([entry]) => {
    const box = entry.contentRect;
    if (!box.width || !box.height) return;
    const scale = box.height / height;
    const nextRatio = Math.ceil(Math.min(devicePixelRatio || 1, 2) * scale) || 1;
    if (ratio !== nextRatio) tiles.clear();
    ratio = nextRatio;
    width = box.width / scale;
    canvas.width = Math.ceil(width * ratio);
    canvas.height = height * ratio;
    if (visible) draw();
  });
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) draw();
    sync();
  });
  function onPreference() {
    paused = preference.matches;
    sync();
  }
  button.onclick = () => { paused = !paused; sync(); };
  preference.addEventListener("change", onPreference);
  document.addEventListener("visibilitychange", sync);
  resize.observe(panel);
  visibility.observe(panel);
  sync();

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    visibility.disconnect();
    preference.removeEventListener("change", onPreference);
    document.removeEventListener("visibilitychange", sync);
    panel.remove();
  };
}

let currentFooter;
let cleanup;

export function syncFooterLandscape() {
  const footer = document.querySelector("footer.site-footer, footer.footer-others");
  if (footer === currentFooter) return;
  cleanup?.();
  currentFooter = footer;
  cleanup = footer ? mountLandscape(footer) : undefined;
}
