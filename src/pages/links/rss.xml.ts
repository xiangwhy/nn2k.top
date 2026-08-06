import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const all = await getCollection('links', ({ data }) => !data.draft);
  const sorted = all.sort(
    (a, b) => b.data.taken_at.getTime() - a.data.taken_at.getTime(),
  );

  // Minimal XML escape — enough for title/description text + tag names.
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const SITE = 'https://nn2k.top';
  const FEED_TITLE = '网摘 — nn2k.top';
  const FEED_DESC = '看到就放这儿 — 不是每天，但攒到值得的会推。';

  const items = sorted
    .map((link) => {
      const pubDate = link.data.taken_at.toUTCString();
      const desc = link.body
        ? esc(link.body.trim().slice(0, 400))
        : '';
      const cats = link.data.tags
        .map((t) => `      <category>${esc(t)}</category>`)
        .join('\n');
      return `    <item>
      <title>${esc(link.data.title)}</title>
      <link>${esc(link.data.url)}</link>
      <guid isPermaLink="true">${esc(link.data.url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${desc}</description>${cats ? '\n' + cats : ''}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(FEED_TITLE)}</title>
    <link>${SITE}/links/</link>
    <atom:link href="${SITE}/links/rss.xml" rel="self" type="application/rss+xml" />
    <description>${esc(FEED_DESC)}</description>
    <language>zh-cn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};
