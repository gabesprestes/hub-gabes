"use client";

import { useState } from "react";
import { useCollection } from "@/hooks/use-collection";
import { uid } from "@/lib/schema";
import type { Prioridade, PriorityLevel } from "@/lib/types";
import {
  Card,
  Empty,
  Field,
  GhostButton,
  Modal,
  PageHeader,
  PrimaryButton,
  Tag,
  inputClass,
} from "@/components/ui";

export default function PrioridadesPage() {
  const { data, save, loading, saving, error } = useCollection("prioridades");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Prioridade | null>(null);
  const [text, setText] = useState("");
  const [level, setLevel] = useState<PriorityLevel>("alta");

  function openNew() {
    setEditing(null);
    setText("");
    setLevel("alta");
    setOpen(true);
  }

  function openEdit(item: Prioridade) {
    setEditing(item);
    setText(item.text);
    setLevel(item.level);
    setOpen(true);
  }

  async function onSave() {
    const t = text.trim();
    if (!t) return;
    if (editing) {
      await save(data.map((x) => (x.id === editing.id ? { ...x, text: t, level } : x)));
    } else {
      await save([...data, { id: uid(), text: t, level, done: false }]);
    }
    setOpen(false);
  }

  async function toggle(id: string) {
    await save(data.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta prioridade?")) return;
    await save(data.filter((x) => x.id !== id));
  }

  const done = data.filter((x) => x.done).length;
  const pct = data.length ? Math.round((done / data.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Prioridades da semana"
        desc="Foco principal desta semana."
        action={<PrimaryButton onClick={openNew}>+ Adicionar</PrimaryButton>}
      />

      {error ? <p className="mb-3 text-sm text-[var(--red)]">{error}</p> : null}
      {loading ? <p className="text-sm text-[var(--muted)]">Carregando…</p> : null}

      <div className="mb-4">
        <div className="h-2 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--purple-tint)]">
          <div
            className="h-full bg-gradient-to-r from-[var(--purple)] to-[var(--purple-light)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 text-xs text-[var(--muted)]">
          {done} de {data.length} concluídas {saving ? "· salvando…" : ""}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {data.length === 0 && !loading ? (
          <Empty>Nenhuma prioridade ainda. Clique em + Adicionar.</Empty>
        ) : (
          data.map((item) => (
            <Card key={item.id} className={item.done ? "opacity-60" : ""}>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => void toggle(item.id)}
                className="mt-0.5 h-4 w-4 accent-[var(--purple)]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`m-0 text-[14.5px] font-semibold ${item.done ? "line-through" : ""}`}>
                    {item.text}
                  </h3>
                  <Tag tone={item.level}>
                    {item.level === "alta" ? "Alta" : item.level === "media" ? "Média" : "Baixa"}
                  </Tag>
                </div>
              </div>
              <div className="flex gap-1">
                <button type="button" className="rounded-md px-2 text-[var(--muted)] hover:bg-black/5" onClick={() => openEdit(item)}>
                  ✎
                </button>
                <button type="button" className="rounded-md px-2 text-[var(--muted)] hover:text-[var(--red)]" onClick={() => void remove(item.id)}>
                  🗑
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={open} title={editing ? "Editar prioridade" : "Nova prioridade"} onClose={() => setOpen(false)}>
        <Field label="Descrição">
          <input className={inputClass} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
        </Field>
        <Field label="Nível">
          <select className={inputClass} value={level} onChange={(e) => setLevel(e.target.value as PriorityLevel)}>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <GhostButton onClick={() => setOpen(false)}>Cancelar</GhostButton>
          <PrimaryButton onClick={() => void onSave()}>Salvar</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
