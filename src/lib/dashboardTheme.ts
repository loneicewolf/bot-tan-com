import type { HealthStateId, Status } from '../i18n/types';

/**
 * Chart colours for the dashboard, in one place so the palette can be
 * re-validated as a set.
 *
 * The site is deliberately light-only (`color-scheme: light` in global.css),
 * so there is a single mode to satisfy. Every value below was checked against
 * the paper surface with the dataviz validator; see PALETTE_PROVENANCE.
 */

/** The surface every colour here was validated against. */
export const SURFACE = '#fdf8ef';

/**
 * The five activity states on the day timeline. Any two can end up side by
 * side as the day repeats a state, so this was validated with `--pairs all`,
 * not just adjacent pairs.
 *
 *   node scripts/validate_palette.js \
 *     "#535196,#c88011,#5285d9,#339a83,#9c4438" \
 *     --mode light --surface "#fdf8ef" --pairs all
 *   → ALL CHECKS PASS (worst all-pairs ΔE 11.3 protan / 16.0 normal vision)
 *
 * Hues were chosen to fit what each state means — night indigo, sunrise amber,
 * study blue, butterfly teal, coffee brick — then the exact steps were searched
 * for the least saturated combination that still clears the gates, so the band
 * sits quietly on paper.
 */
export const STATUS_COLORS: Record<Status, string> = {
  Sleep: '#535196',
  WakeUp: '#c88011',
  Study: '#5285d9',
  FreeTime: '#339a83',
  Relax: '#9c4438',
};

/**
 * Emoji do the second job of telling the states apart — the timeline never
 * relies on colour alone. Same glyphs as the "what is she doing?" tiles.
 */
export const STATUS_EMOJI: Record<Status, string> = {
  Sleep: '😴',
  WakeUp: '🌅',
  Study: '📖',
  FreeTime: '🦋',
  Relax: '☕',
};

/**
 * One hue per network. These never share a chart with each other — Bluesky and
 * Nagi each get their own panel — so they only need contrast against paper
 * (4.24:1 and 4.19:1), not separation from one another.
 */
export const NETWORK_COLORS = {
  bsky: '#3b7ea1',
  nagi: '#4c6fe7',
} as const;

/**
 * Reserved status scale for the liveness strip. Never used for a data series.
 * Always shipped with an icon and a text label, never colour alone.
 * Contrast vs paper: 4.85 / 4.65 / 5.14 / 3.65 — all clear the 3:1 mark floor,
 * and the first three clear 4.5:1 so they can carry text too.
 */
export const HEALTH_COLORS: Record<HealthStateId, string> = {
  ok: '#2e7d32',
  stale: '#a16207',
  down: '#c0392b',
  unknown: '#8a8079',
  unconfigured: '#8a8079',
};

/** Marks that are context rather than data — sparkline tails, gridlines. */
export const MUTED_INK = '#a9a096';
export const GRID_COLOR = 'rgba(61, 55, 51, 0.14)';
export const INK = '#3d3733';

/** Event markers under the timeline band. */
export const EVENT_EMOJI: Record<string, string> = {
  fortune: '🔮',
  cheer: '📣',
  analysis: '🔎',
  dj: '🎧',
  anniversary: '🎂',
  answer: '💬',
  recap: '📅',
};
