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

## Deploy (Heroku ↔ GitHub)

Push this repo to GitHub, then connect Heroku so every push to `main` goes live.

1. Create an app at [dashboard.heroku.com](https://dashboard.heroku.com) (stack **heroku-24**).
2. **Deploy** → **Deployment method** → **GitHub** → connect the repo.
3. Enable **Automatic deploys** from `main` (optional: wait for CI if you add it later).
4. **Settings** → **Config Vars** set:

| Key | Example |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.herokuapp.com` |
| `GITHUB_CONTRIBUTIONS_API_URL` | `https://github-contributions-api.jogruber.de` |
| `HUSKY` | `0` |

5. **Resources** → turn on a **web** dyno (Basic/Eco/Standard — free tier is gone).
6. Click **Deploy Branch** once (or push to `main`).

After that: merge/push to `main` → Heroku builds → site updates in a couple of minutes.

Local preview of the production build:

```bash
pnpm preview
```
