export type HourCategory = "oneOnOne" | "projetos" | "focus";

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
}

export function toWeekEmbed(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  let url = (srcMatch?.[1] ?? trimmed).replace(/&amp;/g, "&").trim();

  if (/calendar\.google\.com\/calendar\/u\/\d+\/r\//.test(url)) return null;

  if (url.includes("@") && !url.includes("calendar.google.com")) {
    url = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(url)}`;
  }

  if (!url.includes("calendar.google.com/calendar/embed")) return null;
  if (!url.startsWith("http")) url = `https://${url}`;

  const parsed = new URL(url);
  parsed.searchParams.set("mode", "WEEK");
  parsed.searchParams.set("wkst", "2");
  parsed.searchParams.set("ctz", "America/Sao_Paulo");
  parsed.searchParams.set("hl", "pt_BR");
  parsed.searchParams.set("showTitle", "0");
  parsed.searchParams.set("showNav", "1");
  parsed.searchParams.set("showDate", "1");
  parsed.searchParams.set("showPrint", "0");
  parsed.searchParams.set("showTabs", "0");
  parsed.searchParams.set("showCalendars", "0");
  return parsed.toString();
}

export function weekRange(now = new Date()) {
  const start = new Date(now);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

export function categorize(title: string): HourCategory | null {
  const text = title.toLowerCase();
  if (/focus|foco|deep work/.test(text)) return "focus";
  if (/1\s*[:x-]\s*1|one[- ]on[- ]one|1\s*a\s*1/.test(text)) return "oneOnOne";
  if (/projeto/.test(text)) return "projetos";
  return null;
}

export function hoursByCategory(events: CalendarEvent[], now = new Date()) {
  const { start, end } = weekRange(now);
  const totals: Record<HourCategory, number> = { oneOnOne: 0, projetos: 0, focus: 0 };

  for (const event of events) {
    const category = categorize(event.title);
    if (!category) continue;
    const from = event.start > start ? event.start : start;
    const to = event.end < end ? event.end : end;
    const ms = to.getTime() - from.getTime();
    if (ms > 0) totals[category] += ms / 3_600_000;
  }

  return totals;
}

export function formatHours(hours: number) {
  const minutes = Math.round(hours * 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

export function parseIcs(raw: string): CalendarEvent[] {
  const unfolded = raw.replace(/\r?\n[ \t]/g, "");
  const blocks = unfolded.split("BEGIN:VEVENT").slice(1);
  const events: CalendarEvent[] = [];

  for (const block of blocks) {
    const body = block.split("END:VEVENT")[0] ?? "";
    const title = unfoldValue(body, "SUMMARY") ?? "(sem título)";
    const start = parseIcsDate(fieldLine(body, "DTSTART"));
    const end = parseIcsDate(fieldLine(body, "DTEND"));
    if (!start || !end || end <= start) continue;
    const startLine = fieldLine(body, "DTSTART") ?? "";
    if (/VALUE=DATE(;|$)/.test(startLine) && !startLine.includes("T")) continue;
    events.push({ title, start, end });
  }

  return events;
}

function fieldLine(block: string, name: string) {
  const match = block.match(new RegExp(`^${name}[;:](.*)$`, "m"));
  return match?.[0] ?? null;
}

function unfoldValue(block: string, name: string) {
  const line = fieldLine(block, name);
  if (!line) return null;
  const value = line.slice(line.indexOf(":") + 1).trim();
  return value.replace(/\\n/g, " ").replace(/\\,/g, ",");
}

function parseIcsDate(line: string | null): Date | null {
  if (!line) return null;
  const value = line.slice(line.indexOf(":") + 1).trim();
  if (!value) return null;

  if (/^\d{8}$/.test(value)) {
    const y = Number(value.slice(0, 4));
    const m = Number(value.slice(4, 6)) - 1;
    const d = Number(value.slice(6, 8));
    return new Date(y, m, d);
  }

  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!match) return null;
  const [, y, mo, d, h, mi, s, z] = match;
  if (z) {
    return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)));
  }
  return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
}
