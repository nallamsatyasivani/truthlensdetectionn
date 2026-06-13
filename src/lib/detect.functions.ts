import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type DetectionResult = {
  aiProbability: number; // 0..1
  realProbability: number; // 0..1
  confidence: number; // 0..1
  classification: "Likely AI-generated" | "Likely Authentic" | "Demo Analysis";
  isDemo: boolean;
  reasoning: string;
  signals: string[];
  raw: string;
};

const AI_THRESHOLD = 0.8;

export const detectImage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      imageDataUrl: z
        .string()
        .min(20)
        .refine((s) => s.startsWith("data:image/"), "Must be an image data URL"),
    }),
  )
  .handler(async ({ data }): Promise<DetectionResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;

    // No model connected -> explicit Demo Analysis (never claim AI-generated)
    if (!apiKey) {
      console.log("[detectImage] No LOVABLE_API_KEY — returning Demo Analysis");
      return {
        aiProbability: 0,
        realProbability: 0,
        confidence: 0,
        classification: "Demo Analysis",
        isDemo: true,
        reasoning:
          "No AI model is connected. Connect Lovable AI to enable real image analysis.",
        signals: [],
        raw: "",
      };
    }

    const systemPrompt = `You are a forensic image analyst. Examine the supplied image and decide whether it was produced by a generative AI model (e.g. Midjourney, Stable Diffusion, DALL·E, Flux, GPT-image) or is an authentic photograph / scan / hand-made artwork.

Consider:
- Anatomical or geometric inconsistencies (hands, teeth, eyes, ears, jewelry, text).
- Texture coherence, repeated patterns, melted backgrounds, plastic skin.
- Camera artifacts: sensor noise, chromatic aberration, lens vignetting, JPEG compression, motion blur, depth-of-field falloff.
- EXIF-style cues visible in the image (timestamps, watermarks, screen captures).
- Lighting/shadow physics.

Bias toward "authentic" for ordinary photos shot on phones or cameras — real photos often look slightly imperfect. Only flag AI when concrete generative artifacts are visible.

Respond with ONLY a compact JSON object, no prose, no markdown:
{"ai_probability": number 0..1, "confidence": number 0..1, "signals": string[], "reasoning": string}`;

    let raw = "";
    try {
      const resp = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Analyze this image and return the JSON object.",
                  },
                  {
                    type: "image_url",
                    image_url: { url: data.imageDataUrl },
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!resp.ok) {
        const body = await resp.text();
        console.error("[detectImage] Gateway error", resp.status, body);
        if (resp.status === 429) {
          throw new Error("Rate limit reached. Try again in a moment.");
        }
        if (resp.status === 402) {
          throw new Error(
            "AI credits exhausted. Add credits in your workspace billing.",
          );
        }
        throw new Error(`AI Gateway error ${resp.status}`);
      }

      const json = (await resp.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      raw = json.choices?.[0]?.message?.content ?? "";
      console.log("[detectImage] Raw model output:", raw);

      // Extract JSON payload (model sometimes wraps in code fences)
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Model returned no JSON");
      const parsed = JSON.parse(match[0]) as {
        ai_probability?: number;
        confidence?: number;
        signals?: string[];
        reasoning?: string;
      };

      const aiP = clamp01(Number(parsed.ai_probability ?? 0));
      const realP = clamp01(1 - aiP);
      const conf = clamp01(Number(parsed.confidence ?? 0));
      const classification: DetectionResult["classification"] =
        aiP >= AI_THRESHOLD ? "Likely AI-generated" : "Likely Authentic";

      console.log("[detectImage] AI prob:", aiP);
      console.log("[detectImage] Real prob:", realP);
      console.log("[detectImage] Confidence:", conf);
      console.log("[detectImage] Classification:", classification);

      return {
        aiProbability: aiP,
        realProbability: realP,
        confidence: conf,
        classification,
        isDemo: false,
        reasoning: String(parsed.reasoning ?? "").slice(0, 1000),
        signals: Array.isArray(parsed.signals)
          ? parsed.signals.map(String).slice(0, 12)
          : [],
        raw,
      };
    } catch (err) {
      console.error("[detectImage] Failed:", err, "raw:", raw);
      throw err instanceof Error ? err : new Error("Analysis failed");
    }
  });

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
