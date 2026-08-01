// Ships as plain JS with no bundled types; it registers itself with Chart.js
// as a side effect and exposes nothing we call directly.
declare module 'chartjs-adapter-date-fns';

interface ImportMetaEnv {
  /** WebSocket endpoint of the bot's biorhythm server. */
  readonly PUBLIC_BOT_WS_URL?: string;
  /** HTTP endpoint returning the follower-count history. */
  readonly PUBLIC_FOLLOWER_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
