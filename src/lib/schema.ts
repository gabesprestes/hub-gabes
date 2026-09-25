import type {
  AgendaConfig,
  AnalystNote,
  BoardCard,
  CollectionMap,
  CollectionName,
  Entrega,
  LinkItem,
  Meta,
  Nota,
  Pendencia,
  PendenciaCategoria,
  PendenciaStatus,
  Prioridade,
  PriorityLevel,
} from "./types";
import { emptyAnalyst, emptyChecks, emptyReminders, ANALYSTS } from "./types";

export function emptyCollections(): CollectionMap {
  return {
    prioridades: [],
    pendencias: [],
    notas: [],
    links: [],
    agenda: { embedUrl: "", icalUrl: "", photo: "", reminders: emptyReminders() },
    board: [],
    entregas: [],
    analistas: Object.fromEntries(ANALYSTS.map((person) => [person.slug, emptyAnalyst()])),
    meta: { updatedAt: new Date().toISOString() },
  };
}

export function parseCollection<K extends CollectionName>(
  name: K,
  raw: string | undefined | null,
): CollectionMap[K] {
  if (!raw) return emptyCollections()[name];
  try {
    const data = JSON.parse(raw);
    return ensureCollection(name, data);
  } catch {
    return emptyCollections()[name];
  }
}

function ensureCollection<K extends CollectionName>(
  name: K,
  data: unknown,
): CollectionMap[K] {
  switch (name) {
    case "prioridades":
      return (Array.isArray(data) ? data.map(ensurePrioridade) : []) as CollectionMap[K];
    case "pendencias":
      return (Array.isArray(data) ? data.map(ensurePendencia) : []) as CollectionMap[K];
    case "notas":
      return (Array.isArray(data) ? data.map(ensureNota) : []) as CollectionMap[K];
    case "links":
      return (Array.isArray(data) ? data.map(ensureLink) : []) as CollectionMap[K];
    case "agenda":
      return ensureAgenda(data) as CollectionMap[K];
    case "board":
      return (Array.isArray(data) ? data.map(ensureBoard) : []) as CollectionMap[K];
    case "entregas":
      return (Array.isArray(data) ? data.map(ensureEntrega) : []) as CollectionMap[K];
    case "analistas":
      return ensureAnalistas(data) as CollectionMap[K];
    case "meta":
      return ensureMeta(data) as CollectionMap[K];
    default:
      return emptyCollections()[name];
  }
}

function ensurePrioridade(x: unknown): Prioridade {
  const o = (x ?? {}) as Partial<Prioridade>;
  return {
    id: String(o.id ?? uid()),
    text: String(o.text ?? ""),
    level: o.level === "alta" || o.level === "baixa" ? o.level : "media",
    done: Boolean(o.done),
  };
}

function ensurePendencia(x: unknown): Pendencia {
  const o = (x ?? {}) as Partial<Pendencia> & { status?: string; categoria?: string };
  const cats: PendenciaCategoria[] = ["lideranca", "quality", "csat", "extra", "pessoal"];
  const statusMap: Record<string, PendenciaStatus> = {
    pendente: "pending",
    andamento: "ongoing",
    concluido: "done",
    pending: "pending",
    delayed: "delayed",
    done: "done",
    cancelled: "cancelled",
    ongoing: "ongoing",
    paused: "paused",
  };
  const priority: PriorityLevel = o.priority === "alta" || o.priority === "baixa" ? o.priority : "media";
  return {
    id: String(o.id ?? uid()),
    text: String(o.text ?? ""),
    status: statusMap[String(o.status)] ?? "pending",
    due: String(o.due ?? ""),
    doneAt: String(o.doneAt ?? ""),
    priority,
    categoria: cats.includes(o.categoria as PendenciaCategoria) ? (o.categoria as PendenciaCategoria) : "pessoal",
  };
}

function ensureNota(x: unknown): Nota {
  const o = (x ?? {}) as Partial<Nota>;
  return {
    id: String(o.id ?? uid()),
    title: String(o.title ?? "(sem título)"),
    text: String(o.text ?? ""),
    color: Number.isInteger(o.color) ? Number(o.color) : 0,
  };
}

