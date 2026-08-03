/**
 * Generates the site's raster artwork: public/ogp.png, the favicons and the
 * touch icon, all derived from the source art in src/assets/.
 *
 * One-off: run it when the artwork or the wording changes, and commit the
 * result. Uses the copy of sharp that Astro already depends on.
 *
 *   node scripts/generate-ogp.mjs
 *
 * Text is drawn with Yomogi, the site's display face. If Yomogi is not
 * installed as a system font the SVG falls back to a generic sans and the
 * result will look off — install it from Google Fonts first.
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const WIDTH = 1200;
const HEIGHT = 630;
const ART_WIDTH = 470;
const SUIBARI_LOGO_WIDTH = 240;
const SUIBARI_LOGO_RIGHT = 40;
const SUIBARI_LOGO_BOTTOM = 36;

const paper = '#fdf8ef';
const ink = '#3d3733';
const skyDeep = '#3b7ea1';
const marker = '#ffe9a8';

// Right-hand slab: the trio artwork, cropped to the panel and biased upward so
// all three faces stay in frame.
const art = await sharp(join(root, 'src/assets/characters/trio.png'))
  .resize({ width: ART_WIDTH, height: HEIGHT, fit: 'cover', position: 'top' })
  .toBuffer();

// Keep the publisher mark inside the lower-right corner of the text panel.
const suibariLogo = await sharp(join(root, 'src/assets/brand/suibari-logo.png'))
  .resize({ width: SUIBARI_LOGO_WIDTH, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();
const suibariLogoMetadata = await sharp(suibariLogo).metadata();

const background = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d8f1f8"/>
      <stop offset="55%" stop-color="${paper}"/>
      <stop offset="100%" stop-color="${paper}"/>
    </linearGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" filter="url(#grain)" opacity="0.06"/>

  <!-- Highlighter behind the title -->
  <rect x="76" y="198" width="430" height="26" fill="${marker}"/>

  <text x="76" y="220" font-family="Yomogi, sans-serif" font-size="76" fill="${ink}">全肯定botたん</text>
  <text x="76" y="280" font-family="Yomogi, sans-serif" font-size="34" fill="${skyDeep}">Zenkoutei Bot-tan</text>

  <text x="76" y="407" font-family="Yomogi, sans-serif" font-size="25" fill="${ink}">NagiとBlueskyで、みんなを全肯定する女の子。</text>
  <text x="76" y="451" font-family="Yomogi, sans-serif" font-size="25" fill="${ink}">A girl who affirms everyone, on Nagi and Bluesky.</text>

</svg>`;

await sharp(Buffer.from(background))
  .composite([
    { input: art, left: WIDTH - ART_WIDTH, top: 0 },
    {
      input: suibariLogo,
      left: WIDTH - ART_WIDTH - SUIBARI_LOGO_RIGHT - SUIBARI_LOGO_WIDTH,
      top: HEIGHT - SUIBARI_LOGO_BOTTOM - suibariLogoMetadata.height,
    },
  ])
  // Palette + quantisation: the art is flat-shaded, so this cuts the file to
  // roughly a fifth with no visible loss.
  .png({ palette: true, quality: 88, effort: 9 })
  .toFile(join(root, 'public/ogp.png'));

console.log('wrote public/ogp.png');

// Favicons come from the pixel-art icon: it was drawn for small sizes, so it
// stays crisp at 16 and 32px where the line-art version turns to mush.
for (const size of [32, 192]) {
  await sharp(join(root, 'src/assets/brand/bot-icon-dot.png'))
    .resize({ width: size, height: size, kernel: 'nearest' })
    .png()
    .toFile(join(root, `public/favicon-${size}.png`));
  console.log(`wrote public/favicon-${size}.png`);
}

// Home-screen icon: the line-art icon centred on the paper background.
const touchMark = await sharp(join(root, 'src/assets/brand/bot-icon.png'))
  .resize({ width: 148, height: 148, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();

await sharp({
  create: { width: 180, height: 180, channels: 4, background: paper },
})
  .composite([{ input: touchMark, gravity: 'center' }])
  .png()
  .toFile(join(root, 'public/apple-touch-icon.png'));

console.log('wrote public/apple-touch-icon.png');
