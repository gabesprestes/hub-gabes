/** Identifica o Gist deste hub (não misturar com outros hubs). */
export const GIST_DESCRIPTION = "Hub Gabes — personal workspace";

export type PriorityLevel = "alta" | "media" | "baixa";
export type PendenciaStatus = "pendente" | "andamento" | "concluido";
export type PendenciaCategoria = "lideranca" | "quality" | "csat" | "pessoal";
export type LinkCategoria = "gerais" | "quality" | "csat" | "projetos";

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
  categoria: PendenciaCategoria;
}

export interface Nota {
  id: string;
  title: string;
  text: string;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
  categoria: LinkCategoria;
  note?: string;
}

export interface Meta {
  updatedAt: string;
  owner?: string;
}

export type CollectionMap = {
  prioridades: Prioridade[];
  pendencias: Pendencia[];
  notas: Nota[];
  links: LinkItem[];
  meta: Meta;
};

export type CollectionName = keyof CollectionMap;

export const COLLECTION_FILES: Record<CollectionName, string> = {
  prioridades: "prioridades.json",
  pendencias: "pendencias.json",
  notas: "notas.json",
  links: "links.json",
  meta: "meta.json",
};

export const PENDENCIA_CATEGORIAS: { key: PendenciaCategoria; label: string }[] = [
  { key: "lideranca", label: "Liderança" },
  { key: "quality", label: "Quality" },
  { key: "csat", label: "CSAT" },
  { key: "pessoal", label: "Pessoal" },
];

export const LINK_CATEGORIAS: { key: LinkCategoria; label: string }[] = [
  { key: "gerais", label: "Links gerais" },
  { key: "quality", label: "Quality" },
  { key: "csat", label: "CSAT" },
  { key: "projetos", label: "Projetos" },
];
