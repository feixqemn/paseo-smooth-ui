import MarkdownIt from "markdown-it";

/**
 * The one place that decides how the app parses markdown.
 *
 * `typographer` stays off. It switches on two markdown-it core rules that
 * rewrite characters the user may copy back into a shell or a file:
 * `replacements` turns `(c)` into ©, `a -- b` into an en dash and `...` into
 * an ellipsis, and `smartquotes` curls straight quotes so `--name="x"` stops
 * being pasteable. Agent output, plans and file previews all have to render
 * the text they were handed.
 *
 * `linkify` is a parameter rather than a shared default because the surfaces
 * disagree today: chat and the default renderer linkify bare URLs, plan cards
 * never have. Unifying that is a product decision on its own.
 */
export function createMarkdownParser({
  linkify,
}: {
  linkify: boolean;
}): MarkdownIt {
  const parser = new MarkdownIt({ html: false, linkify });
  // CJK prose often places strong markers against punctuation, or a space before
  // the closing marker. Relax just those boundaries, then let markdown-it balance
  // the delimiters normally. Code, escaped markers and the source stay untouched.
  parser.inline.ruler.before("emphasis", "cjk_strong", (state, silent) => {
    const start = state.pos;
    if (silent || state.src.slice(start, start + 2) !== "**") return false;
    const scanned = state.scanDelims(start, true);
    if (scanned.length !== 2) return false;
    let before = start - 1;
    while (before >= 0 && /[ \t]/.test(state.src[before]!)) before--;
    const cjk =
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u3001-\u303f\uff01-\uff65]/u;
    const canOpen = scanned.can_open || cjk.test(state.src[start + 2] ?? "");
    const canClose = scanned.can_close || cjk.test(state.src[before] ?? "");
    if (canOpen === scanned.can_open && canClose === scanned.can_close)
      return false;
    for (let index = 0; index < 2; index++) {
      state.push("text", "", 0).content = "*";
      const delimiter = {
        marker: 0x2a,
        length: 2,
        jump: index,
        token: state.tokens.length - 1,
        end: -1,
        open: canOpen,
        close: canClose,
      };
      state.delimiters.push(delimiter);
    }
    state.pos += 2;
    return true;
  });
  return parser;
}
