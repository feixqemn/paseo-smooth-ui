# Paseo Smooth UI

A focused UI fork of official Paseo 0.8.0. These changes reuse the existing transcript,
Markdown renderer, tool grouping, Layout preferences, and desktop opener.

## File opening

File opening is predictable without making the common path slower.

| Gesture | Configurable action | Smooth UI default |
| --- | --- | --- |
| Click | Follow the selected Layout destination | Open in the right pane |
| Command-click on macOS / Ctrl-click on Windows and Linux | Choose an explicit open action | Open in Finder / the platform file manager |
| Option-click on macOS / Alt-click on Windows and Linux | Choose an explicit open action | Open with the system default application |

The settings expose these mappings in the same Layout area. A user can change the action while
the gesture remains stable. The regular click therefore follows the Layout preference, while the
two modified clicks are deliberate escape hatches for the file manager and the system default
application.

Modifier actions apply to chat file links, terminal file links, and Explorer file clicks.
Finder/default-app actions require the desktop app and its local daemon. External web URLs keep
their existing behavior. Option/Alt takes precedence if both modifier families are held.
Each modifier offers: follow Layout, main pane, right pane, file manager, or default application.
Existing saved Layout and tool-detail preferences are preserved; new profiles default to the right
pane and tool overview. Choose Overview in Appearance to use adjacent tool summaries.

## Chat transcript

The transcript reads as one continuous exchange:

- Reasoning is rendered inline as it arrives, without a separate `Thinking` title or a heavy
  thinking card.
- Markdown in reasoning and assistant messages uses the same readable renderer: headings, lists,
  emphasis, links, block quotes, tables, and fenced code remain visually distinct.
- Adjacent tool calls are summarized into one compact, expandable row. Tool results stay in their
  original order and remain available when expanded.
- Reasoning and tool summaries keep their actual event order, so the compact view does not rewrite
  the conversation.
- A lightweight gradient shimmer runs on the active streamed reasoning surface. It stops when
  the stream settles and respects reduced-motion settings.

Sent user messages render as Markdown after submission. The composer keeps the raw Markdown text
so editing and copying preserve exactly what the user wrote.

## Scope

This is a UI track. It does not change Pi, the Paseo daemon, provider requests, session
serialization, or message delivery. Public examples are synthetic and contain no private
conversation, workspace path, credential, update configuration, or signing material.

See [rendered examples](examples.md). The public repository contains the UI source; the full
private Pi/daemon customization and its signed installer remain separate.
