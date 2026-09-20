# Build changes and merge reference / 构建改动与合并记录

This records shipped behavior and the source locations needed for later changes. PR states below
are frozen at the original review date, not a claim about today's upstream state.

## 2026-09-19 — workspace and agent naming (source update)

- Click the new-workspace heading to edit its name directly in place.
  It stays normal text until clicked; an empty name shows a muted placeholder
  while editing and the normal heading color otherwise.
  The name travels through `createWorkspace.title`; chat, terminal and empty workspaces
  use the same creation path. Older daemons use the existing workspace rename request.
- Newly created interactive agents with an initial prompt get a concise topic title in
  the prompt's language. The daemon reuses its structured metadata generator in the
  background; the initial prompt is sent immediately. Explicit/manual titles remain
  intact, and a failed generation leaves the provisional title in place.
- Source owners: `packages/app/src/screens/new-workspace-screen.tsx`,
  `packages/server/src/server/agent/create-agent-title.ts`, `agent/agent-manager.ts`,
  `agent/create-agent/create.ts`, `session.ts`, and
  `session/checkout/git-metadata-generator.ts` (server paths relative to
  `packages/server/src/server/`).

This source update does not publish a new installer. The release identities below
describe the existing downloads. The same naming changes are carried in the local
private 0.9.0-beta.2 source without changing this public repository's 0.8.0 baseline.

### Inline rename follow-up

All rename actions edit the displayed name in place: workspace rows/header,
agent and terminal tabs, host names and project names. Enter or blur saves;
Escape cancels. Existing rename APIs and menu/keyboard entrypoints are retained.
Project icon editing stays separate; clearing a custom project name restores its
automatic name. File/folder renaming was already inline. Shared input behavior
lives in `packages/app/src/components/inline-rename-input.tsx`.

## Build identities

| Track | Version | Base | Included changes |
| --- | --- | --- | --- |
| Public Smooth UI | `0.8.0-smooth.20260912.3` | Official Paseo `v0.8.0` | All UI changes below; stock 0.8.0 daemon behavior |
| Private customization | `0.8.0-custom.20260912.4` | Official Paseo `v0.8.0` + custom Pi `0.85.1` | Same UI changes, plus the private runtime changes and integrations below |

Official Paseo base: `b8e24677e12b226c7c38c1c3a40649daa9f1152f`.
Public clean import: `3789b1aed8f40f21e7a7be34af7f6b46bc23d78a` (same upstream tree, no private history).
Exact source commits for each build are recorded in the attached `build.json`.
Public source: https://github.com/feixqemn/paseo-smooth-ui.
The private archive contains complete Paseo source, Pi baseline/overrides, the full upstream diff,
and original reviewed PR patches. Its release `custom-2026-09-12.4` contains the private desktop;
Pi's complete runtime remains in `custom-2026-09-11.2`.

Paseo desktop bundles its daemon/CLI. Pi is a separate installed provider executable: updating
Paseo does not upgrade or overwrite Pi. The public installer therefore does not include the private
Pi runtime or its configuration. The matrix explicitly records those changes without claiming
that they ship in the public binary.

## UI changes — included in both tracks

| Change | Current behavior | Source owner |
| --- | --- | --- |
| File gestures | Plain click follows Layout; Command/Ctrl defaults to Finder/file manager; Option/Alt defaults to the OS application. Option wins combined modifiers. | `packages/app/src/workspace/file-open/`, assistant file links, Explorer, terminal runtime; desktop `main.ts` / `preload.ts` |
| Layout settings | Modifier actions are configurable. New profiles open files/diffs/subagents on the right; existing saved preferences remain intact. | settings storage, Layout section, locale strings |
| Desktop opener | One bridge invokes `showItemInFolder` or `openPath`; invalid paths and OS errors are surfaced. These actions require the desktop and local daemon. | workspace file dispatcher, desktop opener bridge and IPC |
| Alt-click | Removes RN Web's unconditional Alt filter at its existing PressResponder. Selection/long-press cancellation is retained. | `patches/react-native-web+0.21.2.patch`, `scripts/postinstall-patches.mjs` |
| Activity grouping | A single thinking/tool/search item renders directly; two or more consecutive activity items share one overview summary. Ordinary replies stay outside. Uses existing grouping, retained history/live projection and message IDs. | `agent-stream/view.tsx`, `tool-calls/detail-level/`, virtualization row estimate |
| Thinking details | Cloud icon and tool-aligned typography; all provider thinking text is rendered directly as Markdown, with no derived title, truncation or duplicate disclosure. Current reasoning events contain only text, not independent summary/detail fields. | `ThoughtSlot` in `agent-stream/view.tsx` |
| Disclosure animation | Existing ExpandableBadge uses 220ms height transition, fade and chevron rotation; closing retains content until transition ends. | `components/message.tsx` |
| Loading animation | Activity/tool labels sweep a gradient while running; expanded streaming reasoning uses the same subtle visual treatment. Reduced motion is respected. | `components/message.tsx`, overview loading state |
| Sent Markdown | User messages render Markdown after submission. Input and copy retain source; reasoning uses the assistant renderer and file links. | `components/message.tsx` |
| Long Markdown | Chat surfaces constrain intrinsic width; wide content scrolls inside the renderer. Messages over 480px collapse with Show more / Show less; active assistant output and thinking stay visible. Full source/copy stays unchanged. | `components/message.tsx`, `components/markdown/renderer.tsx` |
| Chinese emphasis | Strong markers next to CJK punctuation, including Chinese curly quotes and horizontal space before a closing marker, use normal delimiter balancing. Code and escaped markers remain literal. | `utils/markdown-parser.ts` |
| Preferences cleanup | New profiles use Overview. Removed the obsolete auto-expand reasoning setting from the UI; retained its stored field for existing profiles. | settings Appearance, storage |
| Terminal plumbing | File link events carry modifier values through native/web terminal bridges into the shared resolver. | terminal runtime, webview, generated terminal HTML |

