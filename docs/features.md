# Paseo Smooth UI

A focused UI fork of official Paseo 0.8.0. These changes reuse the existing transcript,
Markdown renderer, tool grouping, Layout preferences, and desktop opener.

## File opening

File opening is predictable without making the common path slower.

| Gesture                                                  | Configurable action                    | Smooth UI default                          |
| -------------------------------------------------------- | -------------------------------------- | ------------------------------------------ |
| Click                                                    | Follow the selected Layout destination | Open in the right pane                     |
| Command-click on macOS / Ctrl-click on Windows and Linux | Choose an explicit open action         | Open in Finder / the platform file manager |
| Option-click on macOS / Alt-click on Windows and Linux   | Choose an explicit open action         | Open with the system default application   |

The settings expose these mappings in the same Layout area. A user can change the action while
the gesture remains stable. The regular click therefore follows the Layout preference, while the
two modified clicks are deliberate escape hatches for the file manager and the system default
application.

Modifier actions apply to chat file links, terminal file links, and Explorer file clicks.
Finder/default-app actions require the desktop app and its local daemon. External web URLs keep
their existing behavior. Option/Alt takes precedence if both modifier families are held.
The bundled React Native Web compatibility patch preserves Alt clicks through its press handler.
Each modifier offers: follow Layout, main pane, right pane, file manager, or default application.
Existing saved Layout and tool-detail preferences are preserved; new profiles default to the right
pane and tool overview. Choose Overview in Appearance to use adjacent tool summaries.

## Chat transcript

The transcript reads as one continuous exchange:

- Consecutive reasoning and tool calls share one compact activity row. Reasoning never creates
  its own transcript block in Overview mode; expand the row to read it.
- Markdown in reasoning and assistant messages uses the same readable renderer: headings, lists,
  emphasis, links, block quotes, tables, and fenced code remain visually distinct.
- The summary names the tool activity. Inside, reasoning uses the same compact row as tools, with a cloud icon. Click the
  reasoning row to read provider-supplied Markdown details; individual tool entries keep their order.
- Reasoning and tool summaries keep their actual event order, so the compact view does not rewrite
  the conversation.
- The activity summary has a text-gradient sweep while reasoning or tools are running.
- Desktop/web disclosure opens and closes with a 220ms height transition and a soft fade.
  Content is released after closing; rapid toggles reverse the transition. Motion respects
  reduced-motion settings.

Sent user messages render as Markdown after submission. The composer keeps the raw Markdown text
so editing and copying preserve exactly what the user wrote. Chinese strong emphasis also handles
punctuation touching the markers and horizontal space before a closing marker, without rewriting
source text, escaped markers, or code.

## Scope

This is a UI track. It does not change Pi, the Paseo daemon, provider requests, session
serialization, or message delivery. Public examples are synthetic and contain no private
conversation, workspace path, credential, update configuration, or signing material.

See [rendered examples](examples.md). The public repository provides UI source and a signed macOS arm64 build.
The full private Pi/daemon customization remains a separate build. See [change records](changes.md).
