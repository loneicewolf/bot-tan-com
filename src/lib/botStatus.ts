/**
 * Shape of the payload broadcast by the biorhythm server's WebSocket at
 * `/ws` (see apps/biorhythm_server/src/manager.ts in bsky-affirmative-bot).
 * Every field is optional here — the site must not break when the bot adds,
 * renames, or omits one.
 */

export type BotStatusName = 'Sleep' | 'WakeUp' | 'Study' | 'FreeTime' | 'Relax';

export interface DailyStats {
  followers?: number;
  likes?: number;
  affirmationCount?: number;
  uniqueAffirmationUserCount?: number;
  fortune?: number;
  cheer?: number;
  analysis?: number;
  dj?: number;
  anniversary?: number;
  answer?: number;
  rpd?: number;
  rpdError?: number;
  bskyrate?: number;
  /** Start of the current counting window, used to derive per-minute rates. */
  lastInitializedDate?: string;
  /** `[languageCode, count]` pairs. */
  lang?: [string, number][];
  /** AT URI of the post Bot-tan picked as today's recommendation. */
  topPost?: string;
  botComment?: string;
}

export interface TotalStats {
  followers?: number;
  likes?: number;
  affirmationCount?: number;
  reply?: number;
  analysis?: number;
  fortune?: number;
  cheer?: number;
  dj?: number;
  anniversary?: number;
}

export interface BotStatusPayload {
  /** 0-100. */
  energy?: number;
  mood?: string;
  mood_en?: string;
  status?: BotStatusName;
  nextStepTime?: string;
  utilities?: Partial<Record<BotStatusName, number>>;
  dailyStats?: DailyStats;
  totalStats?: TotalStats;
}

export interface FollowerPoint {
  date: string;
  count: number;
}

const WS_URL = import.meta.env.PUBLIC_BOT_WS_URL ?? 'wss://bot-tan.suibari.com/ws';
const FOLLOWER_API_URL =
  import.meta.env.PUBLIC_FOLLOWER_API_URL ??
  'https://bottan-measurement-worker.404-not-found-address.workers.dev/';

/** In dev the biorhythm server usually runs locally without TLS. */
function resolveWsUrl(): string {
  if (import.meta.env.PROD) return WS_URL;
  return import.meta.env.PUBLIC_BOT_WS_URL ?? 'ws://localhost:3000/ws';
}

export type ConnectionState = 'connecting' | 'open' | 'closed' | 'error';

export interface ConnectOptions {
  onMessage: (data: BotStatusPayload) => void;
  onStateChange: (state: ConnectionState) => void;
}

/**
 * Connects to the bot's status feed and keeps trying if the socket drops.
 * The original portfolio implementation gave up after the first disconnect;
 * this one backs off exponentially up to 30s and reconnects indefinitely.
 */
export function connectBotStatus({ onMessage, onStateChange }: ConnectOptions): () => void {
  let socket: WebSocket | null = null;
  let retries = 0;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  const open = () => {
    if (disposed) return;
    onStateChange('connecting');

    try {
      socket = new WebSocket(resolveWsUrl());
    } catch {
      onStateChange('error');
      scheduleRetry();
      return;
    }

    socket.onopen = () => {
      retries = 0;
      onStateChange('open');
    };

    socket.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data) as BotStatusPayload);
      } catch {
        // A malformed frame is not worth tearing the connection down for.
      }
    };

    socket.onerror = () => onStateChange('error');

    socket.onclose = () => {
      if (disposed) return;
      onStateChange('closed');
      scheduleRetry();
    };
  };

  const scheduleRetry = () => {
    if (disposed) return;
    clearTimeout(retryTimer);
    // Exponential backoff with jitter, so that a bot-server restart does not
    // bring every open tab back in lockstep.
    const base = Math.min(30_000, 2000 * 2 ** retries);
    const delay = base * (0.7 + Math.random() * 0.6);
    retries += 1;
    retryTimer = setTimeout(open, delay);
  };

  open();

  return () => {
    disposed = true;
    clearTimeout(retryTimer);
    socket?.close();
  };
}

/** Historical follower counts, from the Cloudflare measurement worker. */
export async function fetchFollowerHistory(): Promise<FollowerPoint[]> {
  try {
    const response = await fetch(FOLLOWER_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as FollowerPoint[]) : [];
  } catch (error) {
    console.error('Failed to fetch follower history:', error);
    return [];
  }
}

export interface RecommendedPost {
  text: string;
  authorHandle: string;
  authorAvatar?: string;
  createdAt: string;
  url: string;
}

/**
 * Resolves an AT URI to a displayable post via the public AppView.
 *
 * Deliberately a plain `fetch` rather than `@atproto/api` — this one endpoint
 * is all the site needs, and the SDK would add hundreds of kilobytes.
 */
export async function fetchPost(uri: string): Promise<RecommendedPost | null> {
  try {
    const endpoint = new URL('https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts');
    endpoint.searchParams.set('uris', uri);

    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = (await response.json()) as {
      posts?: {
        uri: string;
        author: { handle: string; avatar?: string };
        record?: { text?: string; createdAt?: string };
      }[];
    };

    const post = data.posts?.[0];
    if (!post) return null;

    const rkey = post.uri.split('/').pop();

    return {
      text: post.record?.text ?? '',
      authorHandle: post.author.handle,
      authorAvatar: post.author.avatar,
      createdAt: post.record?.createdAt ?? new Date().toISOString(),
      url: `https://bsky.app/profile/${post.author.handle}/post/${rkey}`,
    };
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}
