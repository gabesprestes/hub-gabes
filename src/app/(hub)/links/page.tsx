"use client";

import { useState } from "react";
import { useCollection } from "@/hooks/use-collection";
import { uid } from "@/lib/schema";
import { LINK_CATEGORIAS, type LinkCategoria, type LinkItem } from "@/lib/types";
import {
  Empty,
  Field,
  GhostButton,
  Modal,
  PageHeader,
  PrimaryButton,
  inputClass,
} from "@/components/ui";

export default function LinksPage() {
  const { data, save, loading, saving, error } = useCollection("links");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LinkItem | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [categoria, setCategoria] = useState<LinkCategoria>("gerais");

  function openNew(cat: LinkCategoria) {
    setEditing(null);
    setLabel("");
    setUrl("");
    setCategoria(cat);
    setOpen(true);
  }

  function openEdit(item: LinkItem) {
    setEditing(item);
    setLabel(item.label);
    setUrl(item.url);
    setCategoria(item.categoria);
    setOpen(true);
  }

  async function onSave() {
    const l = label.trim();
    let u = url.trim();
    if (!l || !u) return;
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    if (editing) {
      await save(
        data.map((x) =>
          x.id === editing.id ? { ...x, label: l, url: u, categoria } : x,
        ),
      );
    } else {
      await save([...data, { id: uid(), label: l, url: u, categoria }]);
    }
    setOpen(false);
  }

  async function remove(id: string) {
    if (!confirm("Excluir este link?")) return;
    await save(data.filter((x) => x.id !== id));
  }

  return (
    <div>
      <PageHeader
        title="Links rápidos"
        desc={`Caixinhas por frente${saving ? " · salvando…" : ""}`}
      />
      {error ? <p className="mb-3 text-sm text-[var(--red)]">{error}</p> : null}
      {loading ? <p className="text-sm text-[var(--muted)]">Carregando…</p> : null}

      {LINK_CATEGORIAS.map((cat) => {
        const items = data.filter((l) => l.categoria === cat.key);
        return (
          <section key={cat.key} className="mb-8">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <h2 className="m-0 flex items-center gap-2 text-[15px] font-bold">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--purple)]" />
                {cat.label}
              </h2>
              <PrimaryButton onClick={() => openNew(cat.key)}>+ Adicionar</PrimaryButton>
            </div>

            {items.length === 0 ? (
              <Empty>Nenhum link em {cat.label}.</Empty>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div key={item.id} className="group relative">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block min-h-[88px] rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(138,5,190,0.35)] hover:shadow-md"
                    >
                      <div className="pr-8 text-[14px] font-semibold leading-snug">{item.label}</div>
                      <div className="mt-1.5 truncate text-[11.5px] text-[var(--muted)]">{item.url}</div>
                      <span className="absolute right-3 top-3 text-[var(--purple)] opacity-70">↗</span>
                    </a>
                    <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        className="rounded-md border border-[var(--border)] bg-white px-1.5 text-xs shadow-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          openEdit(item);
                        }}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-[var(--border)] bg-white px-1.5 text-xs text-[var(--red)] shadow-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          void remove(item.id);
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <Modal open={open} title={editing ? "Editar link" : "Novo link"} onClose={() => setOpen(false)}>
        <Field label="Nome">
          <input className={inputClass} value={label} onChange={(e) => setLabel(e.target.value)} autoFocus />
        </Field>
        <Field label="URL">
          <input className={inputClass} type="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
        </Field>
        <Field label="Categoria">
          <select className={inputClass} value={categoria} onChange={(e) => setCategoria(e.target.value as LinkCategoria)}>
            {LINK_CATEGORIAS.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
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
