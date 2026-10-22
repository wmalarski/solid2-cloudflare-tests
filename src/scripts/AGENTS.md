# `src/scripts` — one-off data migration pipeline

These are standalone Node scripts, not part of the app bundle or the test suite.
They migrate an old bookmark database into the `task` table of the `albums` D1
database: parse a legacy SQL dump, look up each album on Spotify, and emit a
seed file.

They are **not** wired into `package.json` and are **not** imported by `src/`.
Run them manually, in order.

## Data flow

```
dump-remote.sql ──processing.ts──▶ data.json
                                      │
                                      ├──fetching.ts──▶ data/<id>.json   (Spotify search results)
                                      │
                                      └──transforming.ts──▶ seed.sql     (INSERT OR IGNORE rows)
```

`seed.sql` is then applied to the remote D1 database with Wrangler.

All paths inside the scripts are relative to the repository root, so always run
them from there.

## The scripts

### `processing.ts`

Reads `src/scripts/dump-remote.sql` and keeps the `INSERT INTO "bookmark"` rows
that have `text = NULL`. It splits the raw SQL values by hand and reshapes them
into `{ task: { id, doneAt, note, rate, status }, id, title }` objects.

It only prints the result to stdout; it writes no files. To regenerate
`data.json`:

```bash
node src/scripts/processing.ts > src/scripts/data.json
```

Regenerating replaces the curated `data.json`, so only do it when the source
dump changed.

### `fetching.ts`

Reads `src/scripts/data.json`, requests a Spotify token with the
client-credentials flow, and searches for the first album matching each entry's
`title`. One raw Spotify search response is written to
`src/scripts/data/<id>.json`.

- Skips entries whose output file already exists, so it is safe to resume after
  an interruption.
- Waits 500 ms between requests to stay under the rate limit.
- Aborts the whole run on a Spotify `QUOTA_EXCEEDED` error.
- Requires `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`; `.env` is loaded
  via `dotenv`.

```bash
node src/scripts/fetching.ts
```

### `transforming.ts`

Reads `data.json` plus every `data/*.json`, takes the first album
(`albums.items[0]`) of each response, and writes `src/scripts/seed.sql`: one
`INSERT OR IGNORE INTO "task" (...)` per row, in the column order of the Drizzle
schema in `src/integrations/drizzle/schema.ts`.

- `task.user_id` is `NOT NULL`, so the seed needs an existing user. It uses
  `SEED_USER_ID` when set and otherwise falls back to the owner hardcoded in the
  script, which is the owner of the remote `albums` D1 database. Do not use the
  user from `dump-remote.sql`: it only exists in the legacy database, and
  seeding with it fails with `FOREIGN KEY constraint failed`. Override it for
  your own database: `SEED_USER_ID=<user-id> node src/scripts/transforming.ts`.
- Timestamps are written as epoch **seconds**, matching
  `integer({ mode: "timestamp" })`.
- Duplicate Spotify album IDs are dropped (the unique index is
  `(user_id, spotify_id)`), keeping the first match.
- Files are processed in numeric order so the output is stable.

```bash
node src/scripts/transforming.ts
```

Apply the generated seed to the remote database named `albums`:

```bash
npx wrangler d1 execute albums --remote --file=src/scripts/seed.sql
```

`INSERT OR IGNORE` makes re-running the seed harmless, but note the generated
`id`s are random UUIDs created by `processing.ts`, so a regenerated
`data.json` produces new primary keys and will insert duplicate-looking rows.

## Requirements and gotchas

- Node.js 24+ (the scripts run `.ts` files directly through Node's built-in
  type stripping; there is no build step and no `tsx`/`ts-node`).
- `fetching.ts` needs Spotify credentials; `transforming.ts` needs a user that
  already exists in the target database.
- Inputs and outputs here are throwaway artifacts and are gitignored
  (`src/scripts/.gitignore` ignores `*.sql` and `*.json`), except the scripts
  themselves and this file.
- There are no tests for these scripts and they are not bundled into the app;
  nothing in CI exercises them. Treat them as manual tooling.
