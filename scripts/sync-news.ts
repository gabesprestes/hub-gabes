import { readFileSync, writeFileSync } from "node:fs";

const FEEDS = [
  { url: "https://g1.globo.com/rss/g1/politica/", take: 2 },
  { url: "https://g1.globo.com/rss/g1/economia/", take: 1 },
  { url: "https://g1.globo.com/rss/g1/mundo/", take: 1 },
];

const items = await headlines();
if (items.length === 0) fail("O G1 não trouxe manchetes.");

const payload = {
  source: "g1",
  updatedAt: new Date().toISOString(),
  items,
};

let previous: { items?: { title?: string; link?: string }[] } = {};
try {
  previous = JSON.parse(readFileSync("public/news.json", "utf8"));
} catch {
  previous = {};
}
const before = (previous.items ?? []).map((item) => `${item.link}|${item.title}`).join("\n");
const after = items.map((item) => `${item.link}|${item.title}`).join("\n");
if (before === after) {
  console.log("Manchetes sem mudança.");
  process.exit(0);
}

writeFileSync("public/news.json", `${JSON.stringify(payload, null, 2)}\n`);
console.log(items.map((item) => item.title).join("\n"));

async function headlines() {
  const found: { title: string; link: string }[] = [];
  const seen = new Set<string>();
  let failures = 0;
  for (const feed of FEEDS) {
    let xml = "";
    try {
      const response = await fetch(feed.url, {
        redirect: "follow",
        headers: {
          Accept: "application/rss+xml, application/xml, text/xml, */*",
          "User-Agent": "HubGabes/1.0",
        },
      });
      xml = await response.text();
      if (!response.ok || !xml.includes("<item>")) {
        failures += 1;
        continue;
      }
    } catch {
      failures += 1;
      continue;
    }
    let taken = 0;
    for (const block of xml.split("<item>").slice(1)) {
      const title = decode(tag(block, "title"));
      const link = tag(block, "link");
      if (!title || !link.startsWith("https://g1.globo.com/")) continue;
      if (link.includes("especial-publicitario") || /^(vídeos|videos|oportunidade)\b/i.test(title)) continue;
      if (seen.has(link)) continue;
      seen.add(link);
      found.push({ title, link });
      taken += 1;
      if (taken === feed.take) break;
    }
  }
  if (failures === FEEDS.length) fail("Não foi possível ler o G1.");
  return found;
}

function tag(block: string, name: string) {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  if (!match) return "";
  return match[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

function decode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function fail(message: string): never {
  console.error(message);
  if (process.env.GITHUB_ACTIONS) console.log(`::error::${message.replaceAll("\n", " ")}`);
  process.exit(1);
}
