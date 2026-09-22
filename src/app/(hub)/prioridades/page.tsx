"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrioridadesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/projetos/");
  }, [router]);
  return <p className="text-sm text-[var(--muted)]">Abrindo Projetos…</p>;
}
