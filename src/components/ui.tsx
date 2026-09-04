"use client";

import type { ReactNode } from "react";

export function PageHeader({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="m-0 text-[21px] font-bold tracking-tight">{title}</h1>
        {desc ? <p className="mt-1 text-[13px] text-[var(--muted)]">{desc}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg bg-[var(--purple)] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-[var(--purple-light)] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="rounded-lg border border-[var(--border)] px-3 py-2 text-[13px] text-[var(--muted)] hover:border-[var(--purple-light)] hover:text-[var(--text)]"
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-white/50 px-4 py-8 text-center text-[13px] text-[var(--muted)]">
      {children}
    </div>
  );
}

export function Tag({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "alta" | "media" | "baixa" | "pendente" | "andamento" | "concluido";
}) {
  const map: Record<string, string> = {
    alta: "bg-red-50 text-[var(--red)]",
    media: "bg-amber-50 text-[var(--amber)]",
    baixa: "bg-green-50 text-[var(--green)]",
    pendente: "bg-amber-50 text-[var(--amber)]",
    andamento: "bg-[var(--purple-tint)] text-[var(--purple)]",
    concluido: "bg-green-50 text-[var(--green)]",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${map[tone]}`}>
      {children}
    </span>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-base font-bold">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-[11.5px] font-semibold text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--purple-light)]";