function ensureLink(x: unknown): LinkItem {
  const o = (x ?? {}) as Partial<LinkItem>;
  const rawCat = String(o.categoria) === "relatorios" ? "projetos" : o.categoria;
  const cats = ["gerais", "quality", "csat", "projetos"] as const;
  return {
    id: String(o.id ?? uid()),
    label: String(o.label ?? ""),
    url: String(o.url ?? ""),
    note: o.note ? String(o.note) : undefined,
    categoria: cats.includes(rawCat as (typeof cats)[number])
      ? (rawCat as LinkItem["categoria"])
      : "gerais",
  };
}

function ensureAgenda(x: unknown): AgendaConfig {
  const o = (x ?? {}) as Partial<AgendaConfig>;
  return {
    embedUrl: String(o.embedUrl ?? ""),
    icalUrl: String(o.icalUrl ?? ""),
    photo: String(o.photo ?? ""),
    reminders: ensureReminders(o.reminders),
  };
}

function ensureReminders(value: AgendaConfig["reminders"] | undefined) {
  if (!Array.isArray(value) || value.length === 0) return emptyReminders();
  const items = value.map((current, index) => ({
    id: String(current?.id || `reminder-${index + 1}`),
    text: String(current?.text ?? ""),
    updatedAt: String(current?.updatedAt ?? ""),
  }));
  const legacyBlank = items.length === 6 && items.every((item) => !item.text && !item.updatedAt);
  if (legacyBlank) return emptyReminders();
  return items;
}

function ensureBoard(x: unknown): BoardCard {
  const o = (x ?? {}) as Partial<BoardCard> & { column?: string };
  const columns = ["backlog", "andamento", "pausado", "concluido"] as const;
  const categories = ["quality", "csat", "lideranca", "extra", "pessoal"] as const;
  const rawColumn = String((x as { column?: string } | null)?.column ?? "");
  const column = rawColumn === "destaque" ? "backlog" : rawColumn;
  return {
    id: String(o.id ?? uid()),
    title: String(o.title ?? ""),
    detail: String(o.detail ?? ""),
    category: categories.includes(o.category as (typeof categories)[number])
      ? (o.category as BoardCard["category"])
      : "quality",
    deadline: String(o.deadline ?? ""),
    startedAt: String(o.startedAt ?? ""),
    column: columns.includes(column as (typeof columns)[number]) ? (column as BoardCard["column"]) : "backlog",
    doneAt: String(o.doneAt ?? ""),
    comments: String(o.comments ?? ""),
    links: ensureBoardLinks(o.links),
  };
}

function ensureBoardLinks(value: BoardCard["links"] | undefined): BoardCard["links"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const link = (item ?? {}) as Partial<BoardCard["links"][number]>;
    const url = String(link.url ?? "").trim();
    if (!url) return [];
    return [{ id: String(link.id || uid()), label: String(link.label ?? ""), url }];
  });
}

function ensureEntrega(x: unknown): Entrega {
  const o = (x ?? {}) as Partial<Entrega>;
  return {
    id: String(o.id ?? uid()),
    description: String(o.description ?? ""),
    frequencia: String(o.frequencia ?? ""),
    checks: { ...emptyChecks(), ...(o.checks ?? {}) },
  };
}

function ensureAnalistas(value: unknown): Record<string, AnalystNote> {
  const source = (value ?? {}) as Record<string, Partial<AnalystNote>>;
  return Object.fromEntries(
    ANALYSTS.map((person) => {
      const note = source[person.slug] ?? {};
      return [
        person.slug,
        {
          link: String(note.link ?? ""),
          notes: String(note.notes ?? ""),
          mentions: String(note.mentions ?? ""),
          feedback: String(note.feedback ?? ""),
        },
      ];
    }),
  );
}

function ensureMeta(x: unknown): Meta {
  const o = (x ?? {}) as Partial<Meta>;
  return {
    updatedAt: String(o.updatedAt ?? new Date().toISOString()),
    owner: o.owner ? String(o.owner) : undefined,
  };
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
