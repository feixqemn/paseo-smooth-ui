# Public examples

The examples below are synthetic fixtures for reviewing the intended transcript presentation.
They are not copied from a real conversation and do not represent a successful run or a product
screenshot.

## Markdown message

### Review result

The change is ready for review.

- The request path keeps its existing API.
- The loading state now has one visible transition.
- The empty state explains what to do next.

> This block is part of the example message and should remain visually distinct.

```ts
export function describeState(state: "idle" | "working" | "done") {
  return state === "done" ? "Ready" : "In progress";
}
```

## Continuous reasoning with adjacent tools

The compact transcript can show a continuous reasoning passage followed by one adjacent tool
summary:

> I found the existing layout preference and will reuse it for the normal click. The modified
> click actions can stay local to the file-link handler, so no new transport is needed.

**2 tools · completed**

<details>
<summary>Show tool activity</summary>

1. `read_file` — inspected the layout preference
2. `search` — located the file-link handler

</details>

The expanded row preserves the event order and the original tool details. The `Thinking` label is
not part of this presentation.

## Composer fixture

The composer keeps this raw text until the user sends it:

```markdown
## Ship checklist

- [ ] Review the diff
- [ ] Run the local build
```

After sending, it is rendered as Markdown in the transcript. This is a public fixture only; no
real user content or screenshot is included here.

## File-opening fixture

For a local file link such as `localhost:/workspace/README.md`:

- Click follows Layout and opens in the right pane by default.
- Command-click / Ctrl-click opens Finder or the platform file manager by default.
- Option-click / Alt-click opens with the system default application by default.

The fixture deliberately uses a `localhost` path. Public examples do not describe or expose
remote file actions.
