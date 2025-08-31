// Simple k-means over image pixels to extract dominant colors.
export async function extractPalette(
  img: HTMLImageElement,
  k = 5
): Promise<{ primary: string; secondary: string; palette: string[] }> {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  // Materialize pixels as tuples
  const pts: Array<[number, number, number]> = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = (data[i] ?? 0) as number;
    const g = (data[i + 1] ?? 0) as number;
    const b = (data[i + 2] ?? 0) as number;
    pts.push([r, g, b]);
  }
  if (pts.length === 0) {
    return { primary: 'rgb(29,185,84)', secondary: '#0e7a43', palette: ['rgb(29,185,84)'] };
  }

  const centers: Array<[number, number, number]> = pts.slice(0, Math.max(1, Math.min(k, pts.length)));
  const assigns: number[] = new Array(pts.length).fill(0);

  for (let iter = 0; iter < 10; iter++) {
    // Assign step
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]!;
      let best = Number.POSITIVE_INFINITY;
      let idx = 0;
      for (let c = 0; c < centers.length; c++) {
        const d = dist2(p, centers[c]!);
        if (d < best) {
          best = d;
          idx = c;
        }
      }
      assigns[i] = idx;
    }
    // Update step
    for (let c = 0; c < centers.length; c++) {
      let r = 0,
        g = 0,
        b = 0,
        n = 0;
      for (let i = 0; i < pts.length; i++) {
        if (assigns[i] === c) {
          const p = pts[i];
          if (!p) continue;
          r += p[0];
          g += p[1];
          b += p[2];
          n++;
        }
      }
      if (n > 0) centers[c] = [r / n, g / n, b / n];
    }
  }

  const sorted = centers.slice().sort((a, b) => luminance(b) - luminance(a));
  const palette = sorted.map((c) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`);
  return { primary: palette[0] || 'rgb(29,185,84)', secondary: palette[1] || '#0e7a43', palette };
}

function dist2(a: [number, number, number], b: [number, number, number]) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}
function luminance(c: [number, number, number]) {
  const r = c[0] / 255;
  const g = c[1] / 255;
  const b = c[2] / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}