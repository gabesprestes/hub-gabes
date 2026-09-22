"use client";

import { useCollection } from "@/hooks/use-collection";
import { uid } from "@/lib/schema";

const TONES = [
  "bg-[rgba(243,232,251,0.92)]",
  "bg-[rgba(255,255,255,0.96)]",
  "bg-[rgba(255,244,204,0.92)]",
  "bg-[rgba(214,242,224,0.92)]",
  "bg-[rgba(214,232,252,0.92)]",
  "bg-[rgba(255,228,204,0.92)]",
  "bg-[rgba(252,214,218,0.92)]",
  "bg-[rgba(252,220,232,0.92)]",
];

export default function NotasPage() {
  const { data, save, error } = useCollection("notas");

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--purple)]">Notas</p>
          <h1 className="m-0 text-[28px] font-bold tracking-tight">Anotações</h1>
        </div>
        <button
          type="button"
          onClick={() => void save([...data, { id: uid(), title: "", text: "", color: data.length % TONES.length }])}
          className="rounded-lg bg-[var(--purple)] px-3.5 py-2 text-[13px] font-semibold text-white"
        >
          + Nova nota
        </button>
      </div>
      {error ? <p className="mb-3 text-sm text-[var(--red)]">{error}</p> : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {data.map((note) => (
          <article key={note.id} className={`min-h-36 rounded-xl border border-black/10 p-3 ${TONES[note.color % TONES.length]}`}>
            <input
              value={note.title}
              onChange={(e) => void save(data.map((item) => (item.id === note.id ? { ...item, title: e.target.value } : item)))}
              placeholder="Título"
              className="mb-1 w-full bg-transparent text-[13px] font-bold outline-none"
            />
            <textarea
              value={note.text}
              onChange={(e) => void save(data.map((item) => (item.id === note.id ? { ...item, text: e.target.value } : item)))}
              placeholder="Escreva aqui"
              className="min-h-20 w-full resize-none bg-transparent text-[12px] outline-none"
            />
            <button
              type="button"
              className="text-[11px] text-[var(--red)]"
              onClick={() => void save(data.filter((item) => item.id !== note.id))}
            >
              Excluir
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
