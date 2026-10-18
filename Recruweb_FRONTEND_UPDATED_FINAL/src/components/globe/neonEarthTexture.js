// Procedural "neon data-hub Earth" texture — built to match the approved
// magenta/pink glowing-continent reference artwork (neon-3d-globe-reference.png)
// but as a proper equirectangular map so it can be wrapped around a REAL
// three.js sphere and rotate in true 3D (correct shading, limb darkening,
// parallax as it turns) instead of a flat CSS image trick.
//
// Unlike the earlier version, land shapes are traced from real-world
// coastline data (LAND_RINGS, derived from Natural Earth 110m land polygons)
// instead of random wobbly blobs, so continents are actually recognisable
// as they spin.

import { LAND_RINGS } from "./landPolygons";

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lonToX(lon, w) {
  return ((lon + 180) / 360) * w;
}
function latToY(lat, h) {
  return ((90 - lat) / 180) * h;
}

function paintBase(ctx, w, h) {
  const ocean = ctx.createLinearGradient(0, 0, 0, h);
  ocean.addColorStop(0, "#020817");
  ocean.addColorStop(0.45, "#020611");
  ocean.addColorStop(0.55, "#01040d");
  ocean.addColorStop(1, "#03091a");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, w, h);

  // Faint deep-space nebula tint so oceans aren't flat black.
  const nebula = ctx.createRadialGradient(w * 0.32, h * 0.4, 0, w * 0.32, h * 0.4, w * 0.4);
  nebula.addColorStop(0, "rgba(18,75,180,0.26)");
  nebula.addColorStop(1, "rgba(18,75,180,0)");
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, w, h);

  const nebula2 = ctx.createRadialGradient(w * 0.75, h * 0.65, 0, w * 0.75, h * 0.65, w * 0.28);
  nebula2.addColorStop(0, "rgba(0,145,255,0.20)");
  nebula2.addColorStop(1, "rgba(0,145,255,0)");
  ctx.fillStyle = nebula2;
  ctx.fillRect(0, 0, w, h);
}

// Build Path2D shapes for a coastline ring, projected to canvas space. Splits
// the ring wherever it crosses the ±180° seam so shapes don't smear across
// the whole map width.
function ringToPaths(ring, w, h) {
  const segments = [];
  let current = [];
  let prevLon = null;
  for (const [lon, lat] of ring) {
    if (prevLon !== null && Math.abs(lon - prevLon) > 180) {
      if (current.length > 1) segments.push(current);
      current = [];
    }
    current.push([lonToX(lon, w), latToY(lat, h)]);
    prevLon = lon;
  }
  if (current.length > 1) segments.push(current);

  return segments.map((seg) => {
    const path = new Path2D();
    path.moveTo(seg[0][0], seg[0][1]);
    for (let i = 1; i < seg.length; i++) path.lineTo(seg[i][0], seg[i][1]);
    path.closePath();
    return path;
  });
}

function ringBBox(ring, w, h) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [lon, lat] of ring) {
    const x = lonToX(lon, w);
    const y = latToY(lat, h);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
}

function paintLand(ctx, w, h, rand, { forEmissive = false } = {}) {
  LAND_RINGS.forEach((ring) => {
    const paths = ringToPaths(ring, w, h);
    const bbox = ringBBox(ring, w, h);
    const area = Math.max(bbox.w * bbox.h, 1);

    paths.forEach((path) => {
      // Base landmass fill — soft magenta/violet gradient (or bright for
      // the emissive pass, which is what makes it "glow" in three.js).
      ctx.save();
      ctx.clip(path);

      if (forEmissive) {
        const grad = ctx.createLinearGradient(bbox.minX, bbox.minY, bbox.minX, bbox.maxY);
        grad.addColorStop(0, "#35c7ff");
        grad.addColorStop(1, "#1769ff");
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(bbox.minX - 2, bbox.minY - 2, bbox.w + 4, bbox.h + 4);
        ctx.globalAlpha = 1;
      } else {
        const grad = ctx.createLinearGradient(bbox.minX, bbox.minY, bbox.minX, bbox.maxY);
        grad.addColorStop(0, "#06295d");
        grad.addColorStop(1, "#031331");
        ctx.fillStyle = grad;
        ctx.fillRect(bbox.minX - 2, bbox.minY - 2, bbox.w + 4, bbox.h + 4);
      }

      // Dense "city light" sparkle points inside the landmass — the
      // signature look of the reference artwork. Density scales with the
      // polygon's screen area so big continents read as glittering
      // networks and tiny islands just get a soft dot or two.
      const dotCount = Math.max(2, Math.min(650, Math.round(area * 0.85)));
      for (let i = 0; i < dotCount; i++) {
        const px = bbox.minX + rand() * bbox.w;
        const py = bbox.minY + rand() * bbox.h;
        const s = rand() * (forEmissive ? 2.4 : 1.6) + 0.35;
        ctx.globalAlpha = forEmissive ? 0.85 + rand() * 0.15 : 0.5 + rand() * 0.4;
        ctx.fillStyle = rand() > 0.78 ? "#d8f8ff" : forEmissive ? "#62dfff" : "#48bfff";
        ctx.beginPath();
        ctx.arc(px, py, s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // Crisp neon coastline stroke so continents read clearly even at a
      // distance, matching the approved reference art.
      ctx.save();
      ctx.strokeStyle = forEmissive ? "rgba(190,245,255,0.95)" : "rgba(71,191,255,0.9)";
      ctx.lineWidth = forEmissive ? 1.6 : 1.1;
      ctx.shadowColor = forEmissive ? "#8cecff" : "#218cff";
      ctx.shadowBlur = forEmissive ? 6 : 3;
      ctx.stroke(path);
      ctx.restore();
    });
  });
}

export function createNeonEarthColorTexture(size = 2048) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;

  paintBase(ctx, w, h);
  const rand = mulberry32(7);
  paintLand(ctx, w, h, rand, { forEmissive: false });

  return canvas;
}

export function createNeonEarthEmissiveTexture(size = 2048) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const rand = mulberry32(7); // same seed → dots line up with the color pass
  paintLand(ctx, canvas.width, canvas.height, rand, { forEmissive: true });

  return canvas;
}
