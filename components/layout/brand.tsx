import Link from "next/link";
import { TextCursorInput } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="PinTextAI home" className="inline-flex min-h-11 items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-[13px] bg-[var(--cherry)] text-white shadow-[0_6px_16px_rgb(197_31_58_/_0.2)]">
        <TextCursorInput aria-hidden="true" size={19} strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="text-[19px] font-extrabold tracking-[-0.035em] text-[var(--ink)]">
          PinText<span className="text-[var(--cherry)]">AI</span>
        </span>
      )}
    </Link>
  );
}
