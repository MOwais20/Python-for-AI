"use client";
import { useEffect, useSyncExternalStore } from "react";

let sessionTheme: "dark" | "light" | undefined;
function snapshot(): "dark" | "light" {
  if (sessionTheme) return sessionTheme;
  try {
    const saved = localStorage.getItem("xander.theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch { /* Use the system preference when storage is unavailable. */ }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function subscribe(listener: () => void) {
  const media = matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("xander-theme", listener); window.addEventListener("storage", listener);
  media.addEventListener("change", listener);
  return () => {
    window.removeEventListener("xander-theme", listener); window.removeEventListener("storage", listener);
    media.removeEventListener("change", listener);
  };
}
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "light");
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  return { dark: theme === "dark", toggleTheme: () => {
    const next = theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("xander.theme", next); } catch { sessionTheme = next; }
    window.dispatchEvent(new Event("xander-theme"));
  } };
}
