"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/home/", label: "Home", icon: "🏠" },
  { href: "/prioridades/", label: "Prioridades", icon: "📌" },
  { href: "/pendencias/", label: "Pendências", icon: "🗂️" },
  { href: "/notas/", label: "Notas", icon: "📝" },
  { href: "/links/", label: "Links", icon: "🔗" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
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
    const dias = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
    const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
    const now = new Date();
    const t = `${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]}`;
    setToday(t.charAt(0).toUpperCase() + t.slice(1));
    return () => clearInterval(id);
  }, []);

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[var(--border)] bg-white p-4 sticky top-0 h-screen">
      <div className="mb-4 flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--purple)] to-[var(--purple-light)] text-lg font-bold text-white">
          G
        </div>
        <div>
          <div className="text-[15px] font-bold leading-tight">Hub Gabes</div>
          <div className="text-[11px] text-[var(--muted)]">{today}</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname?.startsWith(item.href.slice(0, -1));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-[var(--purple-tint)] font-bold text-[var(--purple)]"
                  : "text-[var(--muted)] hover:bg-[var(--purple-tint)] hover:text-[var(--text)]"
              }`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <div className="mb-2 text-center text-lg font-bold tabular-nums">{clock}</div>
        <div className="mb-2 truncate text-center text-[11px] text-[var(--muted)]">
          @{user?.login}
        </div>
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
