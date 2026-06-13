import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from "recharts";
import {
  ShieldAlert, ShieldCheck, Download, RefreshCw, AlertTriangle, Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/truthlens/Navbar";
import { Footer } from "@/components/truthlens/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { detectImage, type DetectionResult } from "@/lib/detect.functions";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Analysis — truthlensdetection" },
      { name: "description", content: "AI detection results, confidence scores and detailed breakdown." },
    ],
  }),
  component: Analysis,
});

type ScanFile = { name: string; size: number; type: string; url: string; dataUrl?: string };

function Analysis() {
  const detect = useServerFn(detectImage);
  const [file, setFile] = useState<ScanFile | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("truthlens:scan");
    if (raw) setFile(JSON.parse(raw));
  }, []);

  // Run real analysis
  const runAnalysis = async (f: ScanFile) => {
    setResult(null);
    setError(null);
    setProgress(5);
    const timer = setInterval(() => {
      setProgress((p) => (p < 90 ? p + 3 : p));
    }, 80);
    try {
      if (!f.dataUrl) {
        // No image data — show explicit Demo Analysis (video or oversized)
        setResult({
          aiProbability: 0,
          realProbability: 0,
          confidence: 0,
          classification: "Demo Analysis",
          isDemo: true,
          reasoning:
            f.type.startsWith("video")
              ? "Video analysis is not connected to a trained model. Showing demo placeholder only."
              : "No image data available for analysis.",
          signals: [],
          raw: "",
        });
      } else {
        const res = await detect({ data: { imageDataUrl: f.dataUrl } });
        console.log("[TruthLens] Detection result:", res);
        setResult(res);
      }
    } catch (e) {
      console.error("[TruthLens] Detection failed:", e);
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      clearInterval(timer);
      setProgress(100);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!file) return;
    setLoading(true);
    runAnalysis(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Persist to scan history once analysis completes
  useEffect(() => {
    if (!result || !file || result.isDemo) return;
    import("@/lib/truthlens-history").then(({ addHistory, getHistory }) => {
      const exists = getHistory().some(
        (h) => h.name === file.name && Date.now() - h.date < 5000,
      );
      if (exists) return;
      const ai = Math.round(result.aiProbability * 100);
      const real = Math.round(result.realProbability * 100);
      const status: "AI" | "Authentic" | "Suspect" =
        ai >= 80 ? "AI" : ai >= 50 ? "Suspect" : "Authentic";
      addHistory({
        name: file.name,
        size: file.size,
        type: file.type,
        ai,
        real,
        status,
      });
    });
  }, [result, file]);

  const aiScore = result ? +(result.aiProbability * 100).toFixed(1) : 0;
  const realScore = result ? +(result.realProbability * 100).toFixed(1) : 0;
  const confidencePct = result ? Math.round(result.confidence * 100) : 0;
  const isAi = result?.classification === "Likely AI-generated";
  const isDemo = result?.isDemo ?? false;

  const handleRescan = () => {
    if (file) {
      setLoading(true);
      runAnalysis(file);
    }
  };

  const handleExport = () => {
    if (!file || !result) return;
    const report = `truthlensdetection — Analysis Report
==============================

File: ${file.name}
Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
Type: ${file.type || "media"}
Generated: ${new Date().toLocaleString()}

VERDICT
-------
${result.classification}
Model confidence: ${confidencePct}%

PROBABILITY SPLIT
-----------------
AI-generated: ${aiScore}%
Authentic:    ${realScore}%

REASONING
---------
${result.reasoning || "(none)"}

SIGNALS
-------
${result.signals.length ? result.signals.map((s) => `- ${s}`).join("\n") : "(none)"}

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
    [aiScore, realScore],
  );

  const gaugeData = [{ name: "confidence", value: confidencePct, fill: "oklch(0.85 0.16 200)" }];

  if (!file) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-32 text-center">
          <h1 className="text-3xl font-display font-bold">No file to analyze</h1>
          <p className="mt-3 text-muted-foreground">Upload an image to see results.</p>
          <Link to="/">
            <Button className="mt-6 bg-gradient-to-r from-neon-purple to-neon-blue text-white border-0">
              Go home
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
            <Button variant="outline" onClick={handleRescan} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />Re-scan
            </Button>
            <Button onClick={handleExport} disabled={!result} className="bg-gradient-to-r from-neon-purple to-neon-blue text-white border-0">
              <Download className="mr-2 h-4 w-4" />Export Report
            </Button>
          </div>
        </div>

        {/* Scanning state */}
        {loading && (
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
                <div className="font-display font-semibold">Running forensic image analysis</div>
                <div className="text-xs text-muted-foreground">Calling vision model and inspecting generative artifacts…</div>
                <Progress value={progress} className="mt-3 h-2" />
              </div>
              <div className="text-2xl font-display font-bold text-neon-cyan tabular-nums">
                {progress}%
              </div>
            </div>
          </motion.div>
        )}

        {error && !loading && (
          <div className="mt-8 glass-strong neon-border rounded-2xl p-6 text-destructive">
            Analysis failed: {error}
          </div>
        )}

        {result && !loading && (
          <>
            {/* Verdict banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-8 glass-strong neon-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className={`h-12 w-12 rounded-xl grid place-items-center ${
                isDemo ? "bg-muted" : isAi ? "bg-destructive/20" : "bg-emerald-500/20"
              }`}>
                {isDemo ? (
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                ) : isAi ? (
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                ) : (
                  <ShieldCheck className="h-6 w-6 text-emerald-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-lg font-display font-semibold">{result.classification}</div>
                <div className="text-sm text-muted-foreground">
                  {isDemo
                    ? "Connect a trained model (Lovable AI) to enable real detection."
                    : <>Model confidence: <span className="text-neon-cyan font-semibold">{confidencePct}%</span></>}
                </div>
              </div>
              {!isDemo && (
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
              )}
            </motion.div>

            {/* Charts row */}
            {!isDemo && (
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
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
                        <div className="text-4xl font-display font-bold text-gradient">{confidencePct}%</div>
                        <div className="text-xs text-muted-foreground">
                          {confidencePct >= 80 ? "High" : confidencePct >= 50 ? "Medium" : "Low"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 flex flex-col">
                  <div className="text-sm font-semibold mb-2">Authenticity rating</div>
                  <div className="flex-1 grid place-items-center">
                    <div className="relative">
                      <div className={`h-32 w-32 rounded-full grid place-items-center animate-pulse-glow ${
                        isAi ? "bg-gradient-to-br from-destructive/30 to-neon-purple/30" : "bg-gradient-to-br from-emerald-500/30 to-neon-blue/30"
                      }`}>
                        <ShieldCheck className={`h-12 w-12 ${isAi ? "text-destructive" : "text-emerald-500"} opacity-80`} />
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <div className={`text-2xl font-display font-bold ${isAi ? "text-destructive" : "text-emerald-500"}`}>
                      {isAi ? "Low" : "High"}
                    </div>
                    <div className="text-xs text-muted-foreground">Score {Math.round(realScore)} / 100</div>
                  </div>
                </div>
              </div>
            )}

            {/* Reasoning + Signals + Image */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="glass rounded-2xl p-6 lg:col-span-2">
                <div className="text-sm font-semibold mb-3">Model reasoning</div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {result.reasoning || "No reasoning returned by the model."}
                </p>

                {result.signals.length > 0 && (
                  <div className="mt-5">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                      Detected signals
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {result.signals.map((s, i) => (
                        <li key={i} className="text-xs rounded-md border border-border bg-secondary/40 px-2 py-1">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="text-sm font-semibold mb-2">Submitted media</div>
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
                  <div className="absolute inset-0 ring-1 ring-inset ring-neon-cyan/30" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
