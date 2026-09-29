"use client";

const USER_KEY = "fasl_tanya_user";

export function saveUser(user) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

export function updateUser(partial) {
  const current = getUser() || {};
  const updated = { ...current, ...partial };
  saveUser(updated);
  return updated;
}
