"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminCertificatesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-2">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-slate-400">Redirecting to Admin Executive Dashboard...</p>
    </div>
  );
}
