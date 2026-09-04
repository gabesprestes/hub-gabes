"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function HomePage() {
  const { token, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(token ? "/prioridades/" : "/login/");
  }, [ready, token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
      Carregando…
    </div>
  );
}
