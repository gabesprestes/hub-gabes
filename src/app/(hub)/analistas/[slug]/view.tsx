"use client";

import { useEffect, useRef, useState } from "react";
import { useCollection } from "@/hooks/use-collection";
import { DEEP_DIVE_HTML } from "@/lib/deep-dive";
import { ANALYSTS, emptyAnalyst } from "@/lib/types";
import { LinkMark } from "@/components/link-mark";
import { inputClass } from "@/components/ui";

export function AnalystView({ slug }: { slug: string }) {
  const person = ANALYSTS.find((item) => item.slug === slug);
  const { data, save, error } = useCollection("analistas");
  const note = data[slug] ?? emptyAnalyst();
  const [link, setLink] = useState(note.link);

  useEffect(() => {
    setLink(note.link);
  }, [note.link]);

  if (!person) return <p>Analista não encontrado.</p>;

  function commitLink(value: string) {
    const next = value.trim();
    if (next === note.link) return;
    void save((all) => ({
      ...all,
      [slug]: { ...(all[slug] ?? emptyAnalyst()), link: next },
    }));
  }

  return (
    <div>
      <p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--purple)]">Analistas</p>
      <h1 className="m-0 text-[28px] font-bold tracking-tight">{person.name}</h1>
      {error ? <p className="mt-3 text-sm text-[var(--red)]">{error}</p> : null}

      <div className="mt-5">
        <p className="m-0 text-[12px] font-semibold text-[var(--muted)]">Link do acompanhamento individual</p>
        {note.link ? (
          <a
            href={note.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-[14px] font-medium text-[var(--text)] hover:text-[var(--purple)]"
          >
            <LinkMark url={note.link} label={`Acompanhamento - ${person.name}`} />
            Acompanhamento - {person.name}
          </a>
        ) : (
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onBlur={(e) => commitLink(e.target.value)}
            placeholder="Cole o link da planilha"
            className={inputClass + " mt-1"}
          />
        )}
      </div>

      <h2 className="mb-3 mt-8 text-[18px] font-bold tracking-tight">Deep Dive Slots:</h2>
      <DeepDiveFrame name={person.name} html={DEEP_DIVE_HTML[slug] ?? ""} />
    </div>
  );
}

function DeepDiveFrame({ name, html }: { name: string; html: string }) {
  const frame = useRef<HTMLIFrameElement>(null);

  function fit() {
    const node = frame.current;
    const doc = node?.contentDocument;
    if (!node || !doc) return;
    node.style.height = `${doc.documentElement.scrollHeight}px`;
  }

  if (!html) return null;

  return (
    <iframe
      ref={frame}
      title={`Deep Dive Slots ${name}`}
      srcDoc={html}
      onLoad={() => {
        fit();
        window.setTimeout(fit, 400);
      }}
      className="block w-full border-0"
    />
  );
}
