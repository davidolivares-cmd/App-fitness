Attempting to perform the InitializeDefaultDrives operation on the 'FileSystem' provider failed.
# Forma

Forma is a private, mobile-first fitness and nutrition app built with React, TypeScript, Vite, and Supabase.

## Run locally

Requirements: Node.js 22 and npm.

```sh
npm install
npm run dev
```

Configure the public Supabase project values in an ignored `.env.local` file:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Never put a Supabase service-role key or an AI provider secret in browser code.

## Private account data

Run the migration in `supabase/migrations/202610170001_forma_private_data.sql` against the Supabase project used by this app. It creates the `forma_user_data` table with owner-only row-level security and a private `recipe-photos` bucket with per-user storage policies.

You can apply it with the Supabase CLI (`supabase db push`) or paste the migration into the Supabase SQL editor. Until this migration is applied, sign-in still works, but new workout, meal, recipe, and progress data cannot sync to the account. The app shows that setup state instead of claiming the data was saved.

## Nutrition and progress

Food values are estimates per 100 g and can be overridden for foods missing from the catalog. The calorie target uses the Mifflin–St Jeor estimate, an activity multiplier, and a modest goal adjustment; users can enter a target manually. BMI is shown as a screening indicator for people aged 20 or older, not as a diagnosis. The first profile submission stores a baseline progress record for that day; later entries can include optional waist, chest, hip, arm, and thigh measurements.

## Reminders and recipe suggestions

The app asks for notification permission only after a user presses the activation button. The browser reminder checks whether a progress entry is due when Forma is open. Delivery while the app is closed needs a push service and server-side scheduler and is not configured here.

Pantry suggestions use a local recipe catalog and require multiple ingredient matches. No AI provider is connected. An AI integration should run behind a Supabase Edge Function with the provider secret stored server-side; a secret must not be embedded in this public GitHub Pages app.

## Exercise library

The 75 exercise names, instructions, and illustrations in `src/data/exercises.ts` and `public/exercises/exercise-sprite.webp` come from the user-provided visual exercise glossary. The exercise pictures are illustrations, not photographs.

## Build and deploy

```sh
npm run build
npm run preview
```

GitHub Actions builds pull requests without deploying them. A push to `main` or a manual workflow run builds and deploys GitHub Pages. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as repository Actions variables for the deployed app.
