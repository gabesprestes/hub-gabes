"use client";

import { useState } from "react";
import { useCollection } from "@/hooks/use-collection";
import { uid } from "@/lib/schema";
import {
  BOARD_COLUMNS,
  FREQUENCIAS,
  MONTHS,
  PROJECT_CATEGORIES,
  emptyChecks,
  type BoardCard,
  type BoardColumn,
  type Entrega,
  type ProjectCategory,
} from "@/lib/types";
import { Empty, Field, GhostButton, Modal, PrimaryButton, inputClass } from "@/components/ui";

const COLUMN_STYLE: Record<BoardColumn, { header: string; body: string }> = {
  backlog: { header: "bg-[#d5d5db] text-[#3c3c44]", body: "bg-[#ececef]" },
  andamento: { header: "bg-[#c5ddf6] text-[#1d4f86]", body: "bg-[#e7f2fc]" },
  pausado: { header: "bg-[#f3dc9a] text-[#7a5b10]", body: "bg-[#fff4d4]" },
  concluido: { header: "bg-[#b7e4c9] text-[#1d6b45]", body: "bg-[#e5f6ee]" },
};

const blankForm = () => ({
  title: "",
  detail: "",
  category: "quality" as ProjectCategory,
  deadline: "",
  startedAt: isoToday(),
});

