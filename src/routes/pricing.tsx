import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/truthlens/Navbar";
import { Footer } from "@/components/truthlens/Footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — truthlensdetection" },
      { name: "description", content: "Free, Pro and Enterprise plans for AI and deepfake detection." },
    ],
  }),
  component: Pricing,
});

const tiers = [
  {
    name: "Free", price: "$0", desc: "For exploring truthlensdetection",
    features: ["10 scans / day", "Image detection", "Basic report", "Community support"],
    cta: "Start free",
  },
  {
    name: "Pro", price: "$29", suffix: "/mo", featured: true, desc: "For professionals",
    features: ["Unlimited scans", "Image & video detection", "Advanced PDF reports", "Heatmaps & metadata", "Priority queue"],
    cta: "Go Pro",
  },
  {
    name: "Enterprise", price: "Custom", desc: "For organizations",
    features: ["Team workspace & SSO", "API access & webhooks", "Priority processing", "Dedicated support", "Custom SLAs"],
    cta: "Contact sales",
  },
];

function Pricing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-24">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-display font-bold">
            Simple, <span className="text-gradient">scalable pricing</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Start free. Upgrade when you need volume, video or team features.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative glass rounded-2xl p-8 ${t.featured ? "neon-border glow-purple" : ""}`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" /> Most popular
                </div>
              )}
              <h3 className="text-xl font-display font-semibold">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              <div className="mt-5">
                <span className="text-4xl font-display font-bold">{t.price}</span>
                {t.suffix && <span className="text-muted-foreground">{t.suffix}</span>}
              </div>
              <ul className="mt-6 space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-neon-cyan mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/detector">
                <Button
                  className={`w-full mt-7 ${
                    t.featured
                      ? "bg-gradient-to-r from-neon-purple to-neon-blue text-white border-0"
                      : ""
                  }`}
                  variant={t.featured ? "default" : "outline"}
                >
                  {t.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
