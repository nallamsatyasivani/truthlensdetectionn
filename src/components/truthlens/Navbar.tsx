import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

import { Menu } from "lucide-react";
import { useState } from "react";

const nav = [
  { label: "Home", to: "/" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Pricing", to: "/pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 backdrop-blur-xl bg-background/50 border-b border-border" />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/">
          <Logo />
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="menu">
          <Menu className="h-5 w-5" />
        </button>
      </nav>
      {open && (
        <div className="md:hidden relative border-t border-border bg-background/80 backdrop-blur-xl">
          <div className="flex flex-col p-4 gap-1">
            {nav.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm hover:bg-accent"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
