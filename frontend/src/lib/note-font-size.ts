import { preferencesApi } from "@/lib/api";

export interface NoteFontSizeSettings {
  scale: number;
}

export const DEFAULT_NOTE_FONT_SIZE: NoteFontSizeSettings = {
  scale: 100,
};

const LS_KEY = "continuum:note-font-size";
const listeners = new Set<(s: NoteFontSizeSettings) => void>();

let cache: NoteFontSizeSettings = readLocal();
let loaded = false;
let loadPromise: Promise<NoteFontSizeSettings> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function readLocal(): NoteFontSizeSettings {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch {
    // ignore malformed cache
  }
  return { ...DEFAULT_NOTE_FONT_SIZE };
}

function writeLocal(settings: NoteFontSizeSettings) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
}

function safeParse(s: string): any {
  try { return JSON.parse(s); } catch { return {}; }
}

function normalize(raw: any): NoteFontSizeSettings {
  const value = Number(raw?.scale ?? raw?.noteFontSize ?? raw ?? DEFAULT_NOTE_FONT_SIZE.scale);
  return {
    scale: Number.isFinite(value) ? Math.min(180, Math.max(80, value)) : DEFAULT_NOTE_FONT_SIZE.scale,
  };
}

async function fetchPreferences(): Promise<any> {
  const res = await preferencesApi.get();
  return typeof res.data === "string" ? safeParse(res.data) : (res.data ?? {});
}

export function loadNoteFontSize(): NoteFontSizeSettings {
  if (!loaded && !loadPromise) {
    loadPromise = (async () => {
      try {
        const prefs = await fetchPreferences();
        if (typeof prefs?.noteFontSize === "number") {
          cache = normalize(prefs.noteFontSize);
          writeLocal(cache);
        } else if (prefs?.noteFontSize != null) {
          cache = normalize(prefs.noteFontSize);
          writeLocal(cache);
        }
      } catch {
        cache = readLocal();
      } finally {
        loaded = true;
        listeners.forEach((listener) => listener(cache));
        loadPromise = null;
      }
      return cache;
    })();
  }
  return cache;
}

export function saveNoteFontSize(settings: NoteFontSizeSettings) {
  const next = normalize(settings);
  cache = next;
  writeLocal(next);
  listeners.forEach((listener) => listener(next));

  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    try {
      let existing: any = {};
      try { existing = await fetchPreferences(); } catch { /* ignore */ }
      await preferencesApi.save({
        ...(existing && typeof existing === "object" ? existing : {}),
        noteFontSize: next.scale,
      });
    } catch { /* keep local cache */ }
  }, 500);
}

export function resetNoteFontSize() {
  return saveNoteFontSize(DEFAULT_NOTE_FONT_SIZE);
}

export function subscribeNoteFontSize(fn: (s: NoteFontSizeSettings) => void) {
  listeners.add(fn);
  if (!loaded) loadNoteFontSize();
  return () => listeners.delete(fn);
}
