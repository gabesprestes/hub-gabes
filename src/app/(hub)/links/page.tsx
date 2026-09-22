"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCollection } from "@/hooks/use-collection";
import { SEED_LINKS } from "@/lib/seed-links";
import { uid } from "@/lib/schema";
import { LINK_CATEGORIAS, type LinkCategoria, type LinkItem } from "@/lib/types";
import {
  Empty,
  Field,
  GhostButton,
  Modal,
  PrimaryButton,
  inputClass,
} from "@/components/ui";

function initials(label: string) {
  const words = label
    .replace(/[[\]()]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^(de|da|do|e|por|-)$/i.test(w));
  const letters = words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "");
  return (letters.join("") || label.slice(0, 2)).slice(0, 2).toUpperCase();
}

export default function LinksPage() {
  const { data, save, loading, saving, error } = useCollection("links");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LinkCategoria | "todos">("todos");
  const [editingMode, setEditingMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LinkItem | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [categoria, setCategoria] = useState<LinkCategoria>("gerais");
  const seeded = useRef(false);

  useEffect(() => {
    if (loading || seeded.current) return;
    seeded.current = true;
    const urls = new Set(data.map((item) => item.url));
    const missing = SEED_LINKS.filter((item) => !urls.has(item.url)).map((item) => ({
      id: uid(),
      ...item,
    }));
    if (missing.length > 0) void save([...data, ...missing]);
  }, [loading, data, save]);

  const q = query.trim().toLowerCase();

  const visible = useMemo(() => {
    return LINK_CATEGORIAS.map((cat) => ({
      ...cat,
      items: data.filter((item) => {
        if (item.categoria !== cat.key) return false;
        if (filter !== "todos" && item.categoria !== filter) return false;
        if (!q) return true;
        return (
          item.label.toLowerCase().includes(q) ||
          (item.note ?? "").toLowerCase().includes(q) ||
          cat.label.toLowerCase().includes(q)
        );
      }),
    })).filter((cat) => (filter === "todos" ? true : cat.key === filter) && (q ? cat.items.length > 0 : true));
  }, [data, filter, q]);

  function openNew(cat: LinkCategoria) {
    setEditing(null);
    setLabel("");
    setUrl("");
    setNote("");
    setCategoria(cat);
    setOpen(true);
  }

  function openEdit(item: LinkItem) {
    setEditing(item);
    setLabel(item.label);
    setUrl(item.url);
    setNote(item.note ?? "");
    setCategoria(item.categoria);
    setOpen(true);
  }

  async function onSave() {
    const l = label.trim();
    let u = url.trim();
    if (!l || !u) return;
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    const nextNote = note.trim();
    if (editing) {
      await save(
        data.map((x) =>
          x.id === editing.id
            ? { ...x, label: l, url: u, categoria, note: nextNote || undefined }
            : x,
        ),
      );
    } else {
      await save([
        ...data,
        { id: uid(), label: l, url: u, categoria, note: nextNote || undefined },
      ]);
    }
    setOpen(false);
  }

  async function remove(id: string) {
    if (!confirm("Excluir este link?")) return;
    await save(data.filter((x) => x.id !== id));
  }

  return (
    <div>
      <h1 className="mb-4 text-[22px] font-bold tracking-tight">Links</h1>

      <div className="mb-4 flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou seção..."
          className="h-11 flex-1 rounded-full border border-[var(--border)] bg-white px-5 text-sm outline-none focus:border-[var(--purple-light)]"
        />
        <button
          type="button"
          onClick={() => setEditingMode((v) => !v)}
          className={`h-11 shrink-0 rounded-full px-5 text-sm font-semibold ${
            editingMode
              ? "bg-[var(--purple-tint)] text-[var(--purple)]"
              : "bg-[var(--purple)] text-white hover:bg-[var(--purple-light)]"
          }`}
        >
          {editingMode ? "Concluir" : "Editar"}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Chip active={filter === "todos"} onClick={() => setFilter("todos")}>
          Todos
        </Chip>
        {LINK_CATEGORIAS.map((cat) => (
          <Chip key={cat.key} active={filter === cat.key} onClick={() => setFilter(cat.key)}>
            {cat.label}
          </Chip>
        ))}
      </div>

      {error ? <p className="mb-3 text-sm text-[var(--red)]">{error}</p> : null}
      {loading || saving ? (
        <p className="mb-3 text-sm text-[var(--muted)]">{loading ? "Carregando…" : "Salvando…"}</p>
      ) : null}

      {visible.length === 0 ? (
        <Empty>Nenhum link encontrado para “{query}”.</Empty>
      ) : (
        visible.map((cat) => (
          <section key={cat.key} className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="m-0 text-[15px] font-semibold text-[var(--muted)]">{cat.label}</h2>
              {editingMode ? (
                <PrimaryButton onClick={() => openNew(cat.key)}>+ Adicionar</PrimaryButton>
              ) : null}
            </div>

            {cat.items.length === 0 ? (
              <Empty>Nenhum link em {cat.label}.</Empty>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group relative">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[112px] flex-col rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(138,5,190,0.35)] hover:shadow-md"
                    >
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--purple-tint)] text-[12px] font-bold text-[var(--purple)]">
                        {initials(item.label)}
                      </div>
                      <div className="pr-6 text-[14px] font-semibold leading-snug">{item.label}</div>
                      {item.note ? (
                        <div className="mt-1 line-clamp-2 text-[12px] text-[var(--muted)]">{item.note}</div>
                      ) : null}
                      <div className="mt-auto pt-3">
                        <span className="inline-block rounded-full bg-[var(--purple-tint)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--purple)]">
                          {cat.label}
                        </span>
                      </div>
                    </a>
                    {editingMode ? (
                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          type="button"
                          className="rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-xs shadow-sm"
                          onClick={() => openEdit(item)}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-xs text-[var(--red)] shadow-sm"
                          onClick={() => void remove(item.id)}
                        >
                          🗑
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))
      )}

      <Modal open={open} title={editing ? "Editar link" : "Novo link"} onClose={() => setOpen(false)}>
        <Field label="Nome">
          <input className={inputClass} value={label} onChange={(e) => setLabel(e.target.value)} autoFocus />
        </Field>
        <Field label="Descrição curta">
          <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <Field label="URL">
          <input className={inputClass} type="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
        </Field>
        <Field label="Seção">
          <select className={inputClass} value={categoria} onChange={(e) => setCategoria(e.target.value as LinkCategoria)}>
            {LINK_CATEGORIAS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
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

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium ${
        active
          ? "border-[var(--purple)] bg-[var(--purple)] text-white"
          : "border-[var(--border)] bg-white text-[var(--text)] hover:border-[var(--purple-light)]"
      }`}
    >
      {children}
    </button>
  );
}
