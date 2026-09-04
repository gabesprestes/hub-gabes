import { githubFetch } from "./github-api";

const STORAGE_KEY = "hubGabesGithubToken";

export interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function validateToken(token: string): Promise<GithubUser> {
  return githubFetch<GithubUser>(token, "/user");
}
