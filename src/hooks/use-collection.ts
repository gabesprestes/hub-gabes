"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const dataRef = useRef(data);
  const revision = useRef(0);

  const reload = useCallback(async () => {
    if (!token) return;
    const seen = revision.current;
    setLoading(true);
    setError(null);
    try {
      const value = await getCollection(token, name);
      if (seen !== revision.current) return;
      dataRef.current = value;
      setData(value);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      if (seen === revision.current) setLoading(false);
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
      const revisionAtSave = ++revision.current;
      const previous = dataRef.current;
      const resolved = typeof next === "function" ? next(previous) : next;
      dataRef.current = resolved;
      setData(resolved);
      try {
        await putCollection(token, name, resolved);
      } catch (e) {
        if (revision.current === revisionAtSave) {
          dataRef.current = previous;
          setData(previous);
        }
        setError(e instanceof Error ? e.message : "Erro ao salvar");
      } finally {
        setSaving(false);
      }
    },
    [token, name],
  );

  return { data, setData, save, loading, saving, error, reload };
}
