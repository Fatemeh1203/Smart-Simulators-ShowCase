// پیاده‌سازی سبک الگوریتم Marching Squares برای رسم خطوط هم‌مقدار (هم‌پتانسیل)
export function marchingSquares(
  values: number[][],
  nx: number,
  ny: number,
  threshold: number,
): [number, number, number, number][] {
  const segs: [number, number, number, number][] = [];

  const interp = (i0: number, j0: number, i1: number, j1: number): [number, number] => {
    const v0 = values[j0][i0];
    const v1 = values[j1][i1];
    const t = v1 === v0 ? 0.5 : (threshold - v0) / (v1 - v0);
    const x = i0 + (i1 - i0) * t;
    const y = j0 + (j1 - j0) * t;
    return [x, y];
  };

  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const tl = values[j][i];
      const tr = values[j][i + 1];
      const br = values[j + 1][i + 1];
      const bl = values[j + 1][i];
      let idx = 0;
      if (tl > threshold) idx |= 8;
      if (tr > threshold) idx |= 4;
      if (br > threshold) idx |= 2;
      if (bl > threshold) idx |= 1;
      if (idx === 0 || idx === 15) continue;

      const top = interp(i, j, i + 1, j);
      const right = interp(i + 1, j, i + 1, j + 1);
      const bottom = interp(i, j + 1, i + 1, j + 1);
      const left = interp(i, j, i, j + 1);

      const pushSeg = (a: [number, number], b: [number, number]) => segs.push([a[0], a[1], b[0], b[1]]);

      switch (idx) {
        case 1:
        case 14:
          pushSeg(left, bottom);
          break;
        case 2:
        case 13:
          pushSeg(bottom, right);
          break;
        case 3:
        case 12:
          pushSeg(left, right);
          break;
        case 4:
        case 11:
          pushSeg(top, right);
          break;
        case 5:
          pushSeg(left, top);
          pushSeg(bottom, right);
          break;
        case 6:
        case 9:
          pushSeg(top, bottom);
          break;
        case 7:
        case 8:
          pushSeg(left, top);
          break;
        case 10:
          pushSeg(top, right);
          pushSeg(left, bottom);
          break;
      }
    }
  }
  return segs;
}
