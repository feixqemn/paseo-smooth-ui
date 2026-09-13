# Rendered examples

These are actual captures of the modified Paseo renderer using an isolated local mock provider.
All conversation text and tool activity are synthetic. They illustrate presentation, not completed
coding work. No real user conversation is included.

## Sent Markdown

Headings, emphasis, lists, quotes and code blocks render after sending. The composer and copy action
keep the Markdown source.

![Sent Markdown message](images/markdown-message.png)

## Reasoning and adjacent tools

Consecutive reasoning and tool calls share an activity summary. Expanding it shows each tool call
and the full original provider thinking text, with a cloud icon and matching typography.
There is no derived title or duplicate detail panel.

## Long messages

Messages over 480px offer Show more / Show less; wide Markdown stays within the conversation.
Streaming replies and thinking remain visible. Sending and copying preserve the full source.

## Try it

Paste this into the composer and send it:

````markdown
## Readable by design

**Keep the conversation flowing.**

- Render Markdown after sending.
- Show reasoning without a separate card.
- Group adjacent tools, keeping their order.

> Less chrome. More room for the work.

```ts
const destination = modifiers.alt ? "default app" : "right pane";
```
````

In a local desktop workspace, click a file link such as `[README](README.md)` in an assistant message:
normal click follows Layout, Command/Ctrl locates it in the file manager, and Option/Alt opens it
with the system default application. The mappings are configurable in Settings → Layout.

## Chinese emphasis

![Chinese Markdown, including punctuation-adjacent emphasis](images/chinese-markdown.jpg)

These also render as bold in sent messages and assistant replies:

```markdown
这是**中文。**后续说明。
这段文字： **内容清晰。 **接着继续正文。
```

The source and code spans remain unchanged when copied.

Chinese curly quotes now also preserve bold: `我希望把**“界面清晰”变成“阅读轻松”**。`