export default function ProjetosPage() {
  const board = useCollection("board");
  const entregas = useCollection("entregas");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [dragging, setDragging] = useState<string | null>(null);

  async function addCard() {
    const title = form.title.trim();
    if (!title) return;
    await board.save([
      ...board.data,
      {
        id: uid(),
        title,
        detail: form.detail.trim(),
        category: form.category,
        deadline: form.deadline,
        startedAt: form.startedAt || isoToday(),
        column: "backlog",
        doneAt: "",
      },
    ]);
    setForm(blankForm());
    setOpen(false);
  }

  async function move(id: string, column: BoardColumn) {
    await board.save(
      board.data.map((card) => {
        if (card.id !== id) return card;
        return { ...card, column, doneAt: column === "concluido" ? card.doneAt || todayLabel() : "" };
      }),
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--purple)]">Board</p>
          <h1 className="m-0 text-[28px] font-bold tracking-tight">Projetos</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Arraste os cards entre as colunas. Em Concluído, a data fica gravada no card.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(blankForm());
            setOpen(true);
          }}
          className="rounded-lg border border-[var(--purple)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--purple)] hover:bg-[var(--purple-tint)]"
        >
          + Novo projeto
        </button>
      </div>

      {board.error ? <p className="mb-3 text-sm text-[var(--red)]">{board.error}</p> : null}

      <div className="grid gap-3 xl:grid-cols-4">
        {BOARD_COLUMNS.map((column) => {
          const cards = board.data.filter((card) => card.column === column.key);
          const style = COLUMN_STYLE[column.key];
          return (
            <section
              key={column.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragging) void move(dragging, column.key);
                setDragging(null);
              }}
              className={`flex min-h-[540px] flex-col rounded-2xl p-2 ${style.body}`}
            >
              <div className={`mb-2 flex items-center justify-between rounded-lg px-3 py-2 text-[12px] font-bold uppercase tracking-wide ${style.header}`}>
                <span>{column.label}</span>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px]">{cards.length}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {cards.map((card) => (
                  <article
                    key={card.id}
                    draggable
                    onDragStart={() => setDragging(card.id)}
                    className="cursor-grab rounded-xl border border-white/80 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <input
                        value={card.title}
                        onChange={(e) => void updateCard(board.data, card.id, { title: e.target.value }, board.save)}
                        className="w-full bg-transparent text-[13px] font-semibold outline-none"
                      />
                      <button
                        type="button"
                        aria-label="Excluir projeto"
                        className="text-[14px] leading-none text-[var(--muted)] hover:text-[var(--red)]"
                        onClick={() => void board.save(board.data.filter((item) => item.id !== card.id))}
                      >
                        ×
                      </button>
                    </div>
                    <input
                      value={card.detail}
                      onChange={(e) => void updateCard(board.data, card.id, { detail: e.target.value }, board.save)}
                      placeholder="Descrição"
                      className="mt-1 w-full bg-transparent text-[11px] text-[var(--muted)] outline-none"
                    />
                    <p className="mt-2 text-[11px] text-[var(--muted)]">
                      {categoryLabel(card.category)}
                      {card.startedAt ? ` · Início ${formatDate(card.startedAt)}` : ""}
                      {card.deadline ? ` · Prazo ${formatDate(card.deadline)}` : ""}
                    </p>
                    {card.doneAt ? <p className="mt-1 text-[11px] font-semibold text-[#1d6b45]">Concluído em {card.doneAt}</p> : null}
                  </article>
                ))}
                {cards.length === 0 ? <Empty>Solte um card aqui.</Empty> : null}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-16">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="m-0 text-[18px] font-bold">Entregas recorrentes</h2>
          <button
            type="button"
            onClick={() =>
              void entregas.save([
                ...entregas.data,
                { id: uid(), description: "", frequencia: "", checks: emptyChecks() },
              ])
            }
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--purple)] hover:bg-[var(--purple-tint)]"
          >
            + Item
          </button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
          <table className="w-full min-w-[920px] border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--purple-tint)] text-left">
                <th className="px-3 py-2 font-semibold">Item</th>
                <th className="px-3 py-2 font-semibold">Frequência</th>
                {MONTHS.map((month) => (
                  <th key={month.key} className="px-2 py-2 text-center font-semibold">{month.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entregas.data.map((item) => (
                <tr key={item.id} className="border-t border-[var(--border)]">
                  <td className="px-2 py-0.5">
                    <input
                      value={item.description}
                      onChange={(e) => void patchEntrega(entregas.data, item.id, { description: e.target.value }, entregas.save)}
                      placeholder="Entrega"
                      className="h-8 w-full bg-transparent px-1 text-[13px] outline-none"
                    />
                  </td>
                  <td className="px-2 py-0.5">
                    <FrequencySelect
                      value={item.frequencia}
                      onChange={(frequencia) => void patchEntrega(entregas.data, item.id, { frequencia }, entregas.save)}
                    />
                  </td>
                  {MONTHS.map((month) => (
                    <td key={month.key} className="text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(item.checks[month.key])}
                        onChange={(e) =>
                          void patchEntrega(
                            entregas.data,
                            item.id,
                            { checks: { ...item.checks, [month.key]: e.target.checked } },
                            entregas.save,
                          )
                        }
                        className="accent-[var(--purple)]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} title="Novo projeto" onClose={() => setOpen(false)}>
        <Field label="Nome do projeto">
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
        </Field>
        <Field label="Descrição">
          <textarea className={inputClass + " min-h-20"} value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} />
        </Field>
        <Field label="Categoria">
          <select
            className={inputClass}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ProjectCategory })}
          >
            {PROJECT_CATEGORIES.map((item) => (
              <option key={item.key} value={item.key}>{item.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Deadline">
          <input type="date" className={inputClass} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </Field>
        <Field label="Data de início">
          <input type="date" className={inputClass} value={form.startedAt} onChange={(e) => setForm({ ...form, startedAt: e.target.value })} />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <GhostButton onClick={() => setOpen(false)}>Cancelar</GhostButton>
          <PrimaryButton onClick={() => void addCard()}>Criar</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}

function FrequencySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const known = FREQUENCIAS.some((item) => item.label === value);
  const color = FREQUENCIAS.find((item) => item.label === value)?.color ?? "#6e6d7a";
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-32 rounded-md border border-[var(--border)] bg-white px-2 text-[12px] font-semibold outline-none"
      style={{ color }}
    >
      <option value="">Frequência</option>
      {!known && value ? <option value={value}>{value}</option> : null}
      {FREQUENCIAS.map((item) => (
        <option key={item.key} value={item.label} style={{ color: item.color }}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

function categoryLabel(key: ProjectCategory) {
  return PROJECT_CATEGORIES.find((item) => item.key === key)?.label ?? key;
}

function isoToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function todayLabel() {
  return new Date().toLocaleDateString("pt-BR");
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!day || !month || !year) return iso;
  return `${day}/${month}/${year}`;
}

function updateCard(
  cards: BoardCard[],
  id: string,
  patch: Partial<BoardCard>,
  save: (next: BoardCard[]) => Promise<void>,
) {
  return save(cards.map((card) => (card.id === id ? { ...card, ...patch } : card)));
}

function patchEntrega(
  items: Entrega[],
  id: string,
  patch: Partial<Entrega>,
  save: (next: Entrega[]) => Promise<void>,
) {
  return save(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
}
