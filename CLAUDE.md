# SSS Freight status page — working notes

Read this before changing anything here. `AGENTS.md` is a copy of this file so Codex
and Cursor get the same brief.

## What this repo is

The public project-status page SSS read, live at
`https://hyperwebnewy.github.io/sss-freight-status-feed/`.

It is a small vanilla TypeScript app built by Vite. There is no framework and no
router. The whole page is HTML template literals inside `src/main.ts`.

It is **not** the freight application. That is a separate private repo,
`hyperwebnewy/sss-freight-management`, at `~/sss-freight-management`.

## The two halves, and which repo owns what

| Thing | Lives in | Notes |
|---|---|---|
| Every word on the page, layout, styling | **here**, `src/main.ts` + `src/styles.css` | Change copy here, nowhere else. |
| Client-facing names for sections and features | **here**, `src/client-copy.ts` | Keyed by feature key. |
| `status.json`, the data | generated in the **freight repo**, `tools/status-feed/` | Machine-written. Never hand-edit. |

`status.json` at the repo root is overwritten by CI in the freight repo. Treat it as
read-only. `public/status.json` is the offline fallback baked into the build, and it
**is** yours to refresh (see the trap below).

## How each half deploys

**This repo.** `.github/workflows/pages.yml` builds with Bun and Vite and deploys
`dist` to Pages on any push to `main` that is not `status.json` or `README.md` only.
So a copy change needs a push here; a data change does not.

**The freight repo.** `.github/workflows/status-feed.yml` regenerates `status.json`
and pushes it here. It fires on a push to `main` touching:

- `_bmad-output/implementation-artifacts/sprint-status.yaml` (story statuses, the
  thing that actually moves the page)
- `_bmad-output/planning-artifacts/epics.md` (section and feature names)
- `tools/status-feed/*.ts` or the workflow itself

A push that only changes application code does not republish. That is correct, not
a bug: the page tracks planning state, not commits.

The page polls the raw feed every 30 seconds, so a data change appears without a
redeploy.

## The rule that governs every change here

**This page is for the client, not for us.** SSS run a freight business. They should
never meet a word from the engineering plan.

- "Epic" is **Section**. "Story" is **Feature**. On screen only.
- No hours, no dates on phase cards, no completion percentages. All removed on
  purpose, at div's direction. Do not reintroduce them without asking.
- No internal shorthand: no PR numbers, commit ids, file paths, BMAD, tool names,
  `sprint-status.yaml`.
- Status wording is Not started, Planned, Building, Checking, Done.

## Things that will catch you out

**The feed still says epics and stories.** `feed.epics`, `section.stories`,
`kpis.currentEpic`. That is the published data contract, and the code reads those
names deliberately. Renaming them here breaks the page the moment it loads the live
feed. Only the wording on screen changes.

**`public/status.json` ships inside the bundle.** Vite copies `public/` into `dist`,
so whatever is in it is served publicly and is readable by anyone. It once carried
internal notes. If you refresh it, generate it from the freight repo:
`bun tools/status-feed/publish-status.ts /tmp/status.json`, then copy it in and grep
the built `dist/` before pushing.

**Unmapped names fall back.** `client-copy.ts` falls back to the engineering title
when a key is missing, so a new feature appears with its raw name rather than
vanishing. After the plan gains a feature, add its entry here or the jargon is back.
Check coverage by comparing the keys in `public/status.json` against the map.

**Order of operations when both repos change.** Push this repo first, then the
freight repo. The page reads the live feed, so a feed change reaching an older
deployed page can break it.

## Working on it

```
bun install
bun run dev                       # local, hot reload
bun run build                     # must pass, tsconfig is strict
bunx vite preview --port 4173     # serve the built output
```

Verify before pushing:

- Read the rendered page, not just the source. All browser automation runs headless.
- Check the stale path by blocking `raw.githubusercontent.com`, so the fallback and
  the "Showing the last update we published" wording both render.
- Check narrow widths. The phase cards have no meta rows.
- Grep the rendered text for `epic`, `stories`, `sprint`, `BMAD`, `hours`, `%`.

## What changed on 2026-07-22

The page was rewritten from an engineering board into a client page.

- Two tabs became one page: a green live note, three counts, the delivery plan, then
  **Detailed progress** collapsed underneath.
- Removed: hours, dates, all percentages and progress bars, the current-focus blurb
  that printed the project-context lead verbatim, the open action items whose owners
  carried internal file paths, and the footer line
  "Reads sprint-status.yaml · not a substitute for the product app".
- Added `src/client-copy.ts`: plain-English names for all 60 features and 12
  sections.
- Header and footer dates now both read `publishedAt`, so they cannot disagree. The
  feed still carries `lastUpdated` from the sprint file; it is not shown.
- In the freight repo, the generator stopped emitting `currentFocus.summary` and the
  action item text and owners. Only the open-action count is published. Because
  `project-context.md` is no longer an input it came out of the workflow's trigger
  paths, and a "commit only if changed" guard was added, since the publish step used
  to commit unconditionally and would have failed red on a no-op run.
- The second status board on OpenAI Sites was retired.

## Open items

**The green note is not true yet.** It says "This page updates live every 1 hour as
we progress". There is no cron; the feed publishes only when a qualifying file lands
on the freight repo's `main`. div chose to run the sentence as written. Making it
true is a `schedule: - cron: "0 * * * *"` block on `status-feed.yml`, and the commit
guard is already in place for the no-op runs that would follow.

**RCTI is on the plan but not in the build.** The signed brief lists RCTI / Bills
Support as Phase 4 Extension, confirmed in scope, 40 hours. The freight repo says
the opposite in two places, including `reference/mytrucking-feature-inventory.md`,
which is rank 1 in its source-of-truth order. There are no RCTI stories in any of
the 12 sections, so the page shows a phase nothing in the plan produces. Fixing this
is freight-repo work: correct the scope lines, then correct-course `epics.md`.

**The OpenAI Sites board may still be live** at
`sss-freight-project-status.apps853513.chatgpt.site`. It polled this same feed and
read two fields that no longer exist. There is no CLI for Sites, so div unpublishes
it from the dashboard.

**`README.md` is out of date.** It says the repo "contains no application source",
which stopped being true when the viewer moved in here.
