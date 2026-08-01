/**
 * Build-time generator for hand-drawn looking SVG paths.
 *
 * Everything here runs in Astro component frontmatter, so the wobble is baked
 * into the emitted HTML — no client-side JS and no runtime cost. Each frame
 * passes a different `seed` so no two borders look identical.
 */

/** Deterministic PRNG (mulberry32), so a given seed always draws the same line. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turns a string into a stable numeric seed. */
export function seedFrom(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Walks the perimeter of a rounded rectangle, jittering each sample point.
 * The result is a closed polyline smoothed into a Catmull-Rom-ish curve.
 */
function wobblyRectPoints(
  w: number,
  h: number,
  radius: number,
  jitter: number,
  step: number,
  rand: () => number,
): Point[] {
  const r = Math.min(radius, w / 2, h / 2);
  const pts: Point[] = [];

  /** Straight run between two corners. */
  const line = (from: Point, to: Point) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    const n = Math.max(2, Math.round(len / step));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      pts.push({ x: from.x + dx * t, y: from.y + dy * t });
    }
  };

  /** Quarter-circle corner, sampled at a fixed angular resolution. */
  const arc = (cx: number, cy: number, startAngle: number) => {
    const n = 6;
    for (let i = 0; i <= n; i++) {
      const a = startAngle + (Math.PI / 2) * (i / n);
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
  };

  line({ x: r, y: 0 }, { x: w - r, y: 0 });
  arc(w - r, r, -Math.PI / 2);
  line({ x: w, y: r }, { x: w, y: h - r });
  arc(w - r, h - r, 0);
  line({ x: w - r, y: h }, { x: r, y: h });
  arc(r, h - r, Math.PI / 2);
  line({ x: 0, y: h - r }, { x: 0, y: r });
  arc(r, r, Math.PI);

  // Nudge every sample. Corners get less jitter so the shape stays readable.
  return pts.map((p) => ({
    x: p.x + (rand() - 0.5) * jitter * 2,
    y: p.y + (rand() - 0.5) * jitter * 2,
  }));
}

/** Renders points as a closed path using quadratic midpoint smoothing. */
function smoothClosedPath(pts: Point[]): string {
  if (pts.length < 3) return '';

  const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const n = (i: number) => pts[(i + pts.length) % pts.length]!;

  const start = mid(n(pts.length - 1), n(0));
  let d = `M${start.x.toFixed(2)},${start.y.toFixed(2)}`;

  for (let i = 0; i < pts.length; i++) {
    const ctrl = n(i);
    const end = mid(n(i), n(i + 1));
    d += `Q${ctrl.x.toFixed(2)},${ctrl.y.toFixed(2)} ${end.x.toFixed(2)},${end.y.toFixed(2)}`;
  }

  return `${d}Z`;
}

export interface SketchRect {
  /** `d` attribute for the outer stroke. */
  d: string;
  /** A second, offset pass — the "drew over it twice" look. */
  dSecond: string;
  /** Approximate path length, for the stroke-dashoffset draw-in animation. */
  length: number;
  viewBox: string;
}

/**
 * Generates a hand-drawn rounded rectangle in a fixed 100x100 viewBox. Consumers
 * stretch it with `preserveAspectRatio="none"` and keep the stroke crisp with
 * `vector-effect="non-scaling-stroke"`.
 */
export function sketchRect(options: {
  seed: number | string;
  radius?: number;
  jitter?: number;
  /** Draw the border twice, slightly offset, like a pen going round again. */
  double?: boolean;
}): SketchRect {
  const { radius = 6, jitter = 0.7, double = false } = options;
  const seed = typeof options.seed === 'string' ? seedFrom(options.seed) : options.seed;
  const rand = rng(seed);

  const size = 100;
  const d = smoothClosedPath(wobblyRectPoints(size, size, radius, jitter, 9, rand));
  const dSecond = double
    ? smoothClosedPath(wobblyRectPoints(size, size, radius, jitter * 1.4, 11, rand))
    : '';

  return {
    d,
    dSecond,
    // Perimeter of the box plus slack for the wobble. Overestimating is safe:
    // the dash simply starts further off-screen before settling at 0.
    length: Math.round(size * 4 * 1.35),
    viewBox: `0 0 ${size} ${size}`,
  };
}

/**
 * Generates a hand-drawn underline, used beneath section headings.
 * Occupies a 100x10 viewBox.
 */
export function sketchUnderline(seedInput: number | string): { d: string; length: number } {
  const seed = typeof seedInput === 'string' ? seedFrom(seedInput) : seedInput;
  const rand = rng(seed);

  const n = 14;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = (100 / n) * i;
    // Sags gently in the middle, the way a quick pen stroke does.
    const sag = Math.sin((i / n) * Math.PI) * 1.8;
    const y = 5 + sag + (rand() - 0.5) * 1.6;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }

  return { d, length: 120 };
}
