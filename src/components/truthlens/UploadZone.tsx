import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, ImageIcon, Video, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export function UploadZone() {
  const navigate = useNavigate();
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const isImage = file.type.startsWith("image/");
    let dataUrl = "";
    if (isImage && file.size <= 8 * 1024 * 1024) {
      dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
      });
    }
    sessionStorage.setItem(
      "truthlens:scan",
      JSON.stringify({ name: file.name, size: file.size, type: file.type, url, dataUrl }),
    );
    navigate({ to: "/analysis" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="relative w-full max-w-3xl mx-auto"
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={`relative glass-strong neon-border rounded-2xl p-8 sm:p-12 text-center overflow-hidden transition-all ${
          drag ? "scale-[1.02] glow-purple" : ""
        }`}
      >
        {/* scan beam */}
        <div className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-scan-beam" style={{ boxShadow: "0 0 20px var(--neon-cyan)" }} />

        <div className="relative flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 grid place-items-center animate-pulse-glow">
            <Upload className="h-7 w-7 text-neon-cyan" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-display font-semibold">
              Drop an image or video to analyze
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              JPG, PNG, WEBP, MP4, MOV — up to 200MB. Processed privately.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button
              size="lg"
              onClick={() => imgRef.current?.click()}
              className="bg-gradient-to-r from-neon-purple to-neon-blue text-white border-0 glow-purple hover:opacity-90"
            >
              <ImageIcon className="mr-2 h-4 w-4" /> Upload image
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => vidRef.current?.click()}
              className="border-border bg-background/30 backdrop-blur hover:bg-accent"
            >
              <Video className="mr-2 h-4 w-4" /> Upload video
            </Button>
          </div>

          <input ref={imgRef} type="file" accept="image/*" hidden onChange={(e) => handle(e.target.files?.[0])} />
          <input ref={vidRef} type="file" accept="video/*" hidden onChange={(e) => handle(e.target.files?.[0])} />
        </div>
      </div>
    </motion.div>
  );
}
