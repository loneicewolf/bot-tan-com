/**
 * Generates the bot-tan.com brand logo: Bot-tan's line-art mark next to a
 * chunky rounded wordmark in white with a thick blue outline.
 *
 *   node scripts/generate-logo.mjs
 *
 * Needs "Mochiy Pop One" installed as a system font (Google Fonts). It was
 * picked over the geometric rounded faces because its bubbly, soft-terminal
 * letterforms match the warmth of the suibari.com logo. Commit the output.
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Sampled from suibari-logo.png so the two marks sit together cleanly. */
const BRAND = '#00b2ff';

const WIDTH = 1220;
const HEIGHT = 240;
const MARK_X = 16;

const mark = await sharp(join(root, 'src/assets/brand/bot-icon.png'))
  .resize({ height: 190, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();
const markMeta = await sharp(mark).metadata();

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <text x="${MARK_X + (markMeta.width ?? 0) + 34}" y="160"
        font-family="Mochiy Pop One, sans-serif"
        font-size="124"
        letter-spacing="0"
        fill="#ffffff"
        stroke="${BRAND}"
        stroke-width="17"
        stroke-linejoin="round"
        paint-order="stroke fill">bot-tan.com</text>
</svg>`;

const logo = await sharp(Buffer.from(svg))
  .composite([
    {
      input: mark,
      left: MARK_X,
      top: Math.round((HEIGHT - (markMeta.height ?? 0)) / 2),
    },
  ])
  .png()
  .toBuffer();

// Trim the surplus transparent margin so the logo behaves like suibari-logo.png.
await sharp(logo).trim({ threshold: 1 }).toFile(join(root, 'src/assets/brand/bot-tan-logo.png'));

const out = await sharp(join(root, 'src/assets/brand/bot-tan-logo.png')).metadata();
console.log(`wrote src/assets/brand/bot-tan-logo.png (${out.width}x${out.height})`);
