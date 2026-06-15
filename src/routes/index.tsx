import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ShieldCheck, ScanFace, Film, FileSearch, Eye, Lock, Zap, FileText,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/truthlens/Navbar";
import { Footer } from "@/components/truthlens/Footer";
import { UploadZone } from "@/components/truthlens/UploadZone";
import { ParticleField } from "@/components/truthlens/ParticleField";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "truthlensdetection — AI vs Real Detector for Images & Video" },
      {
        name: "description",
        content:
          "Detect AI-generated, deepfake, and manipulated images and videos in seconds. Enterprise-grade verification for journalists, investigators and security teams.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: ScanFace, title: "AI Image Detection", desc: "Identify diffusion, GAN and synthetic image signatures with state-of-the-art models." },
  { icon: Eye, title: "Deepfake Detection", desc: "Catch face swaps and reenactments through micro-expression and identity analysis." },
  { icon: Film, title: "Video Analysis", desc: "Frame-by-frame inspection with temporal consistency scoring across clips." },
  { icon: FileSearch, title: "Metadata Inspection", desc: "EXIF, C2PA and provenance signals validated against tamper indicators." },
  { icon: ShieldCheck, title: "Face Consistency", desc: "Geometry, lighting and skin texture matching to expose synthetic faces." },
  { icon: Lock, title: "Private Processing", desc: "Files are encrypted in transit, processed in isolated workers, never sold." },
  { icon: Zap, title: "Real-Time Results", desc: "Sub-second image analysis. Stream results as videos process in parallel." },
  { icon: FileText, title: "Downloadable Reports", desc: "Court-ready PDF reports with evidence, heatmaps and confidence ratings." },
];

const stats = [
  { v: "98.7%", l: "Detection accuracy" },
  { v: "12M+", l: "Files analyzed" },
  { v: "<800ms", l: "Avg image scan" },
  { v: "180+", l: "Countries served" },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <ParticleField />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-neon-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse" />
              Live model v4.2 — updated for SORA & Flux
            </div>
            <h1 className="mt-6 text-5xl sm:text-7xl font-display font-bold leading-[1.05]">
              <span className="text-gradient">AI vs REAL</span><br />
              <span className="text-foreground">Detector</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Instantly analyze images and videos to determine whether they are
              AI-generated, deepfake, manipulated, or authentic.
            </p>
          </motion.div>

          <div className="mt-12">
            <UploadZone />
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((s) => (
              <div key={s.l} className="glass rounded-xl p-5 text-center">
                <div className="text-2xl sm:text-3xl font-display font-bold text-gradient">{s.v}</div>
                <div className="mt-1 text-xs sm:text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-display font-bold">
            Forensics-grade <span className="text-gradient">detection stack</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Ten signal layers cross-checked in milliseconds. Built for newsrooms,
            investigators and security teams.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative glass rounded-2xl p-6 hover:bg-accent/20 transition-all"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 grid place-items-center mb-4 group-hover:glow-purple transition-shadow">
                <f.icon className="h-5 w-5 text-neon-cyan" />
              </div>
              <h3 className="font-display font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRUSTED BY USE CASES */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="glass-strong rounded-3xl p-8 sm:p-12 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">
              Built for those who <span className="text-gradient">need the truth</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              From verifying breaking-news imagery to securing identity verification
              pipelines, truthlensdetection provides the evidence layer modern teams require.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Journalists & fact-checkers verifying source media",
                "Insurance & legal teams authenticating evidence",
                "Cybersecurity teams defending against synthetic media",
                "Platforms moderating AI-generated content at scale",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-neon-cyan shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-square max-w-md mx-auto w-full">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 blur-2xl" />
            <div className="relative h-full w-full rounded-full border border-border grid place-items-center animate-float">
              <div className="absolute inset-8 rounded-full border border-neon-purple/40 animate-pulse-glow" />
              <div className="absolute inset-16 rounded-full border border-neon-blue/40" />
              <div className="absolute inset-24 rounded-full border border-neon-cyan/40" />
              <ShieldCheck className="h-20 w-20 text-neon-cyan" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
