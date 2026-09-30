# Baseball IQ

A small static youth baseball defense trainer for any team. Choose an age group, edit the league rules, then practice a position or work through eight lessons with animated plays and quizzes. No account, database, or server is required.

- **Setup & rules:** 6–8U, 9–10U, 11–12U, or 13–14U training templates; coach, machine, or player pitching; nine or ten defenders; configurable leading off, stealing, uncaught third strikes, infield fly, overthrow limits, and stopping play.
- **Practice:** pick any position, with an optional first name. Eight lessons cover base coverage, backups, cutoffs, decisions, forces and tags, communication, runners on third, and planning before the pitch.
- **Batter contact:** balanced, strong, or developing contact changes starting outfield depth. It is a coaching adjustment, not a prediction of the next hit.
- **Sharing:** settings save in the browser and can be exported/imported as JSON.
- **Team colors:** charcoal/light-blue Sharks starter palette, 15 other familiar palettes, and custom primary/accent color pickers in Setup & Rules. Colors apply to buttons, headers, and fielders; they persist across age changes and are included in setup exports. Text colors adjust for readability, while coaching feedback keeps consistent colors. Presets are inspired combinations, not official branding; match your uniform using the pickers.
- **Video intros:** optional 30-second MP4s, native controls, English captions, transcripts, and written fallbacks. [Exact video production briefs](docs/VIDEO_BRIEFS.md) are ready for Claude.

Age and team type do not uniquely identify a rulebook. The presets are editable training assumptions, not verified Ponte Vedra, Julington Creek, Little League, USSSA, or tournament rules. See [rules and competition differences](docs/RULES.md).

## Develop and check

Node.js 24 is used locally and in CI.

```sh
cd cubs-baseball-iq
npm ci
npm run dev
npm test
npm run lint
npx playwright install chromium
npm run test:e2e
```

If Chromium is already installed, use `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chromium npm run test:e2e`. Browser tests use the built static site at `/baseball-iq/`, including hash navigation, so they also check a GitHub Pages project path.

## Host on GitHub Pages

Two supported options:

1. **Keep branch-based hosting:** run `npm run build:pages`, commit the rebuilt repository-root `index.html`, `cubs-baseball-iq.html`, and `videos/`, then use Settings → Pages → Deploy from a branch → `master` → `/ (root)`. The existing `cubs-baseball-iq.html` link redirects while preserving the selected play.
2. **Use GitHub Actions:** Settings → Pages → Source → GitHub Actions. The included workflow tests, builds, and deploys on pushes to `master`, or when manually run. Pull requests run checks without deploying.

`npm run build` produces a normal static `dist/`. `npm run build:single` produces `dist-single/index.html` with bundled app code. `npm run build:pages` also updates the repository-root entry point and creates `dist-pages/`. Videos remain separate files for streaming; keep the adjacent `videos/` folder when distributing a build containing MP4s. The app without videos can be opened as a single HTML file.

## Add lesson videos

Create the assets from [VIDEO_BRIEFS.md](docs/VIDEO_BRIEFS.md). Put `<lesson-id>.mp4`, matching `.vtt`/`.jpg` files, and optional `<lesson-id>-transcript.txt` in `cubs-baseball-iq/public/videos/`, then rebuild. The app discovers MP4 filenames at build time; restart the dev server after adding one. Uploaded transcripts appear in the lesson; otherwise the written lesson script is used. Draft captions are supplied and should be retimed to the final narration. Missing MP4s do not create empty video players.

All eight lessons include supplied paper cut videos, timed captions, transcripts, and posters extracted from the videos. The original MP4s are preserved (720p H.264/AAC, approximately 31–34 seconds each). Browser checks exercise real playback, caption loading, transcript access, missing-video recovery, and continuing into practice.

For uploads through GitHub, open `cubs-baseball-iq/public/videos/`, choose **Add file → Upload files**, and commit to `master`. GitHub Actions rebuilds and publishes automatically. The repository-root `videos/` folder is generated output and is refreshed by the build. Allow the workflow to finish, then reload the lesson page to see new media.

## Code map

| Area | Source |
| --- | --- |
| Age templates, validation, and rule notes | `src/baseball/settings.ts` |
| Adapting authored demos to a setup | `src/baseball/configureScenario.ts` |
| Assignments and active fielders | `src/baseball/defensiveRules.ts`, `scenarioResolver.ts` |
| Animation timelines | `src/animation/animationEngine.ts` |
| Quizzes and sessions | `src/baseball/questions.ts`, `practice.ts`, `ruleQuestions.ts` |
| Scenarios, lessons, video narration | `src/data/` |
| Browser settings | `src/storage/settingsRepository.ts` |
| Team palettes and readable text colors | `src/theme/teamColors.ts` |

The original team-specific build specification remains in `baseball-iq-build-spec.md` as historical context. The current behavior and assumptions are documented here and in [the implementation notes](docs/REVIEW.md).
