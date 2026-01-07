// Canvas setup
const canvas = document.getElementById("mockupCanvas");
const ctx = canvas.getContext("2d");

// UI elements
const addImageInput = document.getElementById("addImageInput");
const addTextInput = document.getElementById("addTextInput");
const fontSelect = document.getElementById("fontSelect");
const addTextBtn = document.getElementById("addTextBtn");
const opacityRange = document.getElementById("opacityRange");
const blendSelect = document.getElementById("blendSelect");
const rotationRange = document.getElementById("rotationRange");
const scaleRange = document.getElementById("scaleRange");
const deleteLayerBtn = document.getElementById("deleteLayerBtn");
const duplicateLayerBtn = document.getElementById("duplicateLayerBtn");
const fitCanvasBtn = document.getElementById("fitCanvasBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const layersPanel = document.getElementById("layers");

const bgSampleBtn = document.getElementById("bgSampleBtn");
const bgRemoveBtn = document.getElementById("bgRemoveBtn");
const bgTolerance = document.getElementById("bgTolerance");
const bgResetBtn = document.getElementById("bgResetBtn");

// Product
let productImage = new Image();

// Layers model
let layers = []; // { id, type, x, y, w, h, rotation, opacity, blend, visible, ... }
let activeId = null;

// Background removal state
let bgSampleMode = false;
let sampledColor = null; // { r, g, b, a }
let originalImageMap = new Map(); // layer.id -> original Image (for reset)

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// Load product image and auto-fit
if (productId) {
  fetch(`../Homepage/fetch_product_by_id.php?id=${productId}`)
    .then(res => res.json())
    .then(product => {
      if (product && product.IMAGE) {
        productImage.src = `data:${product.mimeType};base64,${product.IMAGE}`;
        productImage.onload = () => {
          fitCanvasToImage();
          render();
        };
      } else {
        render();
      }
    })
    .catch(() => render());
} else {
  render();
}

// Utilities
const genId = () => Math.random().toString(36).slice(2, 9);
const deg2rad = d => (d * Math.PI) / 180;

// Render pipeline
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (productImage && productImage.complete) {
    ctx.drawImage(productImage, 0, 0, canvas.width, canvas.height);
  }

  for (const layer of layers) {
    if (!layer.visible) continue;

    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;
    ctx.globalCompositeOperation = layer.blend || "source-over";

    const cx = layer.x + layer.w / 2;
    const cy = layer.y + layer.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(deg2rad(layer.rotation));
    ctx.scale(layer.scaleX || 1, layer.scaleY || 1);

    if (layer.type === "image") {
      ctx.drawImage(layer.img, -layer.w / 2, -layer.h / 2, layer.w, layer.h);
    } else if (layer.type === "text") {
      ctx.font = `${layer.size}px ${layer.font}`;
      ctx.fillStyle = layer.color;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(layer.text, 0, 0);
    }

    ctx.restore();

    if (layer.id === activeId) drawHandles(layer);
  }

  updateInspector();
  updateLayersPanel();
}

