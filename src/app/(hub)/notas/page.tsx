"use client";

import { useEffect, useState } from "react";
import { useCollection } from "@/hooks/use-collection";
import { uid } from "@/lib/schema";
import type { Nota } from "@/lib/types";

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
          onClick={() => void save((notes) => [...notes, { id: uid(), title: "", text: "", color: notes.length % TONES.length }])}
          className="rounded-lg bg-[var(--purple)] px-3.5 py-2 text-[13px] font-semibold text-white"
        >
          + Nova nota
        </button>
      </div>
      {error ? <p className="mb-3 text-sm text-[var(--red)]">{error}</p> : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {data.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            tone={TONES[note.color % TONES.length]}
            onCommit={(title, text) =>
              void save((notes) => notes.map((item) => (item.id === note.id ? { ...item, title, text } : item)))
            }
            onRemove={() => void save((notes) => notes.filter((item) => item.id !== note.id))}
          />
        ))}
      </div>
    </div>
  );
}

function NoteCard({
  note,
  tone,
  onCommit,
  onRemove,
}: {
  note: Nota;
  tone: string;
  onCommit: (title: string, text: string) => void;
  onRemove: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);

  useEffect(() => {
    setTitle(note.title);
    setText(note.text);
  }, [note.title, note.text]);

  function commit() {
    if (title === note.title && text === note.text) return;
    onCommit(title, text);
  }

  return (
    <article className={`min-h-36 rounded-xl border border-black/10 p-3 ${tone}`}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commit}
        placeholder="Título"
        className="mb-1 w-full bg-transparent text-[13px] font-bold outline-none"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        placeholder="Escreva aqui"
        className="min-h-20 w-full resize-none bg-transparent text-[12px] outline-none"
      />
      <button type="button" className="text-[11px] text-[var(--red)]" onClick={onRemove}>
        Excluir
      </button>
    </article>
  );
}
