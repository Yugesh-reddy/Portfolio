# yugesh-portfolio

Personal portfolio + blog for Yugesh Reddy Sappidi.

Built on top of [ncdai/chanhdai.com](https://github.com/ncdai/chanhdai.com) by Nguyễn Chánh Đại (MIT licensed). The original copyright is preserved in `LICENSE`.

## Stack

Next.js 15 · React 19 · Tailwind CSS v4 · shadcn/ui · MDX (blog) · pnpm

## Develop

```bash
nvm use            # Node 22.20.0
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000.

## Deploy

Push to GitHub, import in Vercel, set the env vars from `.env.example`. No build customization required.
