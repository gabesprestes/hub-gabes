"use client";

import { useState } from "react";
import { useCollection } from "@/hooks/use-collection";
import { uid } from "@/lib/schema";
import {
  PENDENCIA_CATEGORIAS,
  PENDENCIA_STATUS,
  type Pendencia,
  type PendenciaCategoria,
  type PendenciaStatus,
  type PriorityLevel,
} from "@/lib/types";
import { inputClass } from "@/components/ui";

const BOX: Record<PendenciaCategoria, string> = {
  lideranca: "bg-[#f3e8fb]",
  quality: "bg-[#e7f2fc]",
  csat: "bg-[#e5f6ee]",
  extra: "bg-[#fde8d4]",
  pessoal: "bg-[#fff6d6]",
};

const PRIORITY_RANK: Record<PriorityLevel, number> = { alta: 0, media: 1, baixa: 2 };

const STATUS_TONE: Record<PendenciaStatus, string> = {
  pending: "border-[#f0b27a] bg-[#ffe4c7] text-[#c45c12]",
  delayed: "border-[#e7a3ae] bg-[#f8d0d6] text-[#c4233c]",
  done: "border-[#9ed4b4] bg-[#d4f0e0] text-[#1a7a4c]",
  ongoing: "border-[#9ec4ef] bg-[#d6e8fa] text-[#1a5fad]",
  cancelled: "border-[#d5d5da] bg-[#ececee] text-[#6e6d7a]",
  paused: "border-[#d5d5da] bg-[#ececee] text-[#6e6d7a]",
};

export default function PendenciasPage() {
  const { data, save, error } = useCollection("pendencias");
  const [filter, setFilter] = useState<"abertas" | "todas">("abertas");

  const visible = data.filter((item) => (filter === "abertas" ? item.status !== "done" && item.status !== "cancelled" : true));
  const late = visible.filter((item) => isLate(item)).length;

  function add(categoria: PendenciaCategoria) {
    void save([
      ...data,
      { id: uid(), text: "", status: "pending", due: "", doneAt: "", priority: "media", categoria },
    ]);
  }

  function patch(id: string, next: Partial<Pendencia>) {
    void save(
      data.map((item) => {
        if (item.id !== id) return item;
        const status = next.status ?? item.status;
        return { ...item, ...next, doneAt: status === "done" ? item.doneAt || today() : "" };
      }),
    );
  }

  function remove(id: string) {
    void save(data.filter((item) => item.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--purple)]">Agenda</p>
          <h1 className="m-0 text-[28px] font-bold tracking-tight">Pendências</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            {late > 0 ? `${late} atrasada${late > 1 ? "s" : ""}` : "Nada atrasado nas abertas"}
          </p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as "abertas" | "todas")} className={inputClass + " w-36"}>
          <option value="abertas">Abertas</option>
          <option value="todas">Todas</option>
        </select>
      </div>
      {error ? <p className="mb-3 text-sm text-[var(--red)]">{error}</p> : null}

      {PENDENCIA_CATEGORIAS.map((categoria) => {
        const items = visible
          .filter((item) => item.categoria === categoria.key)
          .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
        return (
          <section key={categoria.key} className={`mb-5 rounded-2xl p-3 ${BOX[categoria.key]}`}>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="m-0 text-[15px] font-bold">{categoria.label}</h2>
              <button
                type="button"
                onClick={() => add(categoria.key)}
                className="rounded-md bg-white/70 px-2 py-1 text-[12px] font-semibold text-[var(--text)] hover:bg-white"
              >
                + Atividade
              </button>
            </div>
            <div className="overflow-hidden rounded-xl bg-white/75">
              {items.length === 0 ? (
                <p className="m-0 px-3 py-2 text-[12px] text-[var(--muted)]">Nenhuma atividade.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 border-b border-black/5 px-2 py-1 last:border-b-0">
                    <PriorityPill value={item.priority} onChange={(priority) => patch(item.id, { priority })} />
                    {isLate(item) ? (
                      <span className="shrink-0 rounded-full bg-[rgba(209,49,76,0.12)] px-1.5 py-px text-[10px] font-bold uppercase text-[var(--red)]">
                        Atrasada
                      </span>
                    ) : null}
                    <input
                      value={item.text}
                      onChange={(e) => patch(item.id, { text: e.target.value })}
                      placeholder="Nome da atividade"
                      className="h-7 min-w-0 flex-1 bg-transparent text-[13px] outline-none"
                    />
                    <select
                      value={item.status}
                      onChange={(e) => patch(item.id, { status: e.target.value as PendenciaStatus })}
                      className={`h-7 w-[108px] shrink-0 rounded-md border px-1 text-[11px] font-semibold outline-none ${STATUS_TONE[item.status]}`}
                    >
                      {PENDENCIA_STATUS.map((status) => (
                        <option key={status.key} value={status.key} className={STATUS_TONE[status.key]}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={item.due}
                      onChange={(e) => patch(item.id, { due: e.target.value })}
                      className="h-7 w-[132px] shrink-0 rounded-md border border-black/10 bg-white px-1 text-[11px] outline-none"
                    />
                    {item.doneAt ? <span className="shrink-0 text-[10px] font-semibold text-[#1d6b45]">{item.doneAt}</span> : null}
                    <button
                      type="button"
                      aria-label="Excluir atividade"
                      onClick={() => remove(item.id)}
                      className="shrink-0 px-1 text-[14px] leading-none text-[var(--muted)] hover:text-[var(--red)]"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function PriorityPill({ value, onChange }: { value: PriorityLevel; onChange: (value: PriorityLevel) => void }) {
  const next: Record<PriorityLevel, PriorityLevel> = { alta: "media", media: "baixa", baixa: "alta" };
  const label = value === "alta" ? "Alta Prioridade" : value === "baixa" ? "Baixa Prioridade" : "Média Prioridade";
  const tone =
    value === "alta"
      ? "bg-[#f8d0d6] text-[#c4233c]"
      : value === "baixa"
        ? "bg-[#d4f0e0] text-[#1a7a4c]"
        : "bg-[#f8e7b0] text-[#8a6a10]";
  return (
    <button
      type="button"
      onClick={() => onChange(next[value])}
      className={`shrink-0 whitespace-nowrap rounded-full px-1.5 py-px text-[9px] font-bold ${tone}`}
    >
      {label}
    </button>
  );
}

function isLate(item: Pendencia) {
  if (!item.due || item.status === "done" || item.status === "cancelled") return false;
  const due = new Date(`${item.due}T23:59:59`);
  return due.getTime() < Date.now();
}

function today() {
  return new Date().toLocaleDateString("pt-BR");
}
