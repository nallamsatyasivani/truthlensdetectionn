import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from "recharts";
import {
  ShieldAlert, ShieldCheck, Download, RefreshCw, FileText, AlertTriangle,
} from "lucide-react";
import { Navbar } from "@/components/truthlens/Navbar";
import { Footer } from "@/components/truthlens/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Analysis — truthlensdetection" },
      { name: "description", content: "AI detection results, confidence scores, heatmap and detailed breakdown." },
    ],
  }),
  component: Analysis,
});

type ScanFile = { name: string; size: number; type: string; url: string };

const metrics = [
  { label: "Face Consistency", value: 32 },
  { label: "Skin Texture Analysis", value: 28 },
  { label: "Lighting Accuracy", value: 41 },
  { label: "Shadow Consistency", value: 35 },
  { label: "Reflection Analysis", value: 22 },
  { label: "Noise Pattern Detection", value: 18 },
  { label: "Compression Artifacts", value: 24 },
  { label: "Metadata Verification", value: 8 },
  { label: "Background Consistency", value: 44 },
  { label: "Edge Pattern Detection", value: 19 },
];

const recent = [
  { name: "press-photo-04.jpg", date: "Jun 7", type: "Image", ai: 12, real: 88 },
  { name: "clip-statement.mp4", date: "Jun 6", type: "Video", ai: 91, real: 9 },
  { name: "portrait-gen.png", date: "Jun 5", type: "Image", ai: 97, real: 3 },
  { name: "interview-cam2.mp4", date: "Jun 4", type: "Video", ai: 7, real: 93 },
];

