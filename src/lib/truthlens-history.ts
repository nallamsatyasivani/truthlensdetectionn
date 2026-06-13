export type HistoryEntry = {
  id: string;
  name: string;
  size: number;
  type: string;
  ai: number;
  real: number;
  status: "AI" | "Authentic" | "Suspect";
  date: number;
};

const KEY = "truthlens:history";

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, "id" | "date">): HistoryEntry {
  const record: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: Date.now(),
  };
  const all = [record, ...getHistory()].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(all));
  return record;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}
