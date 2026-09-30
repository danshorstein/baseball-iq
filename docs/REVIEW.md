# Review and implementation notes

## What was useful in the original

The original app had a clear BALL → BASE → BACKUP teaching model, a declarative scenario library, pure position assignments, and an animation engine separated from React. The app was small and already suited to static hosting. The changes preserve those foundations.

## Issues addressed

| Finding | Change |
| --- | --- |
| A fixed Cubs 8U roster, four innings, and ten fielders constrained reuse | Position-based practice, optional first name/team name, configurable nine/ten defenders, and no required roster. Bundled child names are removed from current source and output; prior Git history and the historical spec still exist. |
| Local first-base overthrow and stopping-play rules were shown as general rules | Editable settings, explicit local-rule descriptions, different illustrative advancement, and a quiz derived from the chosen profile. |
| A runner on third implied holding on every grounder to third | The hold example now identifies a slowly fielded ball and explains why no realistic out remains. |
| Replay of an answered quiz could stop at the question freeze point again | Replay runs without the question stop, with a browser regression test. |
| Saved settings could be malformed or unavailable | Values are validated; corrupt data falls back to defaults; failed persistence is reported while the current visit still works. |
| SVG answers and players lacked keyboard controls | Named, focusable controls support Enter/Space; job explanations have an explicit close button. |
| Generated HTML could drift from the source | `build:pages` regenerates the root entry point; CI validates and builds the same static output. |
| Lessons began without context | Written introductions/transcripts are available immediately; optional MP4s add controls, captions, and error fallback. |
| The original Cubs colors were fixed throughout the app | Sixteen starter palettes and custom primary/accent pickers, with Sharks colors as the default. Palette text and controls use contrasting colors, including white/black custom themes. Existing exports load with the default palette; new exports include team colors. |

## Keeping the product small

There is no backend, authentication, external font request, analytics service, or team database. Settings are versioned browser data, with a small export/import file. Ordinary hash routes work on a GitHub Pages project path. The source directory keeps its existing name to avoid unnecessary path changes.

Personalized inning lineups have been replaced by position practice. Saved lineups from the original app are not migrated because that feature depended on the removed team roster. First names entered for practice are kept only in the current page state, not written to storage.

## Verification

The Node test suite covers all 34 scenarios and their 43 total demo variants across four age templates, both field sizes, and three contact settings. It checks active positions, a single primary fielder, ordered finite timelines, valid answers, deterministic sessions, immutable authored scenarios, rule overrides, forces, settings validation, and blocked storage.

Browser tests use a built single-file app at `/baseball-iq/`. They cover mobile layout, setup persistence, export/import, rule-quiz completion, keyboard interaction, answered-question replay, legacy URL redirects, and all eight lesson intros. All eight supplied MP4s are included with production captions, transcripts, and posters. Cover Your Base also has regression checks for real playback, loaded timed captions, transcript access, and failure recovery. No synthetic teaching video is shipped.

Theme tests check all presets and extreme custom color combinations for text contrast, then exercise pickers, live button/header/SVG styling, persistence, export/import, and both age selectors in the browser. The starter Sharks palette uses charcoal (#222222) and light blue (#7FA8C7), matched approximately to the provided Ponte Vedra Sharks image. These are visual matches, not official brand hex codes.

Build and lint checks run alongside tests. The HTML bundle needs no network requests to a service; optional MP4s/VTT/posters are hosted next to it.

## Next useful additions

1. Gather feedback from players on the eight video intros and the practice that follows, especially label readability on phones.
2. Publish verified division profiles for local leagues with a named source, season, and coach review. Avoid naming an age preset after an organization without that verification.
3. Add stolen-base, uncaught-third-strike, and infield-fly animations tied to the switches already present.
4. Add score, outs, runner speed, defender arm strength, and batter tendencies when teaching tactical tradeoffs. Explain multiple reasonable plays instead of marking every alternate choice wrong.
5. Add optional team rosters/position rotations and local progress tracking only if coaches find those useful. Shared accounts and cloud storage can wait.