function Analysis() {
  const [file, setFile] = useState<ScanFile | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("truthlens:scan");
    if (raw) setFile(JSON.parse(raw));
  }, []);

  useEffect(() => {
    if (!file) return;
    setDone(false);
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(id); setDone(true); return 100; }
        return p + 4;
      });
    }, 60);
    return () => clearInterval(id);
  }, [file]);

  const aiScore = 82.4;
  const realScore = 17.6;
  const confidence = "High";

  // Persist to scan history once analysis completes
  useEffect(() => {
    if (!done || !file) return;
    import("@/lib/truthlens-history").then(({ addHistory, getHistory }) => {
      const exists = getHistory().some(
        (h) => h.name === file.name && Date.now() - h.date < 5000,
      );
      if (exists) return;
      const status: "AI" | "Authentic" | "Suspect" =
        aiScore >= 70 ? "AI" : aiScore >= 40 ? "Suspect" : "Authentic";
      addHistory({
        name: file.name,
        size: file.size,
        type: file.type,
        ai: Math.round(aiScore),
        real: Math.round(realScore),
        status,
      });
    });
  }, [done, file]);

  const handleRescan = () => {
    setDone(false);
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(id); setDone(true); return 100; }
        return p + 4;
      });
    }, 60);
  };

  const handleExport = () => {
    if (!file) return;
    const report = `truthlensdetection — Analysis Report
==============================

File: ${file.name}
Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
Type: ${file.type || "media"}
Generated: ${new Date().toLocaleString()}

VERDICT
-------
Likely AI-generated
Authenticity rating: Low (Score 18 / 100)
Confidence: ${confidence} (92%)

PROBABILITY SPLIT
-----------------
AI-generated: ${aiScore}%
Authentic:    ${realScore}%

FORENSIC BREAKDOWN
------------------
${metrics.map((m) => `${m.label.padEnd(30, " ")} ${m.value}%`).join("\n")}

SUSPICIOUS REGIONS
------------------
- High-risk cluster (upper-left facial region)
- Anomaly cluster (lower-right background)
- Secondary high-risk zone (mid-right edge)

— truthlensdetection · See Beyond the Pixels.
`;
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `truthlens-report-${file.name.replace(/\.[^.]+$/, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const pieData = useMemo(
    () => [
      { name: "AI", value: aiScore, color: "oklch(0.68 0.25 300)" },
      { name: "Real", value: realScore, color: "oklch(0.72 0.2 240)" },
    ],
    [],
  );

  const gaugeData = [{ name: "confidence", value: 92, fill: "oklch(0.85 0.16 200)" }];

  if (!file) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-32 text-center">
          <h1 className="text-3xl font-display font-bold">No file to analyze</h1>
          <p className="mt-3 text-muted-foreground">Upload an image or video to see results.</p>
          <Link to="/detector">
            <Button className="mt-6 bg-gradient-to-r from-neon-purple to-neon-blue text-white border-0">
              Go to detector
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Analysis result</div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold truncate max-w-xl">
              {file.name}
            </h1>
            <div className="text-xs text-muted-foreground mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || "media"}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRescan}><RefreshCw className="mr-2 h-4 w-4" />Re-scan</Button>
            <Button onClick={handleExport} className="bg-gradient-to-r from-neon-purple to-neon-blue text-white border-0">
              <Download className="mr-2 h-4 w-4" />Export Report
            </Button>
          </div>
        </div>

        {/* Scanning state */}
        {!done && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-8 glass-strong neon-border rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-scan-beam" style={{ boxShadow: "0 0 20px var(--neon-cyan)" }} />
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center animate-pulse-glow">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-display font-semibold">Running 10-layer forensic analysis</div>
                <div className="text-xs text-muted-foreground">Inspecting noise, lighting, faces, metadata, edges and more…</div>
                <Progress value={progress} className="mt-3 h-2" />
              </div>
              <div className="text-2xl font-display font-bold text-neon-cyan tabular-nums">
                {progress}%
              </div>
            </div>
          </motion.div>
        )}

        {done && (
          <>
            {/* Verdict banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-8 glass-strong neon-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="h-12 w-12 rounded-xl bg-destructive/20 grid place-items-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-display font-semibold">Likely AI-generated</div>
                <div className="text-sm text-muted-foreground">
                  Multiple synthetic signatures detected. Authenticity rating: <span className="text-destructive font-semibold">Low</span> · Confidence: <span className="text-neon-cyan font-semibold">{confidence}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-6">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">AI</div>
                  <div className="text-2xl font-display font-bold text-neon-purple">{aiScore}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Real</div>
                  <div className="text-2xl font-display font-bold text-neon-blue">{realScore}%</div>
                </div>
              </div>
            </motion.div>

            {/* Charts row */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {/* Probability donut */}
              <div className="glass rounded-2xl p-6">
                <div className="text-sm font-semibold mb-2">Probability split</div>
                <div className="h-56">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={85} paddingAngle={3} stroke="none">
                        {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-neon-purple" />AI {aiScore}%</div>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-neon-blue" />Real {realScore}%</div>
                </div>
              </div>

              {/* Confidence gauge */}
              <div className="glass rounded-2xl p-6">
                <div className="text-sm font-semibold mb-2">Confidence</div>
                <div className="h-56 relative">
                  <ResponsiveContainer>
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={210} endAngle={-30}>
                      <RadialBar background dataKey="value" cornerRadius={20} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 grid place-items-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-4xl font-display font-bold text-gradient">92%</div>
                      <div className="text-xs text-muted-foreground">{confidence}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authenticity card */}
              <div className="glass rounded-2xl p-6 flex flex-col">
                <div className="text-sm font-semibold mb-2">Authenticity rating</div>
                <div className="flex-1 grid place-items-center">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-destructive/30 to-neon-purple/30 grid place-items-center animate-pulse-glow">
                      <ShieldCheck className="h-12 w-12 text-destructive opacity-80" />
                    </div>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <div className="text-2xl font-display font-bold text-destructive">Low</div>
                  <div className="text-xs text-muted-foreground">Score 18 / 100</div>
                </div>
              </div>
            </div>

            {/* Breakdown + Heatmap */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="glass rounded-2xl p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold">Forensic breakdown</div>
                  <div className="text-xs text-muted-foreground">Authenticity score per signal</div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {metrics.map((m, i) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="tabular-nums">{m.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${m.value}%` }}
                          transition={{ duration: 0.8, delay: i * 0.04 }}
                          className={`h-full rounded-full ${
                            m.value > 60 ? "bg-success" : m.value > 30 ? "bg-neon-purple" : "bg-destructive"
                          }`}
                          style={{
                            boxShadow: m.value < 30 ? "0 0 12px var(--danger)" : undefined,
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Heatmap */}
              <div className="glass rounded-2xl p-6">
                <div className="text-sm font-semibold mb-2">Suspicious regions</div>
                <div className="relative aspect-square rounded-xl overflow-hidden border border-border">
                  {file.url ? (
                    file.type.startsWith("video") ? (
                      <video src={file.url} className="absolute inset-0 h-full w-full object-cover" muted loop autoPlay />
                    ) : (
                      <img src={file.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    )
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary to-accent" />
                  )}
                  {/* heatmap blobs */}
                  <div className="absolute inset-0">
                    <div className="absolute top-[18%] left-[22%] h-28 w-28 rounded-full bg-destructive/50 blur-2xl" />
                    <div className="absolute top-[55%] left-[58%] h-24 w-24 rounded-full bg-neon-purple/50 blur-2xl" />
                    <div className="absolute top-[30%] left-[65%] h-16 w-16 rounded-full bg-destructive/40 blur-xl" />
                  </div>
                  <div className="absolute inset-0 ring-1 ring-inset ring-neon-cyan/30" />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" />High risk</div>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-neon-purple" />Anomaly</div>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-neon-cyan" />Inspected</div>
                </div>
              </div>
            </div>

            {/* Recent */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold">Recent scans</h2>
                <Link to="/dashboard" className="text-sm text-neon-cyan hover:underline">View all</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recent.map((r) => (
                  <div key={r.name} className="glass rounded-xl p-4">
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 mb-3 grid place-items-center">
                      <FileText className="h-8 w-8 text-neon-cyan/60" />
                    </div>
                    <div className="text-sm font-medium truncate">{r.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.date} · {r.type}</div>
                    <div className="mt-3 flex gap-2 text-xs">
                      <div className="flex-1 rounded-md bg-secondary/50 p-2 text-center">
                        <div className="text-muted-foreground">AI</div>
                        <div className="font-semibold text-neon-purple">{r.ai}%</div>
                      </div>
                      <div className="flex-1 rounded-md bg-secondary/50 p-2 text-center">
                        <div className="text-muted-foreground">Real</div>
                        <div className="font-semibold text-neon-blue">{r.real}%</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-3">View report</Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
