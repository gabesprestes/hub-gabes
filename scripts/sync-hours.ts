import { readFileSync, writeFileSync } from "node:fs";
import { hoursByCategory, parseIcs, weekKey } from "../src/lib/calendar.ts";

const url = calendarUrl(process.env.ICAL_URL ?? "");
if (!url) {
  fail("ICAL_URL ainda não está configurado com o endereço que termina em basic.ics.");
}

let text = "";
try {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      Accept: "text/calendar, text/plain, */*",
      "User-Agent": "HubGabes/1.0",
    },
  });
  text = await response.text();
  if (!response.ok || !text.includes("BEGIN:VCALENDAR")) {
    fail(`Não foi possível ler a agenda (resposta ${response.status}).`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : "erro ao ler a agenda";
  fail(message.replace(url, "agenda"));
}

const result = hoursByCategory(parseIcs(text));
const payload = {
  weekStart: weekKey(),
  oneOnOne: round(result.totals.oneOnOne),
  projetos: round(result.totals.projetos),
  focus: round(result.totals.focus),
  colorsFound: result.colorsFound,
  updatedAt: new Date().toISOString(),
};

let previous: Partial<typeof payload> = {};
try {
  previous = JSON.parse(readFileSync("public/hours.json", "utf8"));
} catch {
  previous = {};
}
const unchanged =
  previous.weekStart === payload.weekStart &&
  previous.oneOnOne === payload.oneOnOne &&
  previous.projetos === payload.projetos &&
  previous.focus === payload.focus &&
  previous.colorsFound === payload.colorsFound;
if (unchanged) {
  console.log("Saldo sem mudança.");
  process.exit(0);
}

writeFileSync("public/hours.json", `${JSON.stringify(payload, null, 2)}\n`);
console.log(
  `Semana ${payload.weekStart}: 1:1 ${payload.oneOnOne}h, projetos ${payload.projetos}h, focus ${payload.focus}h`,
);

function fail(message: string): never {
  console.error(message);
  if (process.env.GITHUB_ACTIONS) console.log(`::error::${message.replaceAll("\n", " ")}`);
  process.exit(1);
}

function round(hours: number) {
  return Math.round(hours * 100) / 100;
}

function calendarUrl(raw: string) {
  const match = raw.match(/https:\/\/calendar\.google\.com\/calendar\/ical\/\S+/i);
  const found = (match?.[0] ?? raw).trim().replace(/^["']|["']$/g, "").replace(/&amp;/g, "&");
  return found.replace(/["'<>].*$/, "").trim();
}
