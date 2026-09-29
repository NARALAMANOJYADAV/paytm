import React from "react";

/**
 * Prompt to Production mark: a terminal prompt chevron followed by a solid
 * block, i.e. a prompt that ships as a product. The block takes the poster's gold.
 */
export function LogoMark({
  className = "w-10 h-10",
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const plate = tone === "dark" ? "#111113" : "#f5f4f0";
  const stroke = tone === "dark" ? "#ffffff" : "#111113";
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="10" fill={plate} />
      <path
        d="M10.5 13 L17.5 20 L10.5 27"
        fill="none"
        stroke={stroke}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="21" y="12.5" width="9" height="15" rx="1.6" fill="#f2b544" />
    </svg>
  );
}

/** Giant mark used as a graphic, sized by its container. */
export function LogoGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden="true" focusable="false">
      <path
        d="M6 8 L28 30 L6 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <rect x="36" y="6" width="22" height="48" fill="#f2b544" />
    </svg>
  );
}
