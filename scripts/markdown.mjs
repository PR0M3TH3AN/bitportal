// A small Markdown reader for the one document BitPortal shows from the kit: docs/start.md, the getting-started page
// (NSWP docs/backlog/landing-02-get-started.md). It reads only what that document uses: headings, paragraphs, lists,
// tables, fenced code, inline code, bold and links. Everything is escaped first, so nothing in the text becomes markup
// it didn't ask for, and a link leads only to an https address or a path on this site.

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A link's address, if it may be one: https anywhere, or a path or anchor on this site. */
const safeHref = (href) => (/^https:\/\/[^\s"<>]+$/.test(href) || /^\/[^\s"<>]*$/.test(href) || /^#[\w-]+$/.test(href) ? href : null);

/** Words in a line: code first (nothing inside it is read), then links, then bold. */
export function inline(text) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return `<code>${escape(part.slice(1, -1))}</code>`;
      let out = escape(part);
      // [words](address)
      out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (whole, words, href) => {
        const to = safeHref(href.replace(/&amp;/g, "&"));
        return to ? `<a href="${escape(to)}">${words}</a>` : words;
      });
      // <https://address>
      out = out.replace(/&lt;(https:\/\/[^\s&]+)&gt;/g, (whole, href) => `<a href="${href}">${href}</a>`);
      out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      return out;
    })
    .join("");
}

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/** The document as HTML: what goes inside the page's own frame. */
export function markdownToHtml(source) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let i = 0;
  const para = [];
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    para.length = 0;
  };
  while (i < lines.length) {
    const line = lines[i];
    // Fenced code: kept exactly, one block, with its language as a class.
    const fence = /^```(\w*)\s*$/.exec(line);
    if (fence) {
      flush();
      const body = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++;
      out.push(`<pre class="code${fence[1] ? ` lang-${fence[1]}` : ""}"><code>${escape(body.join("\n"))}</code></pre>`);
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      const level = heading[1].length;
      out.push(`<h${level} id="${slug(heading[2])}">${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }
    // A table: a header row, a rule, and rows.
    if (/^\|.*\|\s*$/.test(line) && /^\|[\s|:-]+\|\s*$/.test(lines[i + 1] ?? "")) {
      flush();
      const cells = (row) => row.trim().slice(1, -1).split("|").map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`,
      );
      continue;
    }
    // A list, numbered or not: items may run on over lines indented under them.
    const item = /^(\s*)(-|\d+\.)\s+(.*)$/.exec(line);
    if (item) {
      flush();
      const ordered = item[2] !== "-";
      const items = [];
      while (i < lines.length) {
        const m = /^(\s*)(-|\d+\.)\s+(.*)$/.exec(lines[i]);
        if (m && (m[2] !== "-") === ordered) {
          items.push([m[3]]);
          i++;
        } else if (items.length && /^\s{2,}\S/.test(lines[i])) {
          items[items.length - 1].push(lines[i].trim());
          i++;
        } else break;
      }
      const tag = ordered ? "ol" : "ul";
      out.push(`<${tag}>${items.map((words) => `<li>${inline(words.join(" "))}</li>`).join("")}</${tag}>`);
      continue;
    }
    if (/^\s*$/.test(line)) {
      flush();
      i++;
      continue;
    }
    para.push(line.trim());
    i++;
  }
  flush();
  return out.join("\n");
}
