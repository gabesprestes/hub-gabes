"use client";

import { useState } from "react";
import { useCollection } from "@/hooks/use-collection";
import { uid } from "@/lib/schema";
import { BOARD_COLUMNS, MONTHS, emptyChecks, type BoardCard, type BoardColumn } from "@/lib/types";
import { Empty, PrimaryButton, inputClass } from "@/components/ui";

const COLUMN_TINT: Record<BoardColumn, string> = {
  backlog: "bg-[rgba(243,232,251,0.45)]",
  andamento: "bg-[rgba(232,210,245,0.72)]",
  pausado: "bg-[rgba(247,242,252,0.95)]",
  concluido: "bg-[rgba(226,210,240,0.4)]",
  destaque: "bg-[rgba(210,170,235,0.28)]",
};

export default function ProjetosPage() {
  const board = useCollection("board");
  const entregas = useCollection("entregas");
  const [title, setTitle] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);

  async function addCard() {
    const text = title.trim();
    if (!text) return;
    await board.save([...board.data, { id: uid(), title: text, detail: "", column: "backlog", doneAt: "" }]);
    setTitle("");
  }

  async function move(id: string, column: BoardColumn) {
    await board.save(
      board.data.map((card) => {
        if (card.id !== id) return card;
        return { ...card, column, doneAt: column === "concluido" ? card.doneAt || today() : "" };
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
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Novo projeto"
            className={inputClass + " w-56"}
          />
          <PrimaryButton onClick={() => void addCard()}>+ Novo projeto</PrimaryButton>
        </div>
      </div>

      {board.error ? <p className="mb-3 text-sm text-[var(--red)]">{board.error}</p> : null}

      <div className="grid gap-3 xl:grid-cols-5">
        {BOARD_COLUMNS.map((column) => {
          const cards = board.data.filter((card) => card.column === column.key);
          return (
            <section
              key={column.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragging) void move(dragging, column.key);
                setDragging(null);
              }}
              className={`min-h-64 rounded-2xl p-2 ${COLUMN_TINT[column.key]}`}
            >
              <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wide text-[var(--purple)]">
                <span>{column.label}</span>
                <span>{cards.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {cards.map((card) => (
                  <article
                    key={card.id}
                    draggable
                    onDragStart={() => setDragging(card.id)}
                    className="cursor-grab rounded-xl border border-[var(--border)] bg-white p-3 shadow-sm"
                  >
                    <input
                      value={card.title}
                      onChange={(e) => void updateCard(board.data, card.id, { title: e.target.value }, board.save)}
                      className="w-full bg-transparent text-[13px] font-semibold outline-none"
                    />
                    <input
                      value={card.detail}
                      onChange={(e) => void updateCard(board.data, card.id, { detail: e.target.value }, board.save)}
                      placeholder="Detalhe"
                      className="mt-1 w-full bg-transparent text-[11px] text-[var(--muted)] outline-none"
                    />
                    {card.doneAt ? <p className="mt-2 text-[11px] font-semibold text-[var(--purple)]">Concluído em {card.doneAt}</p> : null}
                    <button
                      type="button"
                      className="mt-2 text-[11px] text-[var(--red)]"
                      onClick={() => void board.save(board.data.filter((item) => item.id !== card.id))}
                    >
                      Excluir
                    </button>
                  </article>
                ))}
                {cards.length === 0 ? <Empty>Solte um card aqui.</Empty> : null}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="m-0 text-[18px] font-bold">Entregas recorrentes</h2>
          <PrimaryButton
            onClick={() =>
              void entregas.save([
                ...entregas.data,
                { id: uid(), description: "", frequencia: "", checks: emptyChecks() },
              ])
            }
          >
            + Item
          </PrimaryButton>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
          <table className="w-full min-w-[920px] border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--purple-tint)] text-left">
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2">Frequência</th>
                {MONTHS.map((month) => (
                  <th key={month.key} className="px-2 py-2 text-center">{month.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entregas.data.map((item) => (
                <tr key={item.id} className="border-t border-[var(--border)]">
                  <td className="px-2 py-1">
                    <input
                      value={item.description}
                      onChange={(e) => void patchEntrega(entregas.data, item.id, { description: e.target.value }, entregas.save)}
                      className="w-full bg-transparent px-1 py-1 outline-none"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      value={item.frequencia}
                      onChange={(e) => void patchEntrega(entregas.data, item.id, { frequencia: e.target.value }, entregas.save)}
                      className="w-28 bg-transparent px-1 py-1 outline-none"
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
    </div>
  );
}

function today() {
  return new Date().toLocaleDateString("pt-BR");
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
  items: { id: string; description: string; frequencia: string; checks: Record<string, boolean> }[],
  id: string,
  patch: Partial<(typeof items)[number]>,
  save: (next: typeof items) => Promise<void>,
) {
  return save(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
}
