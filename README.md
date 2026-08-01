# bot-tan.com

全肯定botたん（Zenkoutei Bot-tan）の公式ポータルサイト。

Bluesky bot 本体は [suibari/bsky-affirmative-bot](https://github.com/suibari/bsky-affirmative-bot) にあります。
このリポジトリは紹介サイトのみで、bot のロジックは含みません。

## 構成

- **Astro 7**（`output: static`）+ **Tailwind CSS v4**
- 1ページ縦スクロール構成。`/` が日本語、`/en/` が英語
- ホスティング: **Cloudflare Pages**

```
src/
├── i18n/                   # 全コピーをここに集約（ja.ts / en.ts は Dictionary 型で同期を強制）
├── lib/
│   ├── sketch.ts           # 手描き風 SVG パスをビルド時に生成
│   └── botStatus.ts        # bot ステータスの WebSocket / API クライアント
├── components/
│   ├── SkyBackdrop.astro   # スクロールで移り変わる空
│   ├── Doodles.astro       # 背景に漂う手描きの蝶と雲
│   ├── SketchFrame.astro   # 手描き枠線
│   ├── sections/           # 各セクション
│   └── dashboard/          # リアルタイムダッシュボード
└── pages/
    ├── index.astro         # ja
    └── en/index.astro      # en
```

## 開発

```sh
npm install
npm run dev        # http://localhost:4321
npm run build
npm run preview
npm run check      # 型チェック（en.ts の翻訳漏れもここで落ちる）
```

コピーを直すときは `src/i18n/ja.ts` と `src/i18n/en.ts` の両方を編集してください。
`Dictionary` 型（`src/i18n/types.ts`）でキーの過不足を検出します。

ブランドロゴ・OGP・favicon を作り直す場合（生成物はコミットします）:

```sh
node scripts/generate-logo.mjs  # bot-tan.com ロゴ。要 Mochiy Pop One
node scripts/generate-ogp.mjs   # OGP / favicon / タッチアイコン。要 Yomogi
```

どちらもフォントをシステムにインストールしてから実行してください（Google Fonts）。

## ダッシュボードの接続先

bot の biorhythm server から WebSocket でリアルタイムに受け取ります。
既定値がコードに入っているので `.env` なしでも動きます（`.env.example` 参照）。

| 変数 | 既定値 |
| :--- | :--- |
| `PUBLIC_BOT_WS_URL` | `wss://bot-tan.suibari.com/ws`（dev では `ws://localhost:3000/ws`） |
| `PUBLIC_FOLLOWER_API_URL` | フォロワー履歴を返す Cloudflare Worker |

おすすめ投稿は `https://public.api.bsky.app` の公開 XRPC を直接叩いています（`@atproto/api` は入れていません）。

## デプロイ（Cloudflare Pages）

| 項目 | 値 |
| :--- | :--- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22 以上 |

### ⚠️ ハンドル検証について

`bot-tan.com` は **botたん自身の Bluesky ハンドル**です。
`public/.well-known/atproto-did` に botたんの DID を置いてあり、`public/_headers` で
`text/plain` として配信しています。**このファイルを消すとハンドル検証が壊れる可能性があります。**

DNS TXT (`_atproto.bot-tan.com`) 方式で検証されている場合は不要ですが、
残しておいても害はないため保険として配置しています。
