"use client";

import { useState } from "react";
import { useCollection } from "@/hooks/use-collection";
import { uid } from "@/lib/schema";
import {
  PENDENCIA_CATEGORIAS,
  type Pendencia,
  type PendenciaCategoria,
  type PendenciaStatus,
} from "@/lib/types";
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

export default function PendenciasPage() {
  const { data, save, loading, saving, error } = useCollection("pendencias");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pendencia | null>(null);
  const [text, setText] = useState("");
  const [categoria, setCategoria] = useState<PendenciaCategoria>("lideranca");
  const [status, setStatus] = useState<PendenciaStatus>("pendente");
  const [due, setDue] = useState("");

  function openNew(cat: PendenciaCategoria) {
    setEditing(null);
    setText("");
    setCategoria(cat);
    setStatus("pendente");
    setDue("");
    setOpen(true);
  }

  function openEdit(item: Pendencia) {
    setEditing(item);
    setText(item.text);
    setCategoria(item.categoria);
    setStatus(item.status);
    setDue(item.due);
    setOpen(true);
  }

  async function onSave() {
    const t = text.trim();
    if (!t) return;
    if (editing) {
      await save(
        data.map((x) =>
          x.id === editing.id ? { ...x, text: t, categoria, status, due } : x,
        ),
      );
    } else {
      await save([...data, { id: uid(), text: t, categoria, status, due }]);
    }
    setOpen(false);
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta pendência?")) return;
    await save(data.filter((x) => x.id !== id));
  }

  function formatDate(iso: string) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  return (
    <div>
      <PageHeader
        title="Pendências"
        desc={`Por frente${saving ? " · salvando…" : ""}`}
      />
      {error ? <p className="mb-3 text-sm text-[var(--red)]">{error}</p> : null}
      {loading ? <p className="text-sm text-[var(--muted)]">Carregando…</p> : null}

      {PENDENCIA_CATEGORIAS.map((cat) => {
        const items = data.filter((p) => p.categoria === cat.key);
        return (
          <section key={cat.key} className="mb-8">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <h2 className="m-0 flex items-center gap-2 text-[15px] font-bold">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--purple)]" />
                {cat.label}
              </h2>
              <PrimaryButton onClick={() => openNew(cat.key)}>+ Adicionar</PrimaryButton>
            </div>
            <div className="flex flex-col gap-2.5">
              {items.length === 0 ? (
                <Empty>Nenhuma pendência em {cat.label}.</Empty>
              ) : (
                items.map((item) => (
                  <Card key={item.id}>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="m-0 text-[14.5px] font-semibold">{item.text}</h3>
                        <Tag tone={item.status}>
                          {item.status === "pendente"
                            ? "Pendente"
                            : item.status === "andamento"
                              ? "Em andamento"
                              : "Concluído"}
                        </Tag>
                      </div>
                      {item.due ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">
                          Prazo: {formatDate(item.due)}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex gap-1">
                      <button type="button" className="rounded-md px-2 text-[var(--muted)] hover:bg-black/5" onClick={() => openEdit(item)}>✎</button>
                      <button type="button" className="rounded-md px-2 text-[var(--muted)] hover:text-[var(--red)]" onClick={() => void remove(item.id)}>🗑</button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>
        );
      })}

      <Modal open={open} title={editing ? "Editar pendência" : "Nova pendência"} onClose={() => setOpen(false)}>
        <Field label="Descrição">
          <input className={inputClass} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
        </Field>
        <Field label="Categoria">
          <select className={inputClass} value={categoria} onChange={(e) => setCategoria(e.target.value as PendenciaCategoria)}>
            {PENDENCIA_CATEGORIAS.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as PendenciaStatus)}>
            <option value="pendente">Pendente</option>
            <option value="andamento">Em andamento</option>
            <option value="concluido">Concluído</option>
          </select>
        </Field>
        <Field label="Prazo (opcional)">
          <input className={inputClass} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <GhostButton onClick={() => setOpen(false)}>Cancelar</GhostButton>
          <PrimaryButton onClick={() => void onSave()}>Salvar</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
