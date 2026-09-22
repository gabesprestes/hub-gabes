export type HourCategory = "oneOnOne" | "projetos" | "focus";

const ANALYSTS = ["mayara", "evelyn", "livia", "alan", "matheus", "luciana", "francilene"];

/** Grafite, a cor mais escura da paleta de eventos do Google Calendar. */
const DARK_COLOR = /^(8|graphite|grafite|#616161)$/i;

export type EventColor = "dark" | "default" | "other" | "unknown";

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  recurring: boolean;
  color: EventColor;
  rrule: string | null;
  exdates: Date[];
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
  parsed.searchParams.set("color", "#8a05be");
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

const PROJETOS = [
  "cross bu - monthly",
  "wr - reassessment id",
  "fraud ops leadership weekly",
  "bci working group",
  "ritual de rdrs procedentes",
  "quality/csat planning",
];

const FOCUS = ["focus time", "pendencias quality", "pendencias csat"];

export function categorize(event: CalendarEvent): HourCategory | null {
  const text = normalize(event.title);
  if (PROJETOS.some((name) => text.includes(name))) return "projetos";
  if (FOCUS.some((name) => text.includes(name))) return "focus";
  if (isOneOnOne(event.title)) return "oneOnOne";
  if (event.color === "unknown") return null;
  if (event.recurring && event.color === "dark") return "projetos";
  if (event.color === "default") return "focus";
  return null;
}

function isOneOnOne(title: string) {
  const starts = /^\s*1\s*:\s*1\b/i.test(title);
  const text = normalize(title);
  const named = ANALYSTS.some((name) => new RegExp(`\\b${name}\\b`, "i").test(text));
  return starts || named;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function hoursByCategory(events: CalendarEvent[], now = new Date()) {
  const { start, end } = weekRange(now);
  const totals: Record<HourCategory, number> = { oneOnOne: 0, projetos: 0, focus: 0 };
  const colorsFound = events.some((event) => event.color !== "unknown");

  for (const event of materialize(events, start, end)) {
    const category = categorize(event);
    if (!category) continue;
    const from = event.start > start ? event.start : start;
    const to = event.end < end ? event.end : end;
    const ms = to.getTime() - from.getTime();
    if (ms > 0) totals[category] += ms / 3_600_000;
  }

  return { totals, colorsFound };
}

function materialize(events: CalendarEvent[], rangeStart: Date, rangeEnd: Date) {
  const out: CalendarEvent[] = [];
  for (const event of events) {
    if (!event.rrule) {
      out.push(event);
      continue;
    }
    const duration = event.end.getTime() - event.start.getTime();
    const cursor = new Date(rangeStart);
    cursor.setHours(0, 0, 0, 0);
    while (cursor < rangeEnd) {
      if (ruleMatchesDay(cursor, event)) {
        const start = new Date(cursor);
        start.setHours(event.start.getHours(), event.start.getMinutes(), event.start.getSeconds(), 0);
        const skipped = event.exdates.some((day) => sameDay(day, start));
        if (!skipped && start >= event.start && start < rangeEnd && start >= rangeStart) {
          out.push({ ...event, start, end: new Date(start.getTime() + duration), recurring: true });
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return out;
}

function ruleMatchesDay(day: Date, event: CalendarEvent) {
  const rule = event.rrule ?? "";
  const freq = /FREQ=([A-Z]+)/.exec(rule)?.[1] ?? "WEEKLY";
  const interval = Number(/INTERVAL=(\d+)/.exec(rule)?.[1] ?? "1");
  const untilRaw = /UNTIL=(\d{8}T\d{6}Z?|\d{8})/.exec(rule)?.[1];
  if (untilRaw) {
    const until = parseIcsDate(`UNTIL:${untilRaw}`);
    if (until && day > until) return false;
  }
  if (freq === "DAILY") {
    const diff = Math.floor((day.getTime() - startOfDay(event.start).getTime()) / 86_400_000);
    return diff >= 0 && diff % interval === 0;
  }
  if (freq !== "WEEKLY") return false;
  const byday = /BYDAY=([A-Z,]+)/.exec(rule)?.[1];
  const days = byday ? byday.split(",") : [weekdayCode(event.start)];
  if (!days.includes(weekdayCode(day))) return false;
  const weeks = Math.floor((startOfDay(day).getTime() - startOfDay(event.start).getTime()) / (7 * 86_400_000));
  return weeks >= 0 && weeks % interval === 0;
}

function weekdayCode(date: Date) {
  return ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][date.getDay()];
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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
    const rrule = unfoldValue(body, "RRULE");
    const color = readColor(body);
    events.push({
      title,
      start,
      end,
      rrule,
      recurring: Boolean(rrule) || Boolean(fieldLine(body, "RECURRENCE-ID")),
      color,
      exdates: exdatesIn(body),
    });
  }

  return events;
}

function readColor(block: string): EventColor {
  const raw = unfoldValue(block, "COLOR") ?? unfoldValue(block, "X-GOOGLE-COLOR-ID");
  if (!raw) return "unknown";
  if (DARK_COLOR.test(raw.trim())) return "dark";
  return "other";
}

function exdatesIn(block: string) {
  const dates: Date[] = [];
  for (const line of block.split(/\r?\n/)) {
    if (!line.startsWith("EXDATE")) continue;
    const value = line.slice(line.indexOf(":") + 1);
    for (const part of value.split(",")) {
      const parsed = parseIcsDate(`EXDATE:${part.trim()}`);
      if (parsed) dates.push(parsed);
    }
  }
  return dates;
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
