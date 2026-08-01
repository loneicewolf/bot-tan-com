export const LOCALES = ['ja', 'en'] as const;
export type Lang = (typeof LOCALES)[number];

/** Bot-tan's utility-AI states, as emitted by the biorhythm server. */
export const STATUSES = ['Sleep', 'WakeUp', 'Study', 'FreeTime', 'Relax'] as const;
export type Status = (typeof STATUSES)[number];

export interface ProfileRow {
  label: string;
  value: string;
}

export interface CharacterCopy {
  /** Heading emoji, e.g. 🦋 */
  emoji: string;
  name: string;
  /** One-line epithet shown under the name. */
  tagline: string;
  profileHeading: string;
  profile: ProfileRow[];
  personalityHeading: string;
  /** Rendered as separate paragraphs. */
  personality: string[];
  imageAlt: string;
}

export type LinkId =
  | 'nagi'
  | 'bluesky'
  | 'room'
  | 'labeler'
  | 'discord'
  | 'diary'
  | 'patreon'
  | 'fanbox'
  | 'github';

export interface LinkCopy {
  /** Selects the artwork in Links.astro; not shown to the reader. */
  id: LinkId;
  /** Fallback mark for links with no artwork. */
  emoji: string;
  title: string;
  description: string;
  href: string;
}

export interface Dictionary {
  meta: {
    title: string;
    description: string;
    ogAlt: string;
  };

  nav: {
    about: string;
    dashboard: string;
    friends: string;
    links: string;
    /** Label of the *other* language, used on the toggle button. */
    switchTo: string;
    skipToContent: string;
  };

  hero: {
    /** Rendered as separate lines inside a blockquote. */
    catch: string[];
    subtitle: string;
    scrollHint: string;
    imageAlt: string;
    cta: string;
  };

  about: {
    heading: string;
    lead: string;
    character: CharacterCopy;
    /** Extra "did you know" notes rendered as taped-on sticky notes. */
    notes: { emoji: string; text: string }[];
    snsHeading: string;
  };

  dashboard: {
    heading: string;
    lead: string;
    liveLabel: string;
    jstLabel: string;
    connection: {
      connecting: string;
      open: string;
      closed: string;
      error: string;
    };
    mood: {
      heading: string;
      nextLabel: string;
      statusLabels: Record<Status, string>;
      statusHeading: string;
    };
    ability: {
      heading: string;
      name: string;
      jobLabel: string;
      job: string;
      levelLabel: string;
      energyLabel: string;
      stats: {
        affirmation: string;
        bskyLove: string;
        talk: string;
        intelligence: string;
        luck: string;
        spread: string;
        party: string;
        magic: string;
      };
    };
    daily: {
      heading: string;
      followers: string;
      likes: string;
      likesSpeed: string;
      affirmationCount: string;
      affirmationSpeed: string;
      uniqueAffirmationUserCount: string;
      fortune: string;
      cheer: string;
      analysis: string;
      dj: string;
      anniversary: string;
      answer: string;
      bskyrateHourly: string;
      rpd: string;
      aiErrorRate: string;
    };
    charts: {
      followerHistory: string;
      followerHistoryX: string;
      followerHistoryY: string;
      langBreakdown: string;
    };
    topPost: {
      heading: string;
      commentLabel: string;
      empty: string;
      error: string;
    };
    /** Shown when the WebSocket never connects. */
    offline: string;
  };

  friends: {
    heading: string;
    lead: string;
    characters: CharacterCopy[];
    morpho: {
      emoji: string;
      name: string;
      text: string;
    };
  };

  links: {
    heading: string;
    lead: string;
    primary: LinkCopy[];
    secondaryHeading: string;
    secondary: LinkCopy[];
  };

  footer: {
    madeBy: string;
    authorName: string;
    authorHref: string;
    disclaimer: string;
    backToTop: string;
  };
}
