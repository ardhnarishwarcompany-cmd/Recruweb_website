// Procedurally generates the Earth textures used by the 3D globe on the
// home page (canvas-based, no external image assets required). Colors are
// tuned to match Recruweb's existing navy / cyan "HR DATA HUB" theme so the
// new 3D globe drops into the same visual language as the old CSS globe.

// Simple deterministic pseudo-random generator (keeps the texture stable
// across re-renders instead of reshuffling continents every mount).
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawBlobLand(ctx, cx, cy, r, rand, fill) {
  ctx.beginPath();
  const points = 10 + Math.floor(rand() * 5);
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wobble = r * (0.6 + rand() * 0.5);
    const x = cx + Math.cos(angle) * wobble;
    const y = cy + Math.sin(angle) * wobble * 0.62; // flatten toward equator bands
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

// Base color (diffuse) map: navy ocean + cyan/teal "landmasses" so the globe
// reads as a stylised data-hub planet rather than a photoreal Earth.
export function createEarthColorTexture(size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext("2d");

  // Ocean base — deep navy gradient, matching .globe-sphere's existing
  // radial-gradient(#111a3b / rgba(25,38,92,.92) / rgba(99,102,241,.9)).
  const ocean = ctx.createLinearGradient(0, 0, 0, canvas.height);
  ocean.addColorStop(0, "#1b2456");
  ocean.addColorStop(0.5, "#0f1638");
  ocean.addColorStop(1, "#0a0f26");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const rand = mulberry32(42);

  // Scatter cyan/teal landmasses across the map.
  const landColors = ["#1f7f8a", "#22909c", "#175f73", "#2aa6ad", "#134b63"];
  const blobCount = 34;
  for (let i = 0; i < blobCount; i++) {
    const cx = rand() * canvas.width;
    const cy = canvas.height * 0.12 + rand() * canvas.height * 0.76;
    const r = 18 + rand() * 46;
    drawBlobLand(ctx, cx, cy, r, rand, landColors[i % landColors.length]);
  }

  // Subtle city-light style highlight dots on landmasses (recruitment /
  // "data hub" motif — echoes the old .globe-node pulsing dots).
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < 90; i++) {
    const x = rand() * canvas.width;
    const y = canvas.height * 0.15 + rand() * canvas.height * 0.7;
    const s = rand() * 1.6 + 0.4;
    ctx.fillStyle = rand() > 0.5 ? "#67e8f9" : "#38bdf8";
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Latitude/longitude grid lines to echo the original .globe-lat/.globe-long CSS rings.
  ctx.strokeStyle = "rgba(125,211,252,0.18)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 6; i++) {
    const y = (canvas.height / 6) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let i = 1; i < 12; i++) {
    const x = (canvas.width / 12) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  return canvas;
}

// Emissive map — makes the landmass "city light" dots glow even on the
// globe's night side, keeping the HR DATA HUB / "always on" feeling.
export function createEarthEmissiveTexture(size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const rand = mulberry32(42); // same seed so dots line up with the color map

  // Skip the same number of "blob" draws to stay in sync with the color pass.
  for (let i = 0; i < 34; i++) {
    rand();
    rand();
    rand();
    const points = 10 + Math.floor(rand() * 5);
    for (let p = 0; p <= points; p++) rand();
  }

  for (let i = 0; i < 90; i++) {
    const x = rand() * canvas.width;
    const y = canvas.height * 0.15 + rand() * canvas.height * 0.7;
    const s = rand() * 1.6 + 0.4;
    ctx.fillStyle = rand() > 0.5 ? "#67e8f9" : "#38bdf8";
    ctx.beginPath();
    ctx.arc(x, y, s * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}