import { writeFileSync } from "node:fs";
import { hoursByCategory, parseIcs, weekKey } from "../src/lib/calendar";

const url = process.env.ICAL_URL?.trim();
if (!url) {
  console.log("ICAL_URL ainda não está configurado.");
  process.exit(0);
}

const response = await fetch(url);
const text = await response.text();
if (!response.ok || !text.includes("BEGIN:VCALENDAR")) {
  console.error("Não foi possível ler a agenda.");
  process.exit(0);
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

writeFileSync("public/hours.json", `${JSON.stringify(payload, null, 2)}\n`);
console.log(
  `Semana ${payload.weekStart}: 1:1 ${payload.oneOnOne}h, projetos ${payload.projetos}h, focus ${payload.focus}h`,
);

function round(hours: number) {
  return Math.round(hours * 100) / 100;
}
