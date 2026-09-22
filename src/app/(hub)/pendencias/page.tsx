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
import { Empty, PrimaryButton, inputClass } from "@/components/ui";

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
        const items = visible.filter((item) => item.categoria === categoria.key);
        return (
          <section key={categoria.key} className="mb-6 rounded-2xl border border-[var(--border)] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="m-0 text-[16px] font-bold">{categoria.label}</h2>
              <PrimaryButton onClick={() => add(categoria.key)}>+ Nova pendência</PrimaryButton>
            </div>
            {items.length === 0 ? (
              <Empty>Nenhuma pendência em {categoria.label}.</Empty>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((item) => (
                  <article key={item.id} className={`rounded-xl border px-3 py-3 ${isLate(item) ? "border-[var(--red)]" : "border-[var(--border)]"}`}>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <PriorityPill value={item.priority} onChange={(priority) => patch(item.id, { priority })} />
                      {isLate(item) ? <span className="rounded-full bg-[rgba(209,49,76,0.12)] px-2 py-0.5 text-[10px] font-bold text-[var(--red)]">ATRASADA</span> : null}
                      {isLate(item) && item.due ? <span className="text-[12px] text-[var(--muted)]">Venceu em {formatDate(item.due)}</span> : null}
                    </div>
                    <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_140px]">
                      <input
                        value={item.text}
                        onChange={(e) => patch(item.id, { text: e.target.value })}
                        placeholder="Nome da atividade"
                        className="bg-transparent text-[14px] font-semibold outline-none"
                      />
                      <select
                        value={item.status}
                        onChange={(e) => patch(item.id, { status: e.target.value as PendenciaStatus })}
                        className={inputClass}
                      >
                        {PENDENCIA_STATUS.map((status) => (
                          <option key={status.key} value={status.key}>{status.label}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={item.due}
                        onChange={(e) => patch(item.id, { due: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    {item.doneAt ? <p className="mt-2 text-[12px] font-semibold text-[var(--purple)]">Concluído em {item.doneAt}</p> : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function PriorityPill({ value, onChange }: { value: PriorityLevel; onChange: (value: PriorityLevel) => void }) {
  const next: Record<PriorityLevel, PriorityLevel> = { alta: "media", media: "baixa", baixa: "alta" };
  const label = value === "alta" ? "Alta" : value === "baixa" ? "Baixa" : "Média";
  return (
    <button
      type="button"
      onClick={() => onChange(next[value])}
      className="rounded-full bg-[var(--purple-tint)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--purple)]"
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

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!day) return iso;
  return `${day}/${month}/${year}`;
}
