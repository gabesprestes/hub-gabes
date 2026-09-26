import { githubFetch } from "./github-api";
import { emptyCollections, parseCollection } from "./schema";
import {
  COLLECTION_FILES,
  GIST_DESCRIPTION,
  type CollectionMap,
  type CollectionName,
} from "./types";

interface GistFile {
  filename: string;
  content?: string;
  raw_url?: string;
}

interface Gist {
  id: string;
  description: string;
  files: Record<string, GistFile>;
}

let writeQueue: Promise<void> = Promise.resolve();
const gistIds = new Map<string, string>();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn, fn);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function findHubGist(token: string): Promise<Gist | null> {
  const gists = await githubFetch<Gist[]>(token, "/gists?per_page=100");
  return gists.find((g) => g.description === GIST_DESCRIPTION) ?? null;
}

export async function createHubGist(token: string): Promise<Gist> {
  const defaults = emptyCollections();
  const files: Record<string, { content: string }> = {};
  (Object.keys(COLLECTION_FILES) as CollectionName[]).forEach((name) => {
    files[COLLECTION_FILES[name]] = {
      content: JSON.stringify(defaults[name], null, 2),
    };
  });

  return githubFetch<Gist>(token, "/gists", {
    method: "POST",
    body: JSON.stringify({
      description: GIST_DESCRIPTION,
      public: false,
      files,
    }),
  });
}

export async function ensureHubGist(token: string): Promise<Gist> {
  const existing = await findHubGist(token);
  if (existing) return existing;
  return createHubGist(token);
}

async function loadGist(token: string, gistId: string): Promise<Gist> {
  return githubFetch<Gist>(token, `/gists/${gistId}`);
}

async function hubGistId(token: string) {
  const cached = gistIds.get(token);
  if (cached) return cached;
  const gist = await ensureHubGist(token);
  gistIds.set(token, gist.id);
  return gist.id;
}

export async function getCollection<K extends CollectionName>(
  token: string,
  name: K,
): Promise<CollectionMap[K]> {
  const fresh = await loadGist(token, await hubGistId(token));
  const file = fresh.files[COLLECTION_FILES[name]];
  let content = file?.content;
  if (!content && file?.raw_url) {
    const res = await fetch(file.raw_url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    content = await res.text();
  }
  return parseCollection(name, content);
}

export async function putCollection<K extends CollectionName>(
  token: string,
  name: K,
  data: CollectionMap[K],
): Promise<void> {
  return enqueue(async () => {
    const gistId = await hubGistId(token);
    const content = JSON.stringify(data, null, 2);
    if (!content) throw new Error("Não havia conteúdo para salvar.");
    await githubFetch(token, `/gists/${gistId}`, {
      method: "PATCH",
      body: JSON.stringify({
        files: {
          [COLLECTION_FILES[name]]: {
            content,
          },
          [COLLECTION_FILES.meta]: {
            content: JSON.stringify(
              { updatedAt: new Date().toISOString() },
              null,
              2,
            ),
          },
        },
      }),
    });
  });
}
