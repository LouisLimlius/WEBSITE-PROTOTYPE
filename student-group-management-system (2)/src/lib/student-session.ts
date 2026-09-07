"use client";

import { useCallback, useEffect, useState } from "react";

export type StudentSession = {
  id: string;
  nim: string;
  name: string;
  token: string;
};

const KEY = "kk_student";

export function getStudentSession(): StudentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.id) return null;
    return parsed as StudentSession;
  } catch {
    return null;
  }
}

export function saveStudentSession(s: StudentSession) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("kk-student-changed"));
}

export function clearStudentSession() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("kk-student-changed"));
}

/** Hook sinkron antar-tab & antar-komponen. */
export function useStudentSession() {
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const update = () => {
      setStudent(getStudentSession());
      setReady(true);
    };
    update();
    window.addEventListener("kk-student-changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("kk-student-changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return { student, ready };
}

/** Fetch dengan token mahasiswa + parse error standar. */
export async function apiPost(url: string, body: Record<string, unknown>, token?: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = token ?? getStudentSession()?.token ?? null;
  if (t) headers["x-student-token"] = t;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Terjadi kesalahan");
  return data;
}

export async function apiDelete(url: string, token?: string | null) {
  const headers: Record<string, string> = {};
  const t = token ?? getStudentSession()?.token ?? null;
  if (t) headers["x-student-token"] = t;
  const res = await fetch(url, { method: "DELETE", headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Terjadi kesalahan");
  return data;
}
