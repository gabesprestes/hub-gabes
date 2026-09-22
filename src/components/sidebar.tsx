"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCollection } from "@/hooks/use-collection";
import { ANALYSTS } from "@/lib/types";
import { useAuth } from "./auth-provider";

const ICON = "h-[18px] w-[18px]";
const STROKE = "#6b0494";

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke={STROKE} strokeWidth="1.8" aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.5v-6h-3V21H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconPrioridades() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke={STROKE} strokeWidth="1.8" aria-hidden>
      <path d="M12 3.5 14.2 8l5 .7-3.6 3.5.9 5.1L12 15l-4.5 2.3.9-5.1L4.8 8.7 9.8 8 12 3.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconPendencias() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke={STROKE} strokeWidth="1.8" aria-hidden>
      <path d="M8 4.5h8A2.5 2.5 0 0 1 18.5 7v12.5L12 16.5 5.5 19.5V7A2.5 2.5 0 0 1 8 4.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconNotas() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke={STROKE} strokeWidth="1.8" aria-hidden>
      <path d="M7 3.5h7.5L19 8v12.5H7V3.5Z" strokeLinejoin="round" />
      <path d="M14 3.8V8h4.2M9.5 12.5h5M9.5 16h3.5" strokeLinecap="round" />
    </svg>
  );
}

function IconLinks() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke={STROKE} strokeWidth="1.8" aria-hidden>
      <path d="M10 13.5a4 4 0 0 0 5.7.4l2.3-2.3a4 4 0 0 0-5.7-5.7L11 7.2" strokeLinecap="round" />
      <path d="M14 10.5a4 4 0 0 0-5.7-.4L6 12.4a4 4 0 0 0 5.7 5.7L13 16.8" strokeLinecap="round" />
    </svg>
  );
}

const NAV = [
  { href: "/home/", label: "Home", icon: IconHome },
  { href: "/projetos/", label: "Projetos", icon: IconPrioridades },
  { href: "/pendencias/", label: "Pendências", icon: IconPendencias },
  { href: "/notas/", label: "Anotações", icon: IconNotas },
  { href: "/links/", label: "Links", icon: IconLinks },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data, save, loading } = useCollection("agenda");
  const fileRef = useRef<HTMLInputElement>(null);
  const [analystsOpen, setAnalystsOpen] = useState(true);
  const [clock, setClock] = useState("--:--");
  const [today, setToday] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      );
    };
    tick();
    const id = setInterval(tick, 10_000);
    const dias = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
    const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const now = new Date();
    const t = `${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]}`;
    setToday(t.charAt(0).toUpperCase() + t.slice(1));
    return () => clearInterval(id);
  }, []);

  function onPhoto(file: File | undefined) {
    if (!file || loading) return;
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const size = 128;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const scale = Math.max(size / image.width, size / image.height);
      const w = image.width * scale;
      const h = image.height * scale;
      ctx.drawImage(image, (size - w) / 2, (size - h) / 2, w, h);
      const photo = canvas.toDataURL("image/jpeg", 0.85);
      URL.revokeObjectURL(url);
      void save({ ...data, photo });
    };
    image.src = url;
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-[var(--border)] bg-white p-4">
      <div className="mb-4 flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <button
          type="button"
          title="Colocar minha foto"
          onClick={() => fileRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[var(--purple)] to-[var(--purple-light)] text-lg font-bold text-white"
        >
          {data.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photo} alt="Sua foto" className="h-full w-full object-cover" />
          ) : (
            "G"
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPhoto(e.target.files?.[0])}
        />
        <div>
          <div className="text-[15px] font-bold leading-tight">Hub Gabes</div>
          <div className="text-[11px] text-[var(--muted)]">{today}</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href.slice(0, -1));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-[var(--purple-tint)] font-bold text-[var(--purple)]"
                  : "text-[var(--muted)] hover:bg-[var(--purple-tint)] hover:text-[var(--text)]"
              }`}
            >
              <span className="flex w-5 items-center justify-center">
                <Icon />
              </span>
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setAnalystsOpen((open) => !open)}
          className="mt-2 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--muted)] hover:bg-[var(--purple-tint)]"
        >
          <span className="text-[var(--purple)]">Analistas</span>
          <span className="text-xs">{analystsOpen ? "–" : "+"}</span>
        </button>
        {analystsOpen
          ? ANALYSTS.map((person) => {
              const href = `/analistas/${person.slug}/`;
              const active = pathname === href || pathname?.startsWith(`/analistas/${person.slug}`);
              return (
                <Link
                  key={person.slug}
                  href={href}
                  className={`flex items-center gap-2 rounded-lg py-1.5 pl-6 pr-3 text-[13px] ${
                    active ? "bg-[var(--purple-tint)] font-bold text-[var(--purple)]" : "text-[var(--muted)] hover:bg-[var(--purple-tint)]"
                  }`}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#4a0368]" />
                  {person.name}
                </Link>
              );
            })
          : null}
      </nav>

      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <div className="mb-2 text-center text-lg font-bold tabular-nums">{clock}</div>
        <div className="mb-2 truncate text-center text-[11px] text-[var(--muted)]">@{user?.login}</div>
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-xs text-[var(--muted)] hover:border-[var(--purple-light)] hover:text-[var(--text)]"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
