import { describe, expect, it } from "vitest";
// @ts-expect-error a build script, plain JavaScript
import { inline, markdownToHtml } from "../scripts/markdown.mjs";

const read = async (path: string) => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};

describe("how to make a world, the kit's docs/start.md as a page (landing-02)", () => {
  it("reads what the document uses: headings, paragraphs, lists, tables, code and links", () => {
    const html = markdownToHtml("# Start\n\nOne line\nand more.\n\n## Two\n\n- a\n- b `c`\n\n1. first\n   on\n2. second\n\n| A | B |\n|---|---|\n| [x](https://a.example/) | **y** |\n\n```bash\nnpm run dev\n```\n");
    expect(html).toContain('<h1 id="start">Start</h1>');
    expect(html).toContain("<p>One line and more.</p>");
    expect(html).toContain("<ul><li>a</li><li>b <code>c</code></li></ul>");
    expect(html).toContain("<ol><li>first on</li><li>second</li></ol>");
    expect(html).toContain('<td><a href="https://a.example/">x</a></td><td><strong>y</strong></td>');
    expect(html).toContain('<pre class="code lang-bash"><code>npm run dev</code></pre>');
  });

  it("makes nothing in the text markup it didn't ask for, and links only to https or this site", () => {
    expect(markdownToHtml("<script>alert(1)</script>")).toBe("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
    expect(inline("[x](javascript:alert(1))")).not.toContain("<a");
    expect(inline("[x](http://plain.example/)")).toBe("x");
    expect(inline("[x](/doors/)")).toBe('<a href="/doors/">x</a>');
    expect(inline("`<b>` and **<i>**")).toBe("<code>&lt;b&gt;</code> and <strong>&lt;i&gt;</strong>");
    expect(markdownToHtml("```\n<b>kept</b>\n```")).toContain("&lt;b&gt;kept&lt;/b&gt;");
  });

  it("is built from the vendored kit, served as plain text too, and brought by the vendor script", async () => {
    const build = await read("scripts/build.mjs");
    expect(build).toContain('join(root, "vendor/nswp/docs/start.md")');
    expect(build).toContain('cpSync(startDoc, join(out, "start.md"))');
    expect(build).toContain('{ source: "/start.md", headers: [{ key: "Content-Type", value: "text/markdown; charset=utf-8" }] }');
    expect(await read("scripts/vendor.mjs")).toContain('cpSync(join(repo, "docs", "start.md"), join(out, "docs", "start.md"))');
    const page = await read("src/start/index.html");
    expect(page).toContain('<a href="/start.md"><code>/start.md</code></a>');
    expect(page).toContain("<!-- doc -->");
  });

  it("is where the front page sends someone who wants to make a world", async () => {
    expect(await read("src/landing/index.html")).toContain('<a id="get-started" class="button" href="/start/">How to make a world</a>');
  });
});
