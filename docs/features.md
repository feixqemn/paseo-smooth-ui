# Paseo Smooth UI

This document describes the small UI changes planned for the Paseo Smooth UI public track. The
source starts from the official Paseo 0.8.0 tree. The notes describe an interaction contract;
they do not claim that a feature is already shipped.

## File opening

File opening should be predictable without making the common path slower.

| Gesture | Configurable action | Smooth UI default |
| --- | --- | --- |
| Click | Follow the selected Layout destination | Open in the right pane |
| Command-click on macOS / Ctrl-click on Windows and Linux | Choose an explicit open action | Open in Finder / the platform file manager |
| Option-click on macOS / Alt-click on Windows and Linux | Choose an explicit open action | Open with the system default application |

The settings expose these mappings in the same Layout area. A user can change the action while
the gesture remains stable. The regular click therefore follows the Layout preference, while the
two modified clicks are deliberate escape hatches for the file manager and the system default
application.

These actions are limited to files available through the local Paseo client or a `localhost`
file endpoint. They do not add remote file access, a new file transport, or a new permission
model. Existing path and workspace rules remain in force.

## Chat transcript

The transcript should read as one continuous exchange:

- Reasoning is rendered inline as it arrives, without a separate `Thinking` title or a heavy
  thinking card.
- Markdown in reasoning and assistant messages uses the same readable renderer: headings, lists,
  emphasis, links, block quotes, tables, and fenced code remain visually distinct.
- Adjacent tool calls are summarized into one compact, expandable row. Tool results stay in their
  original order and remain available when expanded.
- Reasoning and tool summaries keep their actual event order, so the compact view does not rewrite
  the conversation.
- A lightweight gradient shimmer may run on the active streamed reasoning surface. It stops when
  the stream settles and is purely presentational.

Sent user messages render as Markdown after submission. The composer keeps the raw Markdown text
so editing and copying preserve exactly what the user wrote.

## Scope

This is a UI track. It does not change Pi, the Paseo daemon, provider requests, session
serialization, or message delivery. Public examples are synthetic and contain no private
conversation, workspace path, credential, update configuration, or signing material.

Screenshots and a shipped build are pending the corresponding implementation in the private
Paseo build.
