import type {
  CollectionMap,
  CollectionName,
  LinkItem,
  Meta,
  Nota,
  Pendencia,
  Prioridade,
} from "./types";

export function emptyCollections(): CollectionMap {
  return {
    prioridades: [],
    pendencias: [],
    notas: [],
    links: [],
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
  const o = (x ?? {}) as Partial<Pendencia>;
  const cats = ["lideranca", "quality", "csat", "pessoal"] as const;
  return {
    id: String(o.id ?? uid()),
    text: String(o.text ?? ""),
    status:
      o.status === "andamento" || o.status === "concluido" ? o.status : "pendente",
    due: String(o.due ?? ""),
    categoria: cats.includes(o.categoria as (typeof cats)[number])
      ? (o.categoria as Pendencia["categoria"])
      : "pessoal",
  };
}

function ensureNota(x: unknown): Nota {
  const o = (x ?? {}) as Partial<Nota>;
  return {
    id: String(o.id ?? uid()),
    title: String(o.title ?? "(sem título)"),
    text: String(o.text ?? ""),
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
