"use client";

import { Crown, Leaf, Shapes, Sparkles } from "lucide-react";
import { VIBES, type Vibe } from "@/lib/product";

const meta = {
  Natural: { icon: Leaf, color: "var(--sage)" },
  Modern: { icon: Shapes, color: "var(--lavender)" },
  Creative: { icon: Sparkles, color: "var(--peach)" },
  Luxury: { icon: Crown, color: "var(--blush)" },
} satisfies Record<Vibe, { icon: typeof Leaf; color: string }>;

export function VibeSelector({ value, onChange }: { value: Vibe; onChange: (value: Vibe) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-extrabold text-[var(--ink)]">Choose a vibe</legend>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {VIBES.map((vibe) => {
          const Icon = meta[vibe].icon;
          const selected = vibe === value;
          return (
            <button
              key={vibe}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(vibe)}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border px-3 text-sm font-bold transition-[background-color,border-color,box-shadow] duration-200"
              style={{
                background: selected ? meta[vibe].color : "white",
                borderColor: selected ? "var(--cherry)" : "var(--border)",
                boxShadow: selected ? "0 0 0 2px rgb(197 31 58 / 0.08)" : "none",
              }}
            >
              <Icon aria-hidden="true" size={17} />
              {vibe}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