File modifier coverage is chat file links, terminal links and Explorer files. Changes/diff click
modifiers are not separately wired; their ordinary click continues to follow Layout. Mobile keeps
its existing tool-group sheet; the animated inline disclosure is for desktop/web.

### UI history and superseded choices

- `smooth.20260912.3` / `custom.20260912.4`: singleton activity rows bypass the group wrapper, retaining the original row and its own tool details. Existing grouping IDs and live/history projection are unchanged.

- `4e55493`: initial file gestures, sent Markdown and inline reasoning.
- `be13978`: moved reasoning into the existing activity group; added disclosure animation and Alt fix.
- `09a09f1`: cloud reasoning rows/details and CJK strong emphasis.
- The public binary release adds fixed signing, its own update feed and embedded change records.
- `smooth.20260912.2` / `custom.20260912.3`: remove the mistaken first-line title and duplicate thinking detail panel; display provider text directly. Fix Chinese curly-quote boundaries in bold emphasis.
- Reasoning remains inside the activity group. The later first-line-title/duplicate-detail presentation is also superseded: show the provider text directly.
  Do not restore the obsolete standalone Thinking block or the old auto-expand toggle while merging.
- Private equivalents are `bd8eb7a4` (initial UI/grouping/motion) and `5e984755c` (reasoning/CJK).

## Runtime changes — private build only

| Area | Retained behavior | Merge owner |
| --- | --- | --- |
| Non-destructive steer | Queue immediate send and steer use native steer; only explicit interrupt may replace a turn. Missing intent while busy is rejected. Existing serialized admission, expectedTurnId, event barrier and IDs remain. | composer submission, server session/agent manager, Pi adapter |
| Steer acknowledgement | Register message IDs before RPC; a valid ACK is not rejected merely because the turn ended. Rejection clears only its pending record; timeout/disconnect report unknown delivery without cancel/retry. Late echoes remain correlated. | Pi adapter and manager admission |
| Safe compaction | Wait for outstanding tools/results, preserve native queued steering through compaction, and settle continuation after retries. | Pi SDK/runtime/bundle and Pi adapter |
| Context estimate | Estimate in-flight responses, rebuild from post-compaction context, exclude pre-compaction usage; fix the bundled estimator's wrong function reference/NaN. Unknown limit still returns token usage; costs use real usage. | Pi context estimator; usage_updated → lastUsage → existing poller/meter |
| Effective budget | Threshold at 90% of original model context; UI effective budget at 95%. This is headroom policy, not a changed provider billing tier. | Pi compaction policy / context reporting |
| Compaction outcomes | Success, cancellation and error are distinguished and error text is shown. Threshold failure continues work and avoids immediate retry on unchanged context; overflow recovery failure is explicit. | Pi runtime plus Paseo compaction event mapping/UI |
| Summary authority | Compaction/branch templates distinguish user requirements, approved decisions, implementation choices and unapproved suggestions. Assistant suggestions do not become user constraints. | Pi compaction templates / message injection prefix |
| Provider request hooks | Summary requests retain provider payload hooks, including fast model alias mapping. | Pi SDK/runtime request path |
| Session lifecycle | Adopt official 0.8.0 autonomous Pi turn settling while retaining steer's turn-ID correlation. | Paseo Pi adapter |
| Desktop lifecycle | Updating the app keeps externally managed daemon processes alive. Private updater reads local gh authentication at runtime; no credential is bundled. | desktop updater and daemon manager |
| Stable signing | Same certificate and bundle ID across subsequent builds. No ad-hoc signature or regenerated certificate. | desktop packaging/signing |

