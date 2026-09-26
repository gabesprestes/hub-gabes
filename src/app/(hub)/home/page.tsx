"use client";

import { useEffect, useState } from "react";
import type { Reminder } from "@/lib/types";
import { useCollection } from "@/hooks/use-collection";
import { toWeekEmbed } from "@/lib/calendar";
import { uid } from "@/lib/schema";
import { Field, GhostButton, PrimaryButton, inputClass } from "@/components/ui";

const PER_COLUMN = 5;
const NEWS_URL = "https://raw.githubusercontent.com/gabesprestes/hub-gabes/master/public/news.json";

type Headline = { title: string; link: string; image?: string; theme?: string };

export default function AgendaHomePage() {
  const { data, save, loading, saving, error } = useCollection("agenda");
  const [embedInput, setEmbedInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  const embed = toWeekEmbed(data.embedUrl);

  useEffect(() => {
    if (loading) return;
    setEmbedInput(data.embedUrl);
    setShowSetup(!data.embedUrl);
  }, [loading, data.embedUrl]);

  async function onSave() {
    const nextEmbed = toWeekEmbed(embedInput);
    if (embedInput.trim() && !nextEmbed) {
      setFormError("Esse link da visão Semana não pode entrar na página. Cole o código de incorporação da agenda.");
      return;
    }
    setFormError(null);
    await save((current) => ({ ...current, embedUrl: nextEmbed ?? "" }));
    setShowSetup(false);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--purple)]">Visão geral</p>
          <h1 className="m-0 text-[28px] font-bold tracking-tight">Home</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Agenda da semana, ao vivo, e manchetes do G1.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--purple)] px-3 py-1.5 text-[12px] font-semibold text-white">Semana</span>
          <a
            href="https://calendar.google.com/calendar/u/0/r/week"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--text)] hover:border-[var(--purple-light)]"
          >
            Abrir no Google
          </a>
          <button
            type="button"
            onClick={() => setShowSetup((v) => !v)}
            className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--muted)] hover:border-[var(--purple-light)]"
          >
            {showSetup ? "Fechar" : "Conectar"}
          </button>
        </div>
      </div>

      {error ? <p className="mb-3 text-sm text-[var(--red)]">{error}</p> : null}

      {showSetup ? (
        <div className="mb-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <h2 className="m-0 text-[15px] font-bold">Conectar sua agenda</h2>
          <ol className="mb-4 mt-2 list-decimal space-y-1 pl-4 text-[13px] text-[var(--muted)]">
            <li>No Google Calendar, abra a engrenagem e depois Configurações.</li>
            <li>Clique na sua agenda, à esquerda, e abra Integrar agenda.</li>
            <li>Copie o código de incorporação e cole abaixo. A página mostra a semana.</li>
          </ol>
          <Field label="Código de incorporação">
            <textarea
              className={inputClass + " min-h-20"}
              value={embedInput}
              onChange={(e) => setEmbedInput(e.target.value)}
              placeholder='<iframe src="https://calendar.google.com/calendar/embed?src=..."></iframe>'
            />
          </Field>
          {formError ? <p className="mb-3 text-[13px] text-[var(--red)]">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <GhostButton onClick={() => setShowSetup(false)}>Cancelar</GhostButton>
            <PrimaryButton onClick={() => void onSave()} disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </PrimaryButton>
          </div>
        </div>
      ) : null}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_auto]">
      <div>
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        {embed ? (
          <iframe
            title="Agenda da semana"
            src={embed}
            className="h-[640px] w-full border-0"
          />
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="m-0 text-[15px] font-semibold">A agenda ainda não está conectada</p>
            <p className="mx-auto mt-2 max-w-md text-[13px] text-[var(--muted)]">
              O link da visão Semana abre só no Google. Aqui entra o código de incorporação, já em semana.
            </p>
            <div className="mt-4">
              <PrimaryButton onClick={() => setShowSetup(true)}>Conectar agenda</PrimaryButton>
            </div>
          </div>
        )}
      </div>
      <G1News />
      </div>
      <ReminderColumn
        reminders={data.reminders ?? []}
        onSave={(reminders) => void save((current) => ({ ...current, reminders }))}
      />
      </div>
    </div>
  );
}

function G1News() {
  const [items, setItems] = useState<Headline[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadHeadlines().then((headlines) => {
      if (cancelled) return;
      if (!headlines) setFailed(true);
      else setItems(headlines);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-[15px] font-bold">G1 hoje</h2>
        <a
          href="https://g1.globo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-medium text-[var(--purple)]"
        >
          Abrir o G1
        </a>
      </div>
      {items ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="overflow-hidden rounded-2xl border border-[#e4c8f5] bg-white hover:border-[var(--purple-light)]"
            >
              {item.image ? (
                <img src={item.image} alt="" className="h-28 w-full object-cover" />
              ) : (
                <div className="h-28 bg-[#f3e8fb]" />
              )}
              <div className="px-4 py-3">
                <div className="text-[12px] font-medium text-[#b06ad4]">{item.theme || themeFromLink(item.link)}</div>
                <div className="mt-1 line-clamp-3 text-[14px] font-medium leading-snug">{item.title}</div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="m-0 text-[13px] text-[var(--muted)]">
          {failed ? "As manchetes do G1 não carregaram agora." : "Carregando manchetes…"}
        </p>
      )}
    </section>
  );
}

function safeImage(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("https://")) return "";
  try {
    const host = new URL(value).hostname;
    if (host.endsWith("glbimg.com") || host.endsWith("globo.com")) return value;
  } catch {
    return "";
  }
  return "";
}

