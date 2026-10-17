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

Random recipe suggestions continue to use the local recipe catalog. “Cocina con lo que tienes” and nutrition estimates for foods outside the local catalog use the `forma-ai` Supabase Edge Function. The function requires an OpenAI API key stored as a Supabase secret; never put this secret in GitHub Pages or browser environment variables.

Deploy the function to the Supabase project used by the app and configure its secret:

```sh
supabase secrets set OPENAI_API_KEY=your-key
supabase functions deploy forma-ai
```

The function uses `gpt-4o-mini` unless an `OPENAI_MODEL` Supabase secret overrides it. Until the function is deployed with a valid key, the rest of the app works and the AI controls show an actionable setup error. AI food values and recipe nutrition are estimates; confirm them against food labels and review generated ingredients and cooking instructions.

The progress page includes a selectable measurement chart and a monthly calendar. Mark a planned workout as completed in the weekly training view to record it in the calendar.

## Exercise library

The 75 exercise names, instructions, and illustrations in `src/data/exercises.ts` and `public/exercises/exercise-sprite-v2.webp` come from the user-provided visual exercise glossary. The exercise pictures are illustrations, not photographs.

## Build and deploy

```sh
npm run build
npm run preview
```

GitHub Actions builds pull requests without deploying them. A push to `main` or a manual workflow run builds and deploys GitHub Pages. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as repository Actions variables for the deployed app.
