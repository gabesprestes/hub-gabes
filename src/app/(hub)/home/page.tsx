"use client";

import { useEffect, useState } from "react";
import type { Reminder } from "@/lib/types";
import { useCollection } from "@/hooks/use-collection";
import {
  formatHours,
  hoursByCategory,
  parseIcs,
  toWeekEmbed,
  weekRange,
  type HourCategory,
} from "@/lib/calendar";
import { uid } from "@/lib/schema";
import { Field, GhostButton, PrimaryButton, inputClass } from "@/components/ui";

const CARDS: { key: HourCategory; label: string; hint: string }[] = [
  { key: "oneOnOne", label: "1:1", hint: "Começa com 1:1 ou cita um analista" },
  { key: "projetos", label: "Projetos", hint: "Rituais recorrentes, cor Grafite" },
  { key: "focus", label: "Focus time", hint: "Cor padrão, focus e pendências" },
];

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
    if (!data.icalUrl) {
      setHours(null);
      setHoursError(null);
      return;
    }
    let cancelled = false;
    setHoursLoading(true);
    setHoursError(null);
    fetch(data.icalUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error("Não foi possível ler a agenda.");
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const result = hoursByCategory(parseIcs(text));
        setHours(result.totals);
        setColorsFound(result.colorsFound);
      })
      .catch(() => {
        if (cancelled) return;
        setHours(null);
        setHoursError(
          "O Google não deixa esta página somar os horários direto. A agenda da semana acima continua ao vivo.",
        );
      })
      .finally(() => {
        if (!cancelled) setHoursLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [data.icalUrl]);

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
            <li>Para o saldo de horas, copie também o endereço secreto no formato iCal.</li>
          </ol>
          <Field label="Código de incorporação">
            <textarea
              className={inputClass + " min-h-20"}
              value={embedInput}
              onChange={(e) => setEmbedInput(e.target.value)}
              placeholder='<iframe src="https://calendar.google.com/calendar/embed?src=..."></iframe>'
            />
          </Field>
          <Field label="Endereço secreto iCal (saldo de horas)">
            <input
              className={inputClass}
              value={icalInput}
              onChange={(e) => setIcalInput(e.target.value)}
              placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
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

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
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
          <div key={card.key} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
            <div className="text-[13px] font-semibold text-[var(--muted)]">{card.label}</div>
            <div className="mt-2 font-mono text-[32px] font-bold tabular-nums tracking-tight text-[var(--text)]">
              {hoursLoading ? "…" : formatHours(hours?.[card.key] ?? 0)}
            </div>
            <div className="mt-1 text-[12px] text-[var(--muted)]">{card.hint}</div>
          </div>
        ))}
      </div>

      {hoursError ? <p className="mt-3 text-[13px] text-[var(--muted)]">{hoursError}</p> : null}
      {hours && !colorsFound ? (
        <p className="mt-3 text-[13px] text-[var(--muted)]">
          1:1, projetos e focus time entram pelo título do evento. A cor Grafite e a cor padrão só somam quando o arquivo da agenda informar a cor.
        </p>
      ) : null}
      {!data.icalUrl && embed ? (
        <p className="mt-3 text-[13px] text-[var(--muted)]">
          Cole o endereço secreto iCal em Conectar para somar 1:1, Projetos e Focus time.
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

  function add() {
    onSave([...reminders, { id: uid(), text: "", updatedAt: "" }]);
  }

  function remove(id: string) {
    onSave(reminders.filter((item) => item.id !== id));
  }

  return (
    <aside>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="m-0 text-[13px] font-bold text-[var(--muted)]">Lembretes</h2>
        <button
          type="button"
          onClick={add}
          aria-label="Novo lembrete"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(138,5,190,0.35)] bg-white text-[16px] leading-none text-[var(--purple)] hover:bg-[var(--purple-tint)]"
        >
          +
        </button>
      </div>
      <div className="grid gap-2">
        {reminders.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-[rgba(138,5,190,0.18)] bg-[rgba(243,232,251,0.85)] p-2.5">
            <textarea
              value={drafts[index] ?? ""}
              onChange={(e) => {
                const next = [...drafts];
                next[index] = e.target.value;
                setDrafts(next);
              }}
              onBlur={() => {
                if ((drafts[index] ?? "") === item.text) return;
                onSave(
                  reminders.map((note, noteIndex) =>
                    noteIndex === index
                      ? { ...note, text: drafts[index] ?? "", updatedAt: new Date().toISOString() }
                      : note,
                  ),
                );
              }}
              placeholder="Lembrete"
              className="min-h-16 w-full resize-none bg-transparent text-[13px] outline-none"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-[var(--muted)]">
                {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("pt-BR") : ""}
              </span>
              <button type="button" onClick={() => remove(item.id)} className="text-[11px] text-[var(--muted)] hover:text-[var(--red)]">
                Apagar
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
