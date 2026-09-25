import { writeFileSync } from "node:fs";
import { hoursByCategory, parseIcs, weekKey } from "../src/lib/calendar.ts";

const url = calendarUrl(process.env.ICAL_URL ?? "");
if (!url) {
  console.error("ICAL_URL ainda não está configurado com o endereço que termina em basic.ics.");
  process.exit(1);
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
    console.error(`Não foi possível ler a agenda (resposta ${response.status}).`);
    process.exit(1);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : "erro ao ler a agenda";
  console.error(message.replace(url, "agenda"));
  process.exit(1);
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

function calendarUrl(raw: string) {
  const match = raw.match(/https:\/\/calendar\.google\.com\/calendar\/ical\/\S+/i);
  const found = (match?.[0] ?? raw).trim().replace(/^["']|["']$/g, "").replace(/&amp;/g, "&");
  return found.replace(/["'<>].*$/, "").trim();
}
