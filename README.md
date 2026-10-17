# Forma

Forma is a mobile-first fitness and nutrition web application built with React, TypeScript, and Vite.

## Run locally

Requirements: Node.js 22 and npm.

```sh
npm install
npm run dev
```

The app uses these Vite environment variables for Supabase authentication:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Keep local values in an ignored `.env.local` file. Never put a Supabase service-role key in client-side code.

## Build

```sh
npm run build
npm run preview
```

GitHub Actions builds the app and deploys it to GitHub Pages when changes are pushed to `main`.

## Current scope

The app includes Supabase sign-in and client-side workout, meal, recipe, and progress screens. Workout and nutrition entries currently live only in the browser session; they are not saved to Supabase or across reloads. The repository does not yet include a web app manifest or service worker, so installable/offline PWA behavior is not implemented.