function drawHandles(layer) {
  const corners = rectCorners(layer);
  ctx.save();
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < corners.length; i++) ctx.lineTo(corners[i].x, corners[i].y);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#3b82f6";
  corners.forEach(pt => {
    ctx.beginPath();
    ctx.rect(pt.x - 6, pt.y - 6, 12, 12);
    ctx.fill();
    ctx.stroke();
  });

  const topMid = midpoint(corners[0], corners[1]);
  const rotHandle = { x: topMid.x, y: topMid.y - 24 };
  ctx.beginPath();
  ctx.moveTo(topMid.x, topMid.y);
  ctx.lineTo(rotHandle.x, rotHandle.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(rotHandle.x, rotHandle.y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function rectCorners(layer) {
  const cx = layer.x + layer.w / 2;
  const cy = layer.y + layer.h / 2;
  const pts = [
    { x: layer.x, y: layer.y },
    { x: layer.x + layer.w, y: layer.y },
    { x: layer.x + layer.w, y: layer.y + layer.h },
    { x: layer.x, y: layer.y + layer.h }
  ];
  const rad = deg2rad(layer.rotation);
  return pts.map(p => rotatePoint(p, { x: cx, y: cy }, rad));
}

function rotatePoint(p, c, rad) {
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const dx = p.x - c.x, dy = p.y - c.y;
  return { x: c.x + dx * cos - dy * sin, y: c.y + dx * sin + dy * cos };
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// Hit testing
function hitTestLayer(layer, x, y) {
  const cx = layer.x + layer.w / 2;
  const cy = layer.y + layer.h / 2;
  const rad = deg2rad(layer.rotation);
  const cos = Math.cos(-rad), sin = Math.sin(-rad);
  const dx = x - cx, dy = y - cy;
  const lx = dx * cos - dy * sin;
  const ly = dx * sin + dy * cos;
  return lx >= -layer.w / 2 && lx <= layer.w / 2 && ly >= -layer.h / 2 && ly <= layer.h / 2;
}

function hitTestHandles(layer, x, y) {
  const handles = [];
  const corners = rectCorners(layer);
  corners.forEach((pt, idx) => handles.push({ type: "scale", corner: idx, x: pt.x, y: pt.y }));
  const topMid = midpoint(corners[0], corners[1]);
  handles.push({ type: "rotate", x: topMid.x, y: topMid.y - 24 });
  return handles.find(h => Math.abs(x - h.x) <= 8 && Math.abs(y - h.y) <= 8) || null;
}

// Mouse interaction
let mouseDown = false;
let dragMode = null; // "move" | "scale" | "rotate" | "bgSample"
let dragInfo = null;
let shiftKey = false;

canvas.addEventListener("mousedown", e => {
  const x = e.offsetX, y = e.offsetY;
  mouseDown = true;

  // Background sample mode
  if (bgSampleMode && activeId) {
    const layer = layers.find(l => l.id === activeId && l.type === "image");
    if (layer && hitTestLayer(layer, x, y)) {
      sampledColor = sampleOverlayPixel(layer, x, y);
      bgSampleMode = false;
      render();
      return;
    }
  }

  // Handle dragging
  if (activeId) {
    const active = layers.find(l => l.id === activeId);
    const handle = hitTestHandles(active, x, y);
    if (handle) {
      dragMode = handle.type;
      dragInfo = { handle, startX: x, startY: y, startLayer: { ...active } };
      return;
    }
  }

  // Select topmost hit layer
  for (let i = layers.length - 1; i >= 0; i--) {
    if (!layers[i].visible) continue;
    if (hitTestLayer(layers[i], x, y)) {
      activeId = layers[i].id;
      dragMode = "move";
      dragInfo = { startX: x, startY: y, startLayer: { ...layers[i] } };
      render();
      return;
    }
  }

  // Click empty space
  activeId = null;
  dragMode = null;
  dragInfo = null;
  render();
});

canvas.addEventListener("mousemove", e => {
  if (!mouseDown || !dragMode || !activeId) return;
  const x = e.offsetX, y = e.offsetY;
  const layer = layers.find(l => l.id === activeId);
  if (!layer) return;

  if (dragMode === "move") {
    const dx = x - dragInfo.startX;
    const dy = y - dragInfo.startY;
    layer.x = dragInfo.startLayer.x + dx;
    layer.y = dragInfo.startLayer.y + dy;
  }

  if (dragMode === "scale") {
    const corner = dragInfo.handle.corner;
    const corners = rectCorners(dragInfo.startLayer);
    const anchorIndex = (corner + 2) % 4;
    const anchor = corners[anchorIndex];
    const center = midpoint(anchor, { x, y });
    const distStart = distanceTwoPoints(anchor, midpoint(corners[corner], anchor));
    const distCurrent = distanceTwoPoints(anchor, { x, y });
    let scale = distCurrent / Math.max(1, distStart);
    if (shiftKey) {
      layer.w = Math.max(10, dragInfo.startLayer.w * scale);
      layer.h = Math.max(10, dragInfo.startLayer.h * scale);
    } else {
      layer.w = Math.max(10, dragInfo.startLayer.w * scale);
      layer.h = Math.max(10, dragInfo.startLayer.h * scale);
    }
    layer.x = center.x - layer.w / 2;
    layer.y = center.y - layer.h / 2;
  }

  if (dragMode === "rotate") {
    const corners = rectCorners(dragInfo.startLayer);
    const topMid = midpoint(corners[0], corners[1]);
    const angle = Math.atan2(y - topMid.y, x - topMid.x);
    layer.rotation = ((angle * 180) / Math.PI) - 90;
  }

  render();
});

canvas.addEventListener("mouseup", () => { mouseDown = false; dragMode = null; dragInfo = null; });
canvas.addEventListener("mouseleave", () => { mouseDown = false; dragMode = null; dragInfo = null; });

document.addEventListener("keydown", e => {
  shiftKey = e.shiftKey;

  const layer = layers.find(l => l.id === activeId);
  if (!layer) return;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowUp") layer.y -= step;
    if (e.key === "ArrowDown") layer.y += step;
    if (e.key === "ArrowLeft") layer.x -= step;
    if (e.key === "ArrowRight") layer.x += step;
    render();
  }

  if (e.key === "Delete" || e.key === "Backspace") {
    deleteActiveLayer();
  }
});

// Distance util
function distanceTwoPoints(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Inspector
function updateInspector() {
  const layer = layers.find(l => l.id === activeId);
  if (!layer) {
    opacityRange.value = 1;
    blendSelect.value = "source-over";
    rotationRange.value = 0;
    scaleRange.value = 1;
    return;
  }
  opacityRange.value = layer.opacity ?? 1;
  blendSelect.value = layer.blend ?? "source-over";
  rotationRange.value = Math.round(layer.rotation ?? 0);
  const baseline = layer._baselineW || layer.w;
  const s = layer.w / baseline;
  scaleRange.value = Math.max(0.1, Math.min(4, s));
}

opacityRange.addEventListener("input", () => {
  const layer = layers.find(l => l.id === activeId);
  if (!layer) return;
  layer.opacity = parseFloat(opacityRange.value);
  render();
});

blendSelect.addEventListener("change", () => {
  const layer = layers.find(l => l.id === activeId);
  if (!layer) return;
  layer.blend = blendSelect.value;
  render();
});

rotationRange.addEventListener("input", () => {
  const layer = layers.find(l => l.id === activeId);
  if (!layer) return;
  layer.rotation = parseFloat(rotationRange.value);
  render();
});

scaleRange.addEventListener("input", () => {
  const layer = layers.find(l => l.id === activeId);
  if (!layer) return;
  const baselineW = layer._baselineW || layer.w;
  const baselineH = layer._baselineH || layer.h;
  const s = parseFloat(scaleRange.value);
  layer.w = Math.max(10, baselineW * s);
  layer.h = Math.max(10, baselineH * s);
  render();
});

// Layer actions
deleteLayerBtn.addEventListener("click", deleteActiveLayer);
duplicateLayerBtn.addEventListener("click", () => {
  const layer = layers.find(l => l.id === activeId);
  if (!layer) return;
  const copy = JSON.parse(JSON.stringify(layer));
  copy.id = genId();
  copy.x += 20; copy.y += 20;
  layers.push(copy);
  activeId = copy.id;
  render();
});

function deleteActiveLayer() {
  if (!activeId) return;
  layers = layers.filter(l => l.id !== activeId);
  activeId = null;
  render();
}

// Fit canvas to product aspect
function fitCanvasToImage() {
  if (!productImage || !productImage.width) return;
  const maxW = 900;
  const aspect = productImage.width / productImage.height;
  canvas.width = maxW;
  canvas.height = Math.round(maxW / aspect);
}

// Add image overlay
addImageInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.src = reader.result;
    img.onload = () => {
      const w = Math.min(canvas.width * 0.4, img.width);
      const h = (img.height / img.width) * w;
      const layer = {
        id: genId(),
        type: "image",
        img,
        x: canvas.width / 2 - w / 2,
        y: canvas.height / 2 - h / 2,
        w, h,
        _baselineW: w,
        _baselineH: h,
        rotation: 0,
        opacity: 1,
        blend: "source-over",
        visible: true
      };
      layers.push(layer);
      activeId = layer.id;
      // store original for reset
      originalImageMap.set(layer.id, img);
      render();
      addImageInput.value = "";
    };
  };
  reader.readAsDataURL(file);
});

