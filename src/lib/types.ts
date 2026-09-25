/** Identifica o Gist deste hub (não misturar com outros hubs). */
export const GIST_DESCRIPTION = "Hub Gabes — personal workspace";

export type PriorityLevel = "alta" | "media" | "baixa";
export type PendenciaStatus = "pending" | "delayed" | "done" | "cancelled" | "ongoing" | "paused";
export type PendenciaCategoria = "lideranca" | "quality" | "csat" | "extra" | "pessoal";
export type LinkCategoria = "gerais" | "quality" | "csat" | "projetos";
export type BoardColumn = "backlog" | "andamento" | "pausado" | "concluido";
export type ProjectCategory = "quality" | "csat" | "lideranca" | "extra" | "pessoal";

export interface Prioridade {
  id: string;
  text: string;
  level: PriorityLevel;
  done: boolean;
}

export interface Pendencia {
  id: string;
  text: string;
  status: PendenciaStatus;
  due: string;
  doneAt: string;
  priority: PriorityLevel;
  categoria: PendenciaCategoria;
}

export interface Nota {
  id: string;
  title: string;
  text: string;
  color: number;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
  categoria: LinkCategoria;
  note?: string;
}

export interface Reminder {
  id: string;
  text: string;
  updatedAt: string;
}

export interface BoardLink {
  id: string;
  label: string;
  url: string;
}

export interface BoardCard {
  id: string;
  title: string;
  detail: string;
  category: ProjectCategory;
  deadline: string;
  startedAt: string;
  column: BoardColumn;
  doneAt: string;
  comments: string;
  links: BoardLink[];
}

export interface Entrega {
  id: string;
  description: string;
  frequencia: string;
  checks: Record<string, boolean>;
}

export interface AnalystNote {
  link: string;
  notes: string;
  mentions: string;
  feedback: string;
}

export interface Meta {
  updatedAt: string;
  owner?: string;
}

export interface WeekHours {
  weekStart: string;
  oneOnOne: number;
  projetos: number;
  focus: number;
  colorsFound: boolean;
  updatedAt: string;
}

export interface AgendaConfig {
  embedUrl: string;
  icalUrl: string;
  photo: string;
  reminders: Reminder[];
  weekHours: WeekHours | null;
}

export type CollectionMap = {
  prioridades: Prioridade[];
  pendencias: Pendencia[];
  notas: Nota[];
  links: LinkItem[];
  agenda: AgendaConfig;
  board: BoardCard[];
  entregas: Entrega[];
  analistas: Record<string, AnalystNote>;
  meta: Meta;
};

export type CollectionName = keyof CollectionMap;

export const COLLECTION_FILES: Record<CollectionName, string> = {
  prioridades: "prioridades.json",
  pendencias: "pendencias.json",
  notas: "notas.json",
  links: "links.json",
  agenda: "agenda.json",
  board: "board.json",
  entregas: "entregas.json",
  analistas: "analistas.json",
  meta: "meta.json",
};

export const PENDENCIA_CATEGORIAS: { key: PendenciaCategoria; label: string }[] = [
  { key: "lideranca", label: "Liderança" },
  { key: "quality", label: "Quality" },
  { key: "csat", label: "CSAT" },
  { key: "extra", label: "Projetos Extra" },
  { key: "pessoal", label: "Pessoal" },
];

export const PENDENCIA_STATUS: { key: PendenciaStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "delayed", label: "Delayed" },
  { key: "done", label: "Done" },
  { key: "cancelled", label: "Cancelled" },
  { key: "ongoing", label: "On Going" },
  { key: "paused", label: "Paused" },
];

export const BOARD_COLUMNS: { key: BoardColumn; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "andamento", label: "Em andamento" },
  { key: "pausado", label: "Pausado" },
  { key: "concluido", label: "Concluído" },
];

export const PROJECT_CATEGORIES: { key: ProjectCategory; label: string }[] = [
  { key: "quality", label: "Quality" },
  { key: "csat", label: "CSAT" },
  { key: "lideranca", label: "Liderança" },
  { key: "extra", label: "Projetos Extra" },
  { key: "pessoal", label: "Pessoal" },
];

export const FREQUENCIAS: { key: string; label: string; color: string }[] = [
  { key: "diaria", label: "Diária", color: "#d1314c" },
  { key: "semanal", label: "Semanal", color: "#e06a1f" },
  { key: "quinzenal", label: "Quinzenal", color: "#b8860b" },
  { key: "mensal", label: "Mensal", color: "#1f9d63" },
  { key: "bimensal", label: "Bi-Mensal", color: "#2b6cb0" },
  { key: "semestral", label: "Semestral", color: "#8a05be" },
];

export const MONTHS = [
  { key: "jan", label: "Jan" },
  { key: "fev", label: "Fev" },
  { key: "mar", label: "Mar" },
  { key: "abr", label: "Abr" },
  { key: "mai", label: "Mai" },
  { key: "jun", label: "Jun" },
  { key: "jul", label: "Jul" },
  { key: "ago", label: "Ago" },
  { key: "set", label: "Set" },
  { key: "out", label: "Out" },
  { key: "nov", label: "Nov" },
  { key: "dez", label: "Dez" },
];

export const ANALYSTS = [
  { slug: "alan", name: "Alan" },
  { slug: "livia", name: "Lívia" },
  { slug: "luciana", name: "Luciana" },
  { slug: "matheus", name: "Matheus" },
  { slug: "evelyn", name: "Evelyn" },
  { slug: "mayara", name: "Mayara" },
  { slug: "franciele", name: "Franciele" },
];

export const LINK_CATEGORIAS: { key: LinkCategoria; label: string }[] = [
  { key: "gerais", label: "Links gerais" },
  { key: "quality", label: "Quality" },
  { key: "csat", label: "CSAT" },
  { key: "projetos", label: "Projetos" },
];

export function emptyChecks() {
  return Object.fromEntries(MONTHS.map((month) => [month.key, false]));
}

export function emptyAnalyst(): AnalystNote {
  return { link: "", notes: "", mentions: "", feedback: "" };
}

export function emptyReminders(): Reminder[] {
  return [{ id: "reminder-1", text: "", updatedAt: "" }];
}
