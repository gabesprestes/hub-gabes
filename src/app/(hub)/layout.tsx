"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Sidebar } from "@/components/sidebar";

export default function HubLayout({ children }: { children: React.ReactNode }) {
  const { token, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const home = pathname.startsWith("/home");

  useEffect(() => {
    if (ready && !token) router.replace("/login/");
  }, [ready, token, router]);

  if (!ready || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
        Carregando…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={home ? "min-w-0 flex-1 px-5 py-7" : "min-w-0 flex-1 max-w-[1400px] px-8 py-7"}>{children}</main>
    </div>
  );
}