// Add text overlay
addTextBtn.addEventListener("click", () => {
  const text = addTextInput.value.trim();
  if (!text) return;
  const size = 48;
  const layer = {
    id: genId(),
    type: "text",
    text,
    font: fontSelect.value || "Arial",
    size,
    color: "#222",
    x: canvas.width / 2,
    y: canvas.height / 2,
    w: size * Math.max(1, text.length) * 0.6,
    h: size,
    _baselineW: size * Math.max(1, text.length) * 0.6,
    _baselineH: size,
    rotation: 0,
    opacity: 1,
    blend: "source-over",
    visible: true
  };
  layers.push(layer);
  activeId = layer.id;
  render();
});

// Layers panel
function updateLayersPanel() {
  layersPanel.innerHTML = "";
  layers.forEach((layer, idx) => {
    const row = document.createElement("div");
    row.className = "layer-item" + (layer.id === activeId ? " active" : "");
    const icon = document.createElement("span");
    icon.textContent = layer.type === "image" ? "🖼️" : "🔤";
    const name = document.createElement("span");
    name.textContent = `${layer.type} ${idx + 1}`;
    const actions = document.createElement("div");
    const upBtn = document.createElement("button");
    upBtn.textContent = "Up";
    const downBtn = document.createElement("button");
    downBtn.textContent = "Down";
    const visBtn = document.createElement("button");
    visBtn.textContent = layer.visible ? "Hide" : "Show";

    upBtn.onclick = () => {
      const i = layers.indexOf(layer);
      if (i < layers.length - 1) {
        [layers[i], layers[i + 1]] = [layers[i + 1], layers[i]];
        render();
      }
    };
    downBtn.onclick = () => {
      const i = layers.indexOf(layer);
      if (i > 0) {
        [layers[i], layers[i - 1]] = [layers[i - 1], layers[i]];
        render();
      }
    };
    visBtn.onclick = () => {
      layer.visible = !layer.visible;
      render();
    };

    actions.appendChild(upBtn);
    actions.appendChild(downBtn);
    actions.appendChild(visBtn);

    row.appendChild(icon);
    row.appendChild(name);
    row.appendChild(actions);

    row.onclick = () => {
      activeId = layer.id;
      render();
    };

    layersPanel.appendChild(row);
  });
}