The legacy 0.7.2/older-Pi patches are historical references in the private archive, not patches to
blindly replay on 0.8.0. Official #3849 replaces overlapping autonomous-turn settling; #4389 replaces
the old Dock-file patch. Claude's #4391 does not fix Pi compaction.

## Upstream integrations

Items marked **baseline** ship in both tracks through official 0.8.0. Items marked **private patch**
are additional integrations in the private build only. Exact reviewed heads and original integration
notes are also available in [merged-prs.json](merged-prs.json).

| Project / PR or commit | Change | Inclusion | Reviewed/upstream commit |
| --- | --- | --- | --- |
| [paseo 4113](https://github.com/getpaseo/paseo/pull/4113) | fix(server): forward steerActiveTurn through wrapSessionProvider | private patch | `75c309ce6b810843b048086ee6e965801e237934` |
| [paseo 4429](https://github.com/getpaseo/paseo/pull/4429) | fix(desktop): keep an externally managed daemon running across app updates | private patch | `682af58ac505e89c6c38db57e1c0f2fdfee7a45c` |
| [paseo 3124](https://github.com/getpaseo/paseo/pull/3124) | Honor Pi model thinking levels | private patch | `efb96b3040fe34d64df32d1eab2e847ef98e9422` |
| [paseo 3381](https://github.com/getpaseo/paseo/pull/3381) | fix(app): bound the queued-message list and scroll the overflow | private patch | `761963e7cfb7d5c1138439666ed0bf55f0a2a5d4` |
| [paseo 4543](https://github.com/getpaseo/paseo/pull/4543) | Fix macOS Command-arrow terminal navigation with Electron regression coverage | private patch | `af152588319d63c2764e8c57a747a0e011b1e0c2` |
| [paseo 4472](https://github.com/getpaseo/paseo/pull/4472) | fix(app): open OSC 8 terminal hyperlinks with the external opener | private patch | `a8a8b9f8d2cd794ef16e0e44f35be53bab0769ea` |
| [pi 8612](https://github.com/earendil-works/pi/pull/8612) | fix(coding-agent): clear delivered image-only queue entries | private patch | `b67b3db2abef6df6b3541b4ac54cd3c145cd5d42` |
| [pi 9179](https://github.com/earendil-works/pi/pull/9179) | fix(coding-agent): reject tree navigation during compaction | private patch | `37d6056c7cee3646bbdc21fdca14d37992da15f3` |
| [paseo 4436](https://github.com/getpaseo/paseo/pull/4436) | Revert #4421 and narrow the cache restore fix (#4436) | baseline | `c46aee4e6a2b8b077bd8a0074b468d48eccdcb59` |
| [paseo 3849](https://github.com/getpaseo/paseo/pull/3849) | fix(pi): settle autonomous Pi turns triggered by extensions (#3849) | baseline | `c424f82922fcd36aa9cc9e473644bca04417b420` |
| [paseo 4389](https://github.com/getpaseo/paseo/pull/4389) | fix(desktop): preserve the packaged macOS Dock icon (#4389) | baseline | `e4cd2d1ad08a452e75c3ea316cf4c41d15fe8f60` |
| [paseo 4160](https://github.com/getpaseo/paseo/pull/4160) | Restore live sessions immediately after app resume (#4160) | baseline | `efd6023b90b898963804c6fdb36134402c55590b` |
| [paseo 4321](https://github.com/getpaseo/paseo/pull/4321) | Preserve nested subagent ownership (#4321) | baseline | `f4b209be4d81d25a6143d12d374d797d485e8faa` |
| [paseo 4332](https://github.com/getpaseo/paseo/pull/4332) | fix(providers): preserve state across configuration reloads (#4332) | baseline | `c6106762036e69c0b91005e30673fe5a44a52f30` |
| [paseo 4322](https://github.com/getpaseo/paseo/pull/4322) | Restore reliable macOS desktop updates (#4322) | baseline | `9e90b86afa60aeeef05c145653f13cd2eed93896` |
| [paseo 4208](https://github.com/getpaseo/paseo/pull/4208) | fix(server): disable repository fsmonitor commands (#4208) | baseline | `708f9260b133c7a7cafceae0a48e6fb02d7597e9` |
| [paseo 4201](https://github.com/getpaseo/paseo/pull/4201) | fix(release): keep releases draft until manifests are ready (#4201) | baseline | `d67a6f5f6cdcf1f5559ee769715caa3d45b1af14` |
| [paseo 3075](https://github.com/getpaseo/paseo/pull/3075) | fix(server): hidden Pi extension context silently ends the turn | private patch | `6949bb45cc6615ff976b5ed671e6798d09fbd184` |
| [paseo 3094](https://github.com/getpaseo/paseo/pull/3094) | fix(server): notify the caller when a detached child finishes | private patch | `f756295a60a5d3b13a1fff86ab3029d865ad8263` |
| [paseo 4263](https://github.com/getpaseo/paseo/pull/4263) | fix(server): keep system errors separate from replies | private patch | `3e977b5e7b7081c67313212074f1f5b533dade5c` |
| [paseo 4256](https://github.com/getpaseo/paseo/pull/4256) | fix(app): replace painted timeline rows on cursorless tail pages | private patch | `2661f94438afbf4f282019c7345e9bcd381511f5` |
| [paseo 4682](https://github.com/getpaseo/paseo/pull/4682) | fix: keep the last visible pane when its final tab closes | private patch | `0e9f74a676d3c21f4b057ce61822774d98473315` |
| [paseo 4646](https://github.com/getpaseo/paseo/pull/4646) | fix(desktop): throttle hidden browsers between screenshots | private patch | `97c473797b6062ba4a198314853b423235a62c9b` |
| [paseo 4101](https://github.com/getpaseo/paseo/pull/4101) | fix(terminal): preserve CJK spacing across retained restores | private patch | `0d27ddd37a8ab0a6b2a367f73ccb49cb6c1fa1a3` |
| [paseo 3954](https://github.com/getpaseo/paseo/pull/3954) | Capture mouse states so that changing tab focus will reinstate mouse capture | private patch | `268b02f8b1efcba071003c775b80693a4ffe8d67` |
| [paseo 4226](https://github.com/getpaseo/paseo/pull/4226) | Fix Enter submission in narrow desktop panes | private patch | `387f0f621b2cfb541acfc8ee61d408ae40f9e105` |
| [paseo 2204](https://github.com/getpaseo/paseo/pull/2204) | fix: prevent file mention autocomplete from triggering on emails | private patch | `5bae4da321ec67a282986c60eb951b9097dc9992` |
| [pi 8283](https://github.com/earendil-works/pi/pull/8283) | fix(coding-agent): restore continuation after retry and compaction | private patch | `14f4c635e6a6c7dcd40e3e552cc51a4dab61ba42` |
| [pi 9126](https://github.com/earendil-works/pi/pull/9126) | fix(coding-agent): settle tool results before disposal | private patch | `fc9fc580944355ac5b28af95261446d46bdebcae` |
| [pi b2602be7](https://github.com/earendil-works/pi/commit/b2602be77cb7b0de45dd616407fd210daa48aa75) | Use two-stack FIFO for EventStream | private patch | `b2602be77cb7b0de45dd616407fd210daa48aa75` |

## Build and signing

Public build commands (from this repository, with the existing local signing identity configured):

```sh
npm ci
npm run build:desktop -- --mac zip --arm64 --publish never
```

The build uses the fixed certificate fingerprint `85757D14BD46D3EA33DF9EAC9A87598444D55A94`
and bundle ID `sh.paseo.desktop`. The existing local signing helper unlocks the configured keychain
from local files when packaging; it does not create a certificate. Private keys/passwords are never in this repository or installer.
These are self-signed macOS arm64 builds, not Apple-notarized builds. Hardened Runtime stays enabled;
`disable-library-validation` permits the existing native modules because this certificate has no
Apple Team ID. A contributor without the certificate can build source with their own explicitly
selected identity; official releases from this maintainer continue using the fixed identity.

The public app's update feed is this public repository; the private build's feed is its private
repository. They use the same app identity, so installing the public app over the private app changes
the active track. It does not automatically migrate the private patches into the public app.

## Later edits and merges

Use the release tag/source commit and official base above to compare the exact shipped changes.
The release includes the source patch and this record; private releases additionally retain the
full runtime source/override records. Compare overlapping upstream implementations at the source
owners listed above, keeping one implementation of each behavior. For terminal changes, regenerate
`terminal-emulator-webview-html.ts` from its entry source. Keep the React Native Web patch registered
in the existing postinstall path until upstream no longer discards Alt clicks.

Record changed behavior, its owning files, upstream source (if any) and the shipped version in this
same document when extending the build. No separate delivery or runtime state system is introduced.