function themeFromLink(link: string) {
  if (link.includes("/politica/")) return "Política";
  if (link.includes("/economia/")) return "Economia";
  if (link.includes("/mundo/")) return "Mundo";
  return "G1";
}

async function loadHeadlines(): Promise<Headline[] | null> {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  for (const url of [`${NEWS_URL}?t=${Date.now()}`, `${base}/news.json?t=${Date.now()}`]) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const json = (await response.json()) as { items?: Headline[] };
      const items = (json.items ?? []).flatMap((item) => {
        if (!item || typeof item.title !== "string" || !item.title) return [];
        if (typeof item.link !== "string" || !item.link.startsWith("https://g1.globo.com/")) return [];
        const image = safeImage(item.image);
        const theme = typeof item.theme === "string" ? item.theme : "";
        return [{ title: item.title, link: item.link, image, theme }];
      });
      if (items.length > 0) return items.slice(0, 4);
    } catch {
      // The next address may still have the headlines.
    }
  }
  return null;
}

function ReminderColumn({
  reminders,
  onSave,
}: {
  reminders: Reminder[];
  onSave: (reminders: Reminder[]) => void;
}) {
  const [drafts, setDrafts] = useState(reminders.map((item) => item.text));

  useEffect(() => {
    setDrafts(reminders.map((item) => item.text));
  }, [reminders]);

  function withDrafts(list: Reminder[]) {
    return list.map((item) => {
      const index = reminders.findIndex((note) => note.id === item.id);
      if (index < 0) return item;
      const text = drafts[index] ?? item.text;
      if (text === item.text) return item;
      return { ...item, text, updatedAt: new Date().toISOString() };
    });
  }

  function add() {
    if (reminders.length >= PER_COLUMN * 2) return;
    onSave([...withDrafts(reminders), { id: uid(), text: "", updatedAt: "" }]);
  }

  function remove(id: string) {
    onSave(withDrafts(reminders).filter((item) => item.id !== id));
  }

  const columns = [reminders.slice(0, PER_COLUMN), reminders.slice(PER_COLUMN, PER_COLUMN * 2)];

  return (
    <aside className="flex items-start gap-3">
      <div className="w-[210px]">
        <h2 className="mb-2 text-[13px] font-bold text-[var(--muted)]">Lembretes</h2>
        <div className="grid gap-2">
          {columns[0].map((item, index) => (
            <ReminderNote
              key={item.id}
              item={item}
              draft={drafts[index] ?? ""}
              onDraft={(text) => {
                const next = [...drafts];
                next[index] = text;
                setDrafts(next);
              }}
              onBlur={() => {
                if ((drafts[index] ?? "") === item.text) return;
                onSave(withDrafts(reminders));
              }}
              onRemove={() => remove(item.id)}
            />
          ))}
        </div>
      </div>
      <div className="w-[210px]">
        <div className="mb-2 flex justify-end">
          {reminders.length < PER_COLUMN * 2 ? (
            <button
              type="button"
              onClick={add}
              aria-label="Adicionar lembrete"
              title="Adicionar até mais 5 lembretes"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(138,5,190,0.35)] bg-white text-[16px] leading-none text-[var(--purple)] hover:bg-[var(--purple-tint)]"
            >
              +
            </button>
          ) : (
            <span className="h-7" />
          )}
        </div>
        <div className="grid gap-2">
          {columns[1].map((item, index) => {
            const realIndex = index + PER_COLUMN;
            return (
              <ReminderNote
                key={item.id}
                item={item}
                draft={drafts[realIndex] ?? ""}
                onDraft={(text) => {
                  const next = [...drafts];
                  next[realIndex] = text;
                  setDrafts(next);
                }}
                onBlur={() => {
                  if ((drafts[realIndex] ?? "") === item.text) return;
                  onSave(withDrafts(reminders));
                }}
                onRemove={() => remove(item.id)}
              />
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function ReminderNote({
  item,
  draft,
  onDraft,
  onBlur,
  onRemove,
}: {
  item: Reminder;
  draft: string;
  onDraft: (text: string) => void;
  onBlur: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-[rgba(138,5,190,0.18)] bg-[rgba(243,232,251,0.85)] p-2.5">
      <textarea
        value={draft}
        onChange={(e) => onDraft(e.target.value)}
        onBlur={onBlur}
        placeholder="Lembrete"
        className="min-h-16 w-full resize-none bg-transparent text-[13px] outline-none"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-[var(--muted)]">
          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("pt-BR") : ""}
        </span>
        <button type="button" onClick={onRemove} aria-label="Apagar lembrete" className="px-0.5 text-[14px] leading-none text-[var(--muted)] hover:text-[var(--red)]">
          ×
        </button>
      </div>
    </div>
  );
}
