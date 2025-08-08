# The Past Fool — Fact or Cap?

A tiny Next.js + Tailwind mini-game built for short, fast rounds. Mobile-first.
Monetize via ad slots, sponsor links, or affiliate CTA.

## Quick start

```bash
pnpm i   # or: npm i  |  yarn
pnpm dev # or: npm run dev
```

Open http://localhost:3000

## Customize

- Edit branding in `app/lib/brand.ts` (title, tagline, gradient, TikTok link).
- Add/replace questions in `app/page.tsx` (QUESTION_BANK).
- Replace the two placeholder ad boxes with your ad provider snippet.

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com/new > Import your repo > Framework: **Next.js**.
3. No env vars needed. Click **Deploy**.
4. Add your custom domain if you have one.

## Notes
- This is zero-dependency UI (no shadcn), so it's one-file simple.
- For dynamic questions from an API, move `QUESTION_BANK` into an endpoint or fetch from a JSON file.
