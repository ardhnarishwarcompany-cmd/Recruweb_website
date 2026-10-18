// Generates the point-cloud "dotted world map" used by the new Voyager2-style
// globe (see DottedGlobe.jsx). A land mask is drawn procedurally onto an
// offscreen canvas (continent-shaped blobs, same trick already used by the
// old earthTexture.js) and then sampled on a lat/lon grid so every dot that
// survives sits on "land". No external world-map image is downloaded, so
// this stays a drop-in with zero new binary assets.

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawBlobLand(ctx, cx, cy, r, rand) {
  ctx.beginPath();
  const points = 12 + Math.floor(rand() * 6);
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wobble = r * (0.55 + rand() * 0.55);
    const x = cx + Math.cos(angle) * wobble;
    const y = cy + Math.sin(angle) * wobble * 0.62;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function createLandMaskCanvas(width = 640, height = 320) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";

  const rand = mulberry32(42); // same seed family as earthTexture.js
  const blobCount = 40;
  for (let i = 0; i < blobCount; i++) {
    const cx = rand() * width;
    const cy = height * 0.1 + rand() * height * 0.8;
    const r = width * (0.02 + rand() * 0.045);
    drawBlobLand(ctx, cx, cy, r, rand);
  }
  return canvas;
}

// Returns a Float32Array of [x,y,z,x,y,z,...] positions on the sphere
// surface, one per "land" sample point, plus a matching color array that
// fades dot brightness slightly toward the poles for depth.
export function generateLandDots(radius = 1.35, { widthSegments = 170, heightSegments = 85 } = {}) {
  const canvas = createLandMaskCanvas();
  const ctx = canvas.getContext("2d");
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const positions = [];
  const colors = [];

  const colorA = { r: 0.4, g: 0.85, b: 1 }; // cyan (#67e8f9-ish)
  const colorB = { r: 0.55, g: 0.5, b: 0.98 }; // indigo (#8b87f8-ish)

  for (let iy = 0; iy <= heightSegments; iy++) {
    const v = iy / heightSegments; // 0 (north) -> 1 (south)
    const lat = (0.5 - v) * Math.PI; // +90deg .. -90deg
    const circumference = Math.max(Math.cos(lat), 0.02);
    const steps = Math.max(6, Math.round(widthSegments * circumference));

    for (let ix = 0; ix < steps; ix++) {
      const u = ix / steps;
      const lon = u * Math.PI * 2 - Math.PI;

      const px = Math.min(width - 1, Math.floor(u * width));
      const py = Math.min(height - 1, Math.floor(v * height));
      const idx = (py * width + px) * 4;
      const isLand = data[idx] > 128;
      if (!isLand) continue;

      const x = radius * Math.cos(lat) * Math.cos(lon);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.sin(lon);
      positions.push(x, y, z);

      // Blend two brand colors across latitude/longitude for a subtle,
      // premium gradient instead of a single flat dot color.
      const mix = (v + u) / 2;
      colors.push(
        colorA.r + (colorB.r - colorA.r) * mix,
        colorA.g + (colorB.g - colorA.g) * mix,
        colorA.b + (colorB.b - colorA.b) * mix
      );
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
  };
}
