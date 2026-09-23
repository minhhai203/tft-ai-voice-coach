# Overwolf source map for agent port planning

Status: **DONE_WITH_CONCERNS** — pinned source inspected; no source code executed or copied into runtime. Windows behavior remains unverified.

## Provenance and licensing boundary

- Upstream: `https://github.com/overwolf/events-sample-apps.git`.
- Verified checkout HEAD: `d9b94954289a7d629502675a70d63f12bcc8e912` (immutable ref used below).
- Local inspection: `/tmp/tft-xia-zAZbep/overwolf`; direct-file fallback because Repomix was unavailable; no installation performed.
- Read TFT sample `main.js`, `manifest.json`, `index.html`; launcher sample `main.js`, `manifest.json`; root README; narrow LoL game-recognition comparison.
- Root [README lines 1–3](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/README.md#L1-L3) describes event-consumption demonstrations only.
- Tracked-tree filename search found **no LICENSE, COPYING, NOTICE or package.json**. No license statement appears in the inspected files. This records missing evidence, not a legal conclusion about permitted use.
- **No verbatim code/assets port is authorized by this analysis.** Use API concepts and independently implement local adapters from verified official API contracts; resolve upstream licensing/permission before copying expressions or assets. Local MIT metadata does not establish upstream rights.

## Source anatomy and reusable concepts

| Source symbol/location | Exact source reference | Reuse decision |
|---|---|---|
| `registerEvents` / `unregisterEvents` | [TFT main.js:21–52](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/tft-events-sample-app/main.js#L21-L52) | PORT CONCEPT: store callback references and remove the identical references; add local idempotence and lifecycle ownership |
| `gameLaunched` | [TFT main.js:55–80](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/tft-events-sample-app/main.js#L55-L80) | PORT CONCEPT: filter unrelated game-info changes before starting; class check alone is insufficient |
| `gameRunning` | [TFT main.js:82–100](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/tft-events-sample-app/main.js#L82-L100) | PORT CONCEPT: cold-start discovery when app starts after game |
| `setFeatures` | [TFT main.js:103–116](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/tft-events-sample-app/main.js#L103-L116) | API sequence reference only; replace infinite retry with bounded cancellable retry and explicit supported-feature result |
| Startup wiring | [TFT main.js:119–135](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/tft-events-sample-app/main.js#L119-L135) | CONCEPT ONLY: two startup paths need one shared idempotent owner; sample is not a finished lifecycle manager |
| Window/targeting declarations | [TFT manifest.json:13–46](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/tft-events-sample-app/manifest.json#L13-L46) | Schema reference only; not a permissions baseline or production desktop architecture |
| Launcher feature registration | [launcher main.js:68–83](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/lol-launcher-sample-app/main.js#L68-L83) | CONCEPT ONLY, optional separate adapter; explicit launcher class argument differs from game API |
| Launcher discovery/start/end | [launcher main.js:50–66](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/lol-launcher-sample-app/main.js#L50-L66), [86–105](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/lol-launcher-sample-app/main.js#L86-L105) | Do not port directly; first-launcher assumption, repeated registration and window-close-on-termination conflict with personal postgame UI |

TFT sample flow: script load → register game-info listener + request running-game info → detect class → attach event listeners → delayed feature request → console-log raw callbacks. It has no reducer, advisor, persisted match record, TTS, window IPC or automated tests.

Launcher sample flow: discovery or launcher launch → attach listeners → request launcher features for `10902` → log callbacks → schedule `window.close` after termination. It is an optional data-source example, not the desktop lifecycle to adopt.

## Pitfalls that coding agents must not import

1. **Game identity:** TFT sample checks class `5426`, but [LoL sample main.js:80–85](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/lol-events-sample-app/main.js#L80-L85) checks the same class and calls it LoL. This is source evidence that this predicate cannot distinguish TFT. Require a verified TFT-specific signal; unknown means disabled.
2. **Disallowed/stale feature list:** [TFT main.js:7–19](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/tft-events-sample-app/main.js#L7-L19) includes `augments`. Do not inherit it. This project excludes augment feed and unapproved live advice; select only individually verified necessary features.
3. **Retry/lifecycle:** TFT retry never expires or cancels (103–116); startup attaches on multiple paths (119–135), without a game-stop cleanup branch. Stored callback references help, but the sample alone is not idempotent.
4. **Launcher namespace bug:** [launcher main.js:38](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/lol-launcher-sample-app/main.js#L38) adds to `games.launchers.events.onInfoUpdates`; [line 45](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/lol-launcher-sample-app/main.js#L45) removes from `games.events.onInfoUpdates2`. The add/remove pair is not the same emitter; never copy this registration block.
5. **Launcher identity:** `launcherRunning` only checks `launchers[0]`, and `onLaunched` registers unconditionally (50–66,86–91). Enumerate matching launchers and handle duplicate launch signals if the adapter is needed.
6. **Snapshots:** TFT comments claim the first info update includes current information (40–43), but neither narrowed sample calls game-events `getInfo`. `getRunningGameInfo` discovers the running process, not board/economy state. A resync/snapshot contract must come from current docs plus Windows capture, not this sample.
7. **Permissions:** neither inspected manifest declares a `permissions` block; this is absence in old examples, not proof none are needed. Verify GameInfo/hotkeys/window and any launcher permissions using current docs before Windows gate.
8. **Desktop:** TFT index body is hidden ([index.html:5](https://github.com/overwolf/events-sample-apps/blob/d9b94954289a7d629502675a70d63f12bcc8e912/tft-events-sample-app/index.html#L5)); manifest's `show_in_taskbar` does not supply pregame/settings/postgame flows. Do not import click-through into an interactive desktop window.
9. **Logging:** sample dumps whole payloads. Local diagnostics must allowlist necessary fields and redact identifiers; do not port raw logging verbatim.

## Dependency matrix: local baseline → implementation ownership

Local paths below are relative to `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach`.

| Classification | Local file/symbol | Required adaptation / dependency |
|---|---|---|
| EXISTS | `src/background/background.js:70-87 setupOverwolfEvents` | Keep entrypoint; route both discovery paths into a single owner |
| CONFLICT | `background.js:89-94 isTftRunning` | Same shared-class-only predicate as source; add verified TFT guard before feature registration/output |
| CONFLICT | `background.js:121-138 registerGameEvents/unregisterGameEvents` | Replace inline bind references; separate listener setup from feature retry; add onError/degraded state |
| CONFLICT | `background.js:6-18 g_interestedInFeatures` | Local feature list matches source including augments; replace with scoped allowlist |
| NEW | `src/platform/overwolf-adapter.js` proposed | Own SDK calls, retained callbacks, bounded retries, generation and resync; dependency: verified contracts |
| NEW | `src/core/normalize-events.js`, `game-state.js` proposed | Source provides none; pure normalization/reducer, unknown fields, atomic updates, match epoch and fixture replay |
| CONFLICT | `background.js:142-188 onInfoUpdate` | Bare-array assumptions and stage-before-field-merge cannot be repaired by copying sample logging |
| CONFLICT | `manifest.json:19-38`, `background.js:108-111` | Existing interactive surface only overlay `in_game_only`; add separate desktop surface, keep it after game exit |
| NEW | Desktop HTML/JS + manifest declaration proposed | Pregame/settings/postgame rendering; owns immutable review selection, not live GEP callbacks |
| NEW | Completed-match evidence store proposed | Freeze allowed fields before live reset; review job distinct from game epoch and suppressed at next game |
| CONFLICT | `background.js:114-117 sendToOverlay` | Fix documented four-argument messaging; source sample has no IPC to reuse |
| EXISTS | `src/overlay/overlay.js` and `src/voice/voiceEngine.js` | Integrate permitted static view and cancellable audio only after adapter/state contracts; sample supplies neither |
| NEW optional | Launcher adapter | Add only if permitted pre/postgame data is needed and validated; otherwise exclude dependency entirely |

## Exact tests proposed for port acceptance

Use built-in `node:test` and fake SDK emitters/timers; no real network/provider/TTS in tests.

1. Call adapter start 10 times through both startup paths: exactly one listener per subscribed emitter. Stop twice: zero listeners and timers; callback references equal add/remove values.
2. Feature request error → retry scheduled; stop before retry → no later SDK call. Old successful callback after stop/new epoch cannot mark the new session ready.
3. Running IDs sharing class `5426` with missing/LoL mode signal keep coach disabled; confirmed TFT mode enables only approved capabilities. Unrelated game-info changes do not stop/restart a valid session.
4. Assert requested feature array omits `augments` and every unapproved field. Partial feature availability yields explicit degraded state, never fabricated readiness.
5. Adapter forwards independently recorded or labelled synthetic `onInfoUpdates2`/`onNewEvents` envelopes; malformed/nested/zero/missing fields preserve reducer contract. Running-process discovery alone must not mark gameplay fields known.
6. Resync races live updates: fixture documents sequence/epoch assumptions; no timestamp-only guess overwrites newer data. Lack of ordering evidence yields unknown/stale.
7. Game end freezes completed evidence before cleanup; app restart or delayed result cannot mix reviews; next match/mute prevents obsolete review audio. Same fixture twice gives equal state and output.
8. Optional launcher: target at index >0 is found; unrelated launcher launch does nothing; removal uses the same launcher emitter; termination does not close desktop postgame UI.
9. Fake window IPC checks four arguments, no send to null/unready window, and receiver contract; desktop UI remains usable with no game while in-game window follows its own lifecycle.
10. Windows acceptance, separate from unit pass: approved unpacked app loads; permissions/features match records; distinguish TFT/LoL; pregame → game → process exit → postgame; duplicate start, reconnect, mute, DPI/click-through and clean stop. Record exact Windows/Overwolf/TFT versions.

## Handoff limits

- PORT means independently implement the **concept**, not paste source under an unverified license.
- The sample cannot establish current native payload schema, policy compliance, feature availability, snapshot ordering or Windows performance. These remain explicit implementation gates.
- Scope remains Windows 11 personal use; macOS can run contract/replay tests only. No live adaptive output or augment feed is unlocked by referencing upstream code.
