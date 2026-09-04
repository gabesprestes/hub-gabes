"use client";

import { useState } from "react";
import { useCollection } from "@/hooks/use-collection";
import { uid } from "@/lib/schema";
import type { Nota } from "@/lib/types";
import {
  Card,
  Empty,
  Field,
  GhostButton,
  Modal,
  PageHeader,
  PrimaryButton,
  inputClass,
} from "@/components/ui";

export default function NotasPage() {
  const { data, save, loading, saving, error } = useCollection("notas");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Nota | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  function openNew() {
    setEditing(null);
    setTitle("");
    setText("");
    setOpen(true);
  }

  function openEdit(item: Nota) {
    setEditing(item);
    setTitle(item.title);
    setText(item.text);
    setOpen(true);
  }

  async function onSave() {
    if (!title.trim() && !text.trim()) return;
    const nextTitle = title.trim() || "(sem título)";
    if (editing) {
      await save(
        data.map((x) =>
          x.id === editing.id ? { ...x, title: nextTitle, text: text.trim() } : x,
        ),
      );
    } else {
      await save([...data, { id: uid(), title: nextTitle, text: text.trim() }]);
    }
    setOpen(false);
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta nota?")) return;
    await save(data.filter((x) => x.id !== id));
  }

  return (
    <div>
      <PageHeader
        title="Notas pessoais"
        desc={`Anotações rápidas e lembretes${saving ? " · salvando…" : ""}`}
        action={<PrimaryButton onClick={openNew}>+ Adicionar</PrimaryButton>}
      />
      {error ? <p className="mb-3 text-sm text-[var(--red)]">{error}</p> : null}
      {loading ? <p className="text-sm text-[var(--muted)]">Carregando…</p> : null}

      <div className="flex flex-col gap-2.5">
        {data.length === 0 && !loading ? (
          <Empty>Nenhuma nota ainda. Clique em + Adicionar.</Empty>
        ) : (
          data.map((item) => (
            <Card key={item.id}>
              <div className="min-w-0 flex-1">
                <h3 className="m-0 text-[14.5px] font-semibold">{item.title}</h3>
                <p className="mt-1 whitespace-pre-wrap text-[13px] text-[var(--muted)]">{item.text}</p>
              </div>
              <div className="flex gap-1">
                <button type="button" className="rounded-md px-2 text-[var(--muted)] hover:bg-black/5" onClick={() => openEdit(item)}>✎</button>
                <button type="button" className="rounded-md px-2 text-[var(--muted)] hover:text-[var(--red)]" onClick={() => void remove(item.id)}>🗑</button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={open} title={editing ? "Editar nota" : "Nova nota"} onClose={() => setOpen(false)}>
        <Field label="Título">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </Field>
        <Field label="Texto">
          <textarea className={inputClass + " min-h-24"} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <GhostButton onClick={() => setOpen(false)}>Cancelar</GhostButton>
          <PrimaryButton onClick={() => void onSave()}>Salvar</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
