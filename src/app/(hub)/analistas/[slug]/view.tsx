"use client";

import { useEffect, useState } from "react";
import { useCollection } from "@/hooks/use-collection";
import { draftFeedback } from "@/lib/feedback";
import { ANALYSTS, emptyAnalyst } from "@/lib/types";
import { inputClass } from "@/components/ui";

export function AnalystView({ slug }: { slug: string }) {
  const person = ANALYSTS.find((item) => item.slug === slug);
  const { data, save, error } = useCollection("analistas");
  const note = data[slug] ?? emptyAnalyst();
  const [link, setLink] = useState(note.link);
  const [notes, setNotes] = useState(note.notes);
  const [mentions, setMentions] = useState(note.mentions);
  const [feedback, setFeedback] = useState(note.feedback);

  useEffect(() => {
    setLink(note.link);
    setNotes(note.notes);
    setMentions(note.mentions);
    setFeedback(note.feedback);
  }, [note.link, note.notes, note.mentions, note.feedback]);

  if (!person) return <p>Analista não encontrado.</p>;

  function patch(partial: Partial<typeof note>) {
    void save((all) => ({ ...all, [slug]: { ...(all[slug] ?? emptyAnalyst()), ...partial } }));
  }

  function commit(partial: Partial<typeof note>) {
    const current = { link, notes, mentions, feedback, ...partial };
    if (
      current.link === note.link &&
      current.notes === note.notes &&
      current.mentions === note.mentions &&
      current.feedback === note.feedback
    ) {
      return;
    }
    patch(current);
  }

  return (
    <div>
      <p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--purple)]">Analistas</p>
      <h1 className="m-0 text-[28px] font-bold tracking-tight">{person.name}</h1>
      <p className="mt-1 text-[13px] text-[var(--muted)]">Acompanhamento, anotações e rascunho de feedback.</p>
      {error ? <p className="mt-3 text-sm text-[var(--red)]">{error}</p> : null}

      <label className="mt-5 block text-[12px] font-semibold text-[var(--muted)]">
        Link do acompanhamento individual
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onBlur={() => commit({ link })}
          placeholder="https://..."
          className={inputClass + " mt-1"}
        />
      </label>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[13px] font-semibold text-[var(--purple)]">
          Abrir acompanhamento
        </a>
      ) : null}

      <label className="mt-5 block text-[12px] font-semibold text-[var(--muted)]">
        Anotações sobre {person.name}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => commit({ notes })}
          className={inputClass + " mt-1 min-h-28"}
        />
      </label>

      <label className="mt-5 block text-[12px] font-semibold text-[var(--muted)]">
        Menções e trechos de conversa
        <textarea
          value={mentions}
          onChange={(e) => setMentions(e.target.value)}
          onBlur={() => commit({ mentions })}
          placeholder="Cole aqui falas, 1:1 e observações. Uma por linha."
          className={inputClass + " mt-1 min-h-28"}
        />
      </label>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            const next = draftFeedback(person.name, notes, mentions);
            setFeedback(next);
            patch({ link, notes, mentions, feedback: next });
          }}
          className="rounded-lg bg-[var(--purple)] px-3.5 py-2 text-[13px] font-semibold text-white"
        >
          Gerar rascunho de feedback
        </button>
      </div>

      <label className="mt-4 block text-[12px] font-semibold text-[var(--muted)]">
        Feedback
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          onBlur={() => commit({ feedback })}
          className={inputClass + " mt-1 min-h-40"}
        />
      </label>
      <p className="mt-2 text-[12px] text-[var(--muted)]">
        O rascunho usa só o que está nesta guia. Transcrições de reunião não entram sozinhas.
      </p>
    </div>
  );
}
