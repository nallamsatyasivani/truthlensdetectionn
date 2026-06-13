import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, ImageIcon, Video, History, FileText, Star,
  Code2, Users, Settings, ScanEye, TrendingUp, Activity, Trash2, Inbox,
} from "lucide-react";
import { Navbar } from "@/components/truthlens/Navbar";
import { Footer } from "@/components/truthlens/Footer";
import { Button } from "@/components/ui/button";
import { getHistory, clearHistory, relativeTime, type HistoryEntry } from "@/lib/truthlens-history";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — truthlensdetection" },
      { name: "description", content: "Your truthlensdetection dashboard: recent scans, reports and team workspace." },
    ],
  }),
  component: Dashboard,
});

const sidebar = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: ImageIcon, label: "Image Detector" },
  { icon: Video, label: "Video Detector" },
  { icon: History, label: "Scan History" },
  { icon: FileText, label: "Reports" },
  { icon: Star, label: "Favorites" },
  { icon: Code2, label: "API Access" },
  { icon: Users, label: "Team Workspace" },
  { icon: Settings, label: "Settings" },
];

function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const kpis = useMemo(() => {
    const total = history.length;
    const flagged = history.filter((h) => h.status === "AI").length;
    const avgConfidence = total
      ? Math.round(history.reduce((s, h) => s + Math.max(h.ai, h.real), 0) / total)
      : 0;
    return [
      { label: "Total scans", value: String(total), icon: ScanEye },
      { label: "AI-flagged", value: String(flagged), icon: Activity },
      { label: "Avg confidence", value: total ? `${avgConfidence}%` : "—", icon: TrendingUp },
      {
        label: "Authentic",
        value: String(history.filter((h) => h.status === "Authentic").length),
        icon: FileText,
      },
    ];
  }, [history]);

  const openScan = (h: HistoryEntry) => {
    sessionStorage.setItem(
      "truthlens:scan",
      JSON.stringify({ name: h.name, size: h.size, type: h.type, url: "" }),
    );
    navigate({ to: "/analysis" });
  };

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="glass rounded-2xl p-3 sticky top-24">
            <nav className="flex flex-col gap-1">
              {sidebar.map((s) => (
                <button
                  key={s.label}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                    s.active
                      ? "bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 text-foreground border border-neon-purple/30"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <s.icon className="h-4 w-4" />
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold">Welcome back</h1>
              <p className="text-sm text-muted-foreground">Here's what's happening in your workspace.</p>
            </div>
            <Link to="/detector">
              <Button className="bg-gradient-to-r from-neon-purple to-neon-blue text-white border-0">
                New scan
              </Button>
            </Link>
          </div>

          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 grid place-items-center">
                    <k.icon className="h-4 w-4 text-neon-cyan" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-display font-bold">{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Recent table */}
          <div className="mt-6 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">Scan history</h2>
              {history.length > 0 && (
                <Button size="sm" variant="ghost" onClick={handleClear}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear history
                </Button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 grid place-items-center mb-3">
                  <Inbox className="h-5 w-5 text-neon-cyan" />
                </div>
                <div className="font-display font-semibold">No scans yet</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Run your first analysis to start building your history.
                </p>
                <Link to="/detector">
                  <Button className="mt-4 bg-gradient-to-r from-neon-purple to-neon-blue text-white border-0">
                    Start a scan
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border">
                      <th className="py-2 pr-4">File</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">AI</th>
                      <th className="py-2 pr-4">Real</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">When</th>
                      <th className="py-2 pr-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r) => (
                      <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-accent/30">
                        <td className="py-3 pr-4 font-medium truncate max-w-xs">{r.name}</td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {r.type.startsWith("video") ? "Video" : "Image"}
                        </td>
                        <td className="py-3 pr-4 text-neon-purple">{r.ai}%</td>
                        <td className="py-3 pr-4 text-neon-blue">{r.real}%</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                            r.status === "AI" ? "bg-destructive/20 text-destructive" :
                            r.status === "Suspect" ? "bg-neon-purple/20 text-neon-purple" :
                            "bg-success/20 text-success"
                          }`}>{r.status}</span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{relativeTime(r.date)}</td>
                        <td className="py-3 pr-4 text-right">
                          <Button size="sm" variant="ghost" onClick={() => openScan(r)}>Open</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
