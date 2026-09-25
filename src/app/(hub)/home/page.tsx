"use client";

import { useEffect, useRef, useState } from "react";
import type { Reminder } from "@/lib/types";
import { useCollection } from "@/hooks/use-collection";
import {
  formatHours,
  hoursByCategory,
  parseIcs,
  toWeekEmbed,
  weekKey,
  weekRange,
  type HourCategory,
} from "@/lib/calendar";
import { uid } from "@/lib/schema";
import { Field, GhostButton, PrimaryButton, inputClass } from "@/components/ui";

const CARDS: { key: HourCategory; label: string; hint: string }[] = [
  { key: "oneOnOne", label: "1:1", hint: "1:1 e reuniões com o time" },
  { key: "projetos", label: "Projetos", hint: "Rituais e follow up" },
  { key: "focus", label: "Focus time", hint: "Focus e pendências" },
];

const HOURS_URL = "https://raw.githubusercontent.com/gabesprestes/hub-gabes/master/public/hours.json";
const PER_COLUMN = 5;

export default function AgendaHomePage() {
  const { data, save, loading, saving, error } = useCollection("agenda");
  const [embedInput, setEmbedInput] = useState("");
  const [icalInput, setIcalInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [hours, setHours] = useState<Record<HourCategory, number> | null>(null);
  const [colorsFound, setColorsFound] = useState(true);
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [hoursLoading, setHoursLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const embed = toWeekEmbed(data.embedUrl);
  const { start, end } = weekRange();
  const weekLabel = `${start.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} – ${new Date(end.getTime() - 1).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;

  useEffect(() => {
    if (loading) return;
    setEmbedInput(data.embedUrl);
    setIcalInput(data.icalUrl);
    setShowSetup(!data.embedUrl);
  }, [loading, data.embedUrl, data.icalUrl]);

  useEffect(() => {
    const saved = data.weekHours;
    if (saved && saved.weekStart === weekKey()) {
      setHours({ oneOnOne: saved.oneOnOne, projetos: saved.projetos, focus: saved.focus });
      setColorsFound(saved.colorsFound);
      setHoursError(null);
      setHoursLoading(false);
      return;
    }
    let cancelled = false;
    setHoursLoading(true);
    setHoursError(null);
    loadWeekHours(data.icalUrl)
      .then((result) => {
        if (cancelled) return;
        setHours(result?.totals ?? null);
        setColorsFound(result?.colorsFound ?? true);
        setHoursError(result ? null : "missing");
      })
      .finally(() => {
        if (!cancelled) setHoursLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [data.icalUrl, data.weekHours]);

  async function onSave() {
    const nextEmbed = toWeekEmbed(embedInput);
    if (embedInput.trim() && !nextEmbed) {
      setFormError("Esse link da visão Semana não pode entrar na página. Cole o código de incorporação da agenda.");
      return;
    }
    const ical = icalInput.trim();
    if (ical && !ical.includes("calendar.google.com/calendar/ical/")) {
      setFormError("O saldo usa o endereço secreto iCal, aquele que termina em basic.ics.");
      return;
    }
    setFormError(null);
    await save({ ...data, embedUrl: nextEmbed ?? "", icalUrl: ical });
    setShowSetup(false);
  }

  async function onAgendaFile(file: File | undefined) {
    if (!file || loading) return;
    const text = await file.text();
    if (!text.includes("BEGIN:VCALENDAR")) {
      setFileError("Esse arquivo não é a agenda. Abra o zip e escolha o arquivo que termina em .ics.");
      return;
    }
    const result = hoursByCategory(parseIcs(text));
    setHours(result.totals);
    setColorsFound(result.colorsFound);
    setHoursError(null);
    setFileError(null);
    await save({
      ...data,
      weekHours: {
        weekStart: weekKey(),
        oneOnOne: result.totals.oneOnOne,
        projetos: result.totals.projetos,
        focus: result.totals.focus,
        colorsFound: result.colorsFound,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--purple)]">Visão geral</p>
          <h1 className="m-0 text-[28px] font-bold tracking-tight">Home</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Agenda da semana, ao vivo, e saldo de horas por categoria.</p>
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

      <div className="mt-4 mb-3 flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-[15px] font-bold">Saldo de horas desta semana</h2>
        <span className="text-[12px] text-[var(--muted)]">{weekLabel}</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CARDS.map((card) => (
          <div key={card.key} className="rounded-2xl border border-[#e4c8f5] bg-white px-4 py-3">
            <div className="text-[12px] font-medium text-[var(--muted)]">{card.label}</div>
            <div className="mt-1 text-[40px] font-light leading-none tracking-tight text-[#b06ad4]">
              {hoursLoading ? "…" : hours ? formatHours(hours[card.key]) : "—"}
            </div>
            <div className="mt-2 text-[11px] text-[var(--muted)]">{card.hint}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-full border border-[#e4c8f5] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--purple)] hover:bg-[var(--purple-tint)]"
        >
          Atualizar saldo com arquivo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".ics,text/calendar"
          className="hidden"
          onChange={(event) => {
            void onAgendaFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      {fileError ? <p className="mt-2 text-[13px] text-[var(--red)]">{fileError}</p> : null}
      {hoursError && !hoursLoading ? (
        <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-[var(--muted)]">
          A Nubank não mostra o endereço secreto. No Google Calendar, abra Configurações, depois Importar e exportar, e clique em Exportar. Abra o zip e escolha aqui o arquivo .ics do seu e-mail.
        </p>
      ) : null}
      {hours && !colorsFound ? (
        <p className="mt-3 text-[13px] text-[var(--muted)]">
          1:1, follow up, rituais e focus time entram pelo título. A cor do evento só soma quando a agenda informa a cor.
        </p>
      ) : null}
      </div>
      <ReminderColumn
        reminders={data.reminders ?? []}
        onSave={(reminders) => void save({ ...data, reminders })}
      />
      </div>
    </div>
  );
}

async function loadWeekHours(icalUrl: string) {
  if (icalUrl) {
    try {
      const res = await fetch(icalUrl);
      if (res.ok) {
        const text = await res.text();
        if (text.includes("BEGIN:VCALENDAR")) {
          const result = hoursByCategory(parseIcs(text));
          return { totals: result.totals, colorsFound: result.colorsFound };
        }
      }
    } catch {
      // The browser cannot read Google Calendar directly.
    }
  }

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  for (const url of [`${HOURS_URL}?t=${Date.now()}`, `${base}/hours.json?t=${Date.now()}`]) {
    const saved = await readSavedHours(url);
    if (saved) return saved;
  }
  return null;
}

async function readSavedHours(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      weekStart?: string;
      oneOnOne?: number;
      projetos?: number;
      focus?: number;
      colorsFound?: boolean;
      updatedAt?: string;
    };
    if (!json.updatedAt || json.weekStart !== weekKey()) return null;
    return {
      totals: {
        oneOnOne: Number(json.oneOnOne) || 0,
        projetos: Number(json.projetos) || 0,
        focus: Number(json.focus) || 0,
      },
      colorsFound: json.colorsFound !== false,
    };
  } catch {
    return null;
  }
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
        <button type="button" onClick={onRemove} className="text-[11px] text-[var(--muted)] hover:text-[var(--red)]">
          Apagar
        </button>
      </div>
    </div>
  );
}
