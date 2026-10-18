/*
 * Node-safe PDF text extraction for pdf-parse v2.
 *
 * pdf-parse v2's browser entry references DOMMatrix/ImageData/Path2D during
 * module initialization. On a normal Node server those browser globals do not
 * exist, so importing the package at module scope can crash the whole backend.
 * We install small 2D-compatible fallbacks only when the globals are absent,
 * then lazily import pdf-parse. This keeps startup safe and avoids the old
 * "pdfParse is not a function" API mismatch.
 */

let parserPromise = null;

const installPdfJsGlobals = () => {
  if (!globalThis.DOMMatrix) {
    globalThis.DOMMatrix = class DOMMatrix {
      constructor(init) {
        if (Array.isArray(init)) {
          [this.a, this.b, this.c, this.d, this.e, this.f] = init;
        } else if (init && typeof init === "object") {
          this.a = Number(init.a ?? 1);
          this.b = Number(init.b ?? 0);
          this.c = Number(init.c ?? 0);
          this.d = Number(init.d ?? 1);
          this.e = Number(init.e ?? 0);
          this.f = Number(init.f ?? 0);
        } else {
          this.a = 1;
          this.b = 0;
          this.c = 0;
          this.d = 1;
          this.e = 0;
          this.f = 0;
        }
      }

      multiply() { return this; }
      multiplySelf() { return this; }
      preMultiplySelf() { return this; }
      translate() { return this; }
      translateSelf() { return this; }
      scale() { return this; }
      scaleSelf() { return this; }
      rotate() { return this; }
      rotateSelf() { return this; }
      inverse() { return new globalThis.DOMMatrix(); }
      transformPoint(point = {}) {
        return {
          x: Number(point.x || 0),
          y: Number(point.y || 0),
          z: Number(point.z || 0),
          w: Number(point.w || 1),
        };
      }
    };
  }

  if (!globalThis.ImageData) {
    globalThis.ImageData = class ImageData {
      constructor(data, width, height) {
        this.data = data || new Uint8ClampedArray(Math.max(0, Number(width || 0) * Number(height || 0) * 4));
        this.width = Number(width || 0);
        this.height = Number(height || 0);
      }
    };
  }

  if (!globalThis.Path2D) {
    globalThis.Path2D = class Path2D {};
  }
};

const loadPdfParser = async () => {
  if (!parserPromise) {
    parserPromise = (async () => {
      installPdfJsGlobals();
      const mod = await import("pdf-parse");
      if (!mod?.PDFParse) {
        throw new Error("pdf-parse v2 PDFParse API is unavailable.");
      }
      return mod.PDFParse;
    })();
  }
  return parserPromise;
};

export const extractPdfText = async (filePath) => {
  const fs = await import("node:fs");
  const buffer = fs.readFileSync(filePath);
  const PDFParse = await loadPdfParser();
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return String(result?.text || "");
  } finally {
    await parser.destroy().catch(() => {});
  }
};


export default extractPdfText;