// Export / reset / fit
// Save mockup to cart (only if overlays exist)
downloadBtn.addEventListener("click", () => {
  // Check if there are any overlays
  if (layers.length === 0) {
    alert("You must add at least an image or text before saving to cart.");
    return;
  }

  const mockupData = canvas.toDataURL("image/png", 1.0);

  fetch("../Homepage/product-details.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `action=add&product_id=${productId}&quantity=1&mockup=${encodeURIComponent(mockupData)}`,
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    alert("Mockup saved to cart!");
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl && typeof data.total_items !== "undefined") {
      cartCountEl.textContent = data.total_items;
    }
  })
  .catch(err => console.error("Error saving mockup:", err));
});

resetBtn.addEventListener("click", () => {
  layers = [];
  activeId = null;
  sampledColor = null;
  bgSampleMode = false;
  originalImageMap.clear();
  render();
});

fitCanvasBtn.addEventListener("click", () => {
  fitCanvasToImage();
  render();
});

// Background removal (naive color-based)
bgSampleBtn.addEventListener("click", () => {
  const layer = layers.find(l => l.id === activeId && l.type === "image");
  if (!layer) return alert("Select an image overlay first.");
  bgSampleMode = true;
  alert("Background sample mode: click the background area on the overlay to sample color.");
});

bgRemoveBtn.addEventListener("click", () => {
  const layer = layers.find(l => l.id === activeId && l.type === "image");
  if (!layer) return alert("Select an image overlay first.");
  if (!sampledColor) return alert("Sample a background color first.");

  const tol = parseInt(bgTolerance.value, 10);
  const processed = removeBackground(layer, sampledColor, tol);
  if (processed) {
    layer.img = processed;
    render();
  }
});

bgResetBtn.addEventListener("click", () => {
  const layer = layers.find(l => l.id === activeId && l.type === "image");
  if (!layer) return;
  const original = originalImageMap.get(layer.id);
  if (original) {
    layer.img = original;
    sampledColor = null;
    render();
  }
});

// Sample pixel color from overlay at canvas point
function sampleOverlayPixel(layer, x, y) {
  // Create an offscreen canvas to read the pixel in layer local space
  const off = document.createElement("canvas");
  off.width = layer.w;
  off.height = layer.h;
  const octx = off.getContext("2d");
  octx.drawImage(layer.img, 0, 0, layer.w, layer.h);

  // Convert canvas point to layer local coordinates
  const cx = layer.x + layer.w / 2, cy = layer.y + layer.h / 2;
  const rad = deg2rad(layer.rotation);
  const cos = Math.cos(-rad), sin = Math.sin(-rad);
  const dx = x - cx, dy = y - cy;
  const lx = dx * cos - dy * sin + layer.w / 2;
  const ly = dx * sin + dy * cos + layer.h / 2;

  if (lx < 0 || ly < 0 || lx >= layer.w || ly >= layer.h) return null;

  const data = octx.getImageData(Math.floor(lx), Math.floor(ly), 1, 1).data;
  return { r: data[0], g: data[1], b: data[2], a: data[3] };
}

// Remove background by color similarity
function removeBackground(layer, sample, tolerance) {
  const off = document.createElement("canvas");
  off.width = layer.img.naturalWidth || layer.img.width;
  off.height = layer.img.naturalHeight || layer.img.height;
  const octx = off.getContext("2d");
  octx.drawImage(layer.img, 0, 0, off.width, off.height);
  const imgData = octx.getImageData(0, 0, off.width, off.height);
  const d = imgData.data;

  const toRGB = (r, g, b) => ({ r, g, b });
  const target = toRGB(sample.r, sample.g, sample.b);

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const dist = colorDistance({ r, g, b }, target);
    if (dist <= tolerance) {
      d[i + 3] = 0; // make transparent
    }
  }
  octx.putImageData(imgData, 0, 0);

  const processed = new Image();
  processed.src = off.toDataURL("image/png");
  return processed;
}

function colorDistance(c1, c2) {
  const dr = c1.r - c2.r, dg = c1.g - c2.g, db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}
