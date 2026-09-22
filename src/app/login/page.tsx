"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Field, PrimaryButton, inputClass } from "@/components/ui";

export default function LoginPage() {
  const { login, token, ready } = useAuth();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && token) router.replace("/home/");
  }, [ready, token, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(value);
      router.replace("/home/");
    } catch {
      setError("Token inválido. Use um Personal Access Token com scope gist.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--purple-tint)] via-[var(--bg)] to-[#ece8f4] p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-8 shadow-lg"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--purple)] to-[var(--purple-light)] text-xl font-extrabold text-white">
          G
        </div>
        <h1 className="mb-1 text-center text-xl font-bold">Hub Gabes</h1>
        <p className="mb-6 text-center text-sm text-[var(--muted)]">
          Entre com um token GitHub (scope <strong>gist</strong> apenas).
        </p>

        {error ? (
          <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-[var(--red)]">
            {error}
          </div>
        ) : null}

        <Field label="Personal Access Token">
          <input
            className={inputClass}
            type="password"
            autoComplete="off"
            placeholder="ghp_…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </Field>

        <PrimaryButton type="submit" disabled={busy || !value.trim()}>
          {busy ? "Validando…" : "Entrar"}
        </PrimaryButton>

        <ol className="mt-6 list-decimal space-y-1 pl-4 text-[12px] text-[var(--muted)]">
          <li>GitHub → Settings → Developer settings</li>
          <li>Personal access tokens → Generate new token</li>
          <li>Marque só a permissão <code>gist</code></li>
          <li>Cole o token aqui (não compartilha com ninguém)</li>
        </ol>
      </form>
    </div>
  );
}
