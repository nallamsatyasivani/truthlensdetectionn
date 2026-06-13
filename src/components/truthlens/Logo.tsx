import { ScanEye } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const text = size === "lg" ? "text-2xl" : "text-lg";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${dims} relative grid place-items-center rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue glow-purple`}
      >
        <ScanEye className="h-1/2 w-1/2 text-white" strokeWidth={2.2} />
      </div>
      <div className={`${text} font-display font-bold tracking-tight`}>
        truthlensdetection
      </div>
    </div>
  );
}
