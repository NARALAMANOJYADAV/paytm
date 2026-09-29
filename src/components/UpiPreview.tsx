"use client";

import React, { useEffect, useState } from "react";
import { generateQrDataUrl, getUpiPaymentUri } from "@/lib/qr";

/** Live preview of the exact UPI QR participants will scan for a given fee. */
export default function UpiPreview({ upiId, payeeName, amount, label }: { upiId: string; payeeName: string; amount: number; label: string }) {
  const [src, setSrc] = useState("");
  const valid = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/.test(upiId.trim());
  useEffect(() => {
    let alive = true;
    if (!valid) return;
    const uri = getUpiPaymentUri({ upiId: upiId.trim(), payeeName: payeeName.trim() || "NBKRIST", amount, transactionNote: "P2P Test Student 9876543210" });
    generateQrDataUrl(uri).then((d) => alive && setSrc(d));
    return () => {
      alive = false;
    };
  }, [upiId, payeeName, amount, valid]);
  return (
    <figure className="rounded-xl border border-line bg-paper p-4 text-center">
      <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-lg bg-white">
        {valid && src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`UPI QR preview for ₹${amount}`} className="h-full w-full object-contain" />
        ) : (
          <span className="px-3 text-xs text-ink-3">Enter a valid UPI ID to preview</span>
        )}
      </div>
      <figcaption className="mt-3 text-sm">
        <span className="font-semibold">{label}</span> <span className="num text-ink-2">₹{amount}</span>
      </figcaption>
    </figure>
  );
}
