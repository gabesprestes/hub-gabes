"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getCollection, putCollection } from "@/lib/gist";
import { emptyCollections } from "@/lib/schema";
import type { CollectionMap, CollectionName } from "@/lib/types";

export function useCollection<K extends CollectionName>(name: K) {
  const { token } = useAuth();
  const [data, setData] = useState<CollectionMap[K]>(emptyCollections()[name]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const value = await getCollection(token, name);
      setData(value);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [token, name]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(
    async (next: CollectionMap[K] | ((current: CollectionMap[K]) => CollectionMap[K])) => {
      if (!token) return;
      setSaving(true);
      setError(null);
      let previous!: CollectionMap[K];
      let resolved!: CollectionMap[K];
      setData((current) => {
        previous = current;
        resolved = typeof next === "function" ? next(current) : next;
        return resolved;
      });
      try {
        await putCollection(token, name, resolved);
      } catch (e) {
        setData(previous);
        setError(e instanceof Error ? e.message : "Erro ao salvar");
      } finally {
        setSaving(false);
      }
    },
    [token, name],
  );

  return { data, setData, save, loading, saving, error, reload };
}
