"use client";

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  CameraOff,
  RefreshCw,
  UserCheck,
  Lock,
} from "lucide-react";
import { processCheckIn, useStore, type CheckInResult } from "@/lib/store";
import { useAuth } from "@/lib/context/AuthContext";
import type { CoordinatorPermission } from "@/lib/types";

// Minimal typing for the Shape Detection API (not yet in TypeScript's DOM lib).
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
interface BarcodeDetectorCtor {
  new (options?: { formats?: string[] }): BarcodeDetectorLike;
  getSupportedFormats?: () => Promise<string[]>;
}
const getBarcodeDetector = (): BarcodeDetectorCtor | undefined =>
  typeof window === "undefined"
    ? undefined
    : (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;

const noopSubscribe = () => () => {};

const SCAN_INTERVAL_MS = 150;
const SAME_CODE_DEBOUNCE_MS = 3000;

export default function CheckinVerificationPage() {
  const { role, permissions } = useAuth();
  const can = (p: CoordinatorPermission) => role === "admin" || permissions.includes(p);
  const canManage = can("CHECKIN_MANAGE");
  const canSeeRegistrations = can("CHECKIN_VIEW") || can("PARTICIPANT_VIEW") || can("REGISTRATION_VERIFY");

  const store = useStore();
  const checkedIn = store.attendance.length;
  const total = store.registrations.filter((r) => r.registration_status === "confirmed").length;
  const recent = store.attendance.slice(0, 8);
  const remaining = Math.max(0, total - checkedIn);

  const [inputQuery, setInputQuery] = useState("");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Increments per scan so the result plane re-plays its wipe even for repeat outcomes.
  const [scanSeq, setScanSeq] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  // Camera state
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  // null during server render; true/false once hydrated in the browser.
  const detectorSupported = useSyncExternalStore<boolean | null>(
    noopSubscribe,
    () => !!navigator.mediaDevices?.getUserMedia,
    () => null
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busyRef = useRef(false);
  const lastScanRef = useRef<{ code: string; at: number } | null>(null);

  // Audio chime feedback
  const playSound = (type: "success" | "warning" | "error") => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        // High pleasant double ding
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "warning") {
        // Low cautionary double buzz
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(260, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // Error drop
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(140, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.45);
      }
      osc.onended = () => void ctx.close().catch(() => undefined);
    } catch {}
  };

  const handleVerify = async (tokenOrId: string) => {
    const query = tokenOrId.trim();
    if (!query || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const res = await processCheckIn(query);
      setRequestError(null);
      setResult(res);
      setScanSeq((n) => n + 1);
      playSound(res.status === "verified" ? "success" : res.status === "already_checked_in" ? "warning" : "error");
    } catch (err) {
      setResult(null);
      setRequestError(err instanceof Error ? err.message : "Check-in failed. Try again.");
      playSound("error");
    } finally {
      busyRef.current = false;
      setBusy(false);
      // Bring the verdict into view if the coordinator is scrolled down (phones).
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ block: "nearest" }));
    }
  };

  // Detection loop reads the latest handler through a ref so it never runs a stale closure.
  const verifyRef = useRef(handleVerify);
  useEffect(() => {
    verifyRef.current = handleVerify;
  });

  const onDetected = useCallback((raw: string) => {
    const code = raw.trim();
    if (!code) return;
    const now = Date.now();
    const last = lastScanRef.current;
    if (last && last.code === code && now - last.at < SAME_CODE_DEBOUNCE_MS) {
      // Same ticket still in front of the lens: keep extending the quiet window.
      lastScanRef.current = { code, at: now };
      return;
    }
    if (busyRef.current) return;
    lastScanRef.current = { code, at: now };
    void verifyRef.current(code);
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsScanning(false);
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is unavailable (it needs HTTPS). Use manual Registration ID entry.");
      return;
    }
    setCameraStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      lastScanRef.current = null;
      setIsScanning(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setCameraError(
        name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access in the browser, or use manual entry."
          : name === "NotFoundError"
          ? "No camera was found on this device. Use manual Registration ID entry."
          : "Could not start the camera. Use manual Registration ID entry."
      );
    } finally {
      setCameraStarting(false);
    }
  };

  // Attach the stream and run the detection loop while scanning.
  useEffect(() => {
    if (!isScanning) return;
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    video.play().catch(() => undefined);
    let cancelled = false;
    let timer: number | undefined;

    // Native BarcodeDetector (Chrome on Android/ChromeOS/macOS) is fastest; everything else
    // (iPhone Safari/Chrome, Windows, Firefox) decodes frames with jsQR on a canvas.
    let decode: (() => Promise<string | null>) | null = null;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const setup = async () => {
      const Detector = getBarcodeDetector();
      if (Detector) {
        const formats = Detector.getSupportedFormats ? await Detector.getSupportedFormats().catch(() => []) : ["qr_code"];
        if (formats.includes("qr_code")) {
          const detector = new Detector({ formats: ["qr_code"] });
          decode = async () => (await detector.detect(video)).find((c) => c.rawValue)?.rawValue ?? null;
          return;
        }
      }
      const { default: jsQR } = await import("jsqr");
      decode = async () => {
        if (!ctx || !video.videoWidth) return null;
        const scale = Math.min(1, 640 / video.videoWidth); // downscale for speed on phones
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" })?.data ?? null;
      };
    };

    const tick = async () => {
      if (cancelled) return;
      if (decode && video.readyState >= 2 && !busyRef.current) {
        try {
          const raw = await decode();
          if (raw && !cancelled) onDetected(raw);
        } catch {
          // A frame can fail to decode; keep looping.
        }
      }
      if (!cancelled) timer = window.setTimeout(tick, SCAN_INTERVAL_MS);
    };
    void setup().then(tick);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [isScanning, onDetected]);

  // Release the camera when leaving the page.
  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleVerify(inputQuery);
  };

  // State reads from line form as well as hue: solid = in, dashed = duplicate, double = invalid.
  const verdict = result
    ? result.status === "verified"
      ? {
          frame: "border-4 border-solid border-ok",
          plane: "plane-ok",
          Icon: CheckCircle2,
          headline: "CHECKED IN",
        }
      : result.status === "already_checked_in"
      ? {
          frame: "border-4 border-dashed border-sun",
          plane: "plane-sun",
          Icon: AlertTriangle,
          headline: "ALREADY CHECKED IN",
        }
      : {
          frame: "border-[6px] border-double border-alert",
          plane: "plane-alert",
          Icon: XCircle,
          headline: "INVALID TICKET",
        }
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header plane */}
      <header className="frame bg-paper p-5 sm:p-6 space-y-1">
        <h1 className="page-title">Ticket Check-in Verification</h1>
        <p className="text-sm text-ink-2">
          Scan participant QR or enter Registration ID for tamper-evident admission.
        </p>
      </header>

      {/* Live counters */}
      <div className="planes grid-cols-3" aria-live="polite">
        <div className="p-4 sm:p-5">
          <span className="cell-label block">Checked in</span>
          <span className="display num text-3xl sm:text-5xl block mt-1">{checkedIn}</span>
        </div>
        <div className="p-4 sm:p-5">
          <span className="cell-label block">Total</span>
          <span className="display num text-3xl sm:text-5xl block mt-1">{canSeeRegistrations ? total : "–"}</span>
        </div>
        <div className="p-4 sm:p-5">
          <span className="cell-label block">Remaining</span>
          <span className="display num text-3xl sm:text-5xl block mt-1">{canSeeRegistrations ? remaining : "–"}</span>
        </div>
      </div>

      {canManage ? (
        <>
          {/* Verification result: full-width, unmistakable */}
          <section aria-labelledby="result-heading" className="scroll-mt-4" ref={resultRef}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 id="result-heading" className="text-xl font-semibold wide">
                Verification Result
              </h2>
              {(result || requestError) && (
                <button
                  onClick={() => {
                    setResult(null);
                    setRequestError(null);
                  }}
                  className="btn btn-sm min-h-[44px]"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Clear
                </button>
              )}
            </div>

            <div role="status" aria-live="assertive" aria-atomic="true">
              {requestError ? (
                <div className="border-[6px] border-double border-alert bg-paper p-6 sm:p-8 flex items-start gap-4">
                  <XCircle className="w-10 h-10 text-alert shrink-0" aria-hidden="true" />
                  <div className="space-y-1 min-w-0">
                    <p className="text-lg font-semibold wide">Check-in request failed</p>
                    <p className="text-sm text-alert break-words">{requestError}</p>
                  </div>
                </div>
              ) : result && verdict ? (
                <div key={scanSeq} className={`${verdict.frame} bg-paper p-1.5 space-y-1.5`}>
                  <div className={`${verdict.plane} slide-in p-5 sm:p-8 flex items-start gap-4 sm:gap-6`}>
                    <verdict.Icon className="w-12 h-12 sm:w-20 sm:h-20 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                    <div className="min-w-0 space-y-2">
                      <p className="display text-3xl sm:text-6xl">{verdict.headline}</p>
                      {result.status === "verified" && result.participant && (
                        <p className="text-2xl sm:text-4xl font-semibold wide break-words">
                          {result.participant.name}
                        </p>
                      )}
                      {result.status === "already_checked_in" && result.participant && (
                        <p className="text-2xl sm:text-4xl font-semibold wide break-words">
                          {result.participant.name} ·{" "}
                          <span className="num">
                            {result.participant.firstCheckInTime || result.participant.checkInTime}
                          </span>
                        </p>
                      )}
                      {result.status === "invalid" && result.participant && (
                        <p className="text-2xl sm:text-4xl font-semibold wide break-words">
                          {result.participant.name}
                        </p>
                      )}
                      <p className="text-base sm:text-lg font-semibold">{result.message}</p>
                    </div>
                  </div>

                  {/* Basic participant details (no private passwords/emails exposed) */}
                  {result.participant && (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-line border border-line">
                      <div className="bg-paper p-4">
                        <span className="cell-label block">Registration ID</span>
                        <span className="font-mono font-bold text-ink break-all">
                          {result.participant.registrationNumber}
                        </span>
                      </div>
                      <div className="bg-paper p-4">
                        <span className="cell-label block">Roll Number</span>
                        <span className="font-mono font-bold text-ink">{result.participant.rollNumber}</span>
                      </div>
                      <div className="bg-paper p-4">
                        <span className="cell-label block">Branch &amp; Year</span>
                        <span className="text-ink">
                          {result.participant.branch} · {result.participant.year} (Sec {result.participant.section})
                        </span>
                      </div>
                      <div className="bg-paper p-4">
                        <span className="cell-label block">ISTE Status</span>
                        <span className={`tag ${result.participant.isteMember ? "tag-ok" : "tag-info"}`}>
                          {result.participant.isteMember ? "ISTE Member" : "Non-ISTE"}
                        </span>
                      </div>
                      <div className="bg-paper p-4 col-span-2 lg:col-span-1">
                        <span className="cell-label block">Timestamp</span>
                        <span className="font-mono font-bold text-ink">
                          {result.participant.firstCheckInTime || result.participant.checkInTime || "—"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="frame bg-paper p-6 sm:p-8 flex items-center gap-4">
                  <UserCheck className="w-10 h-10 text-ink-3 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-lg font-semibold wide">{busy ? "Verifying ticket…" : "Awaiting Scanner Input"}</p>
                    <p className="text-sm text-ink-2">
                      Scan or enter ticket code to view participant verification details.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Camera scanner */}
            <section className="lg:col-span-7 frame bg-paper" aria-labelledby="scanner-heading">
              <div className="flex items-center justify-between gap-3 p-4 rule-b">
                <h2 id="scanner-heading" className="font-semibold flex items-center gap-2">
                  <Camera className="w-5 h-5 text-ink-2" aria-hidden="true" />
                  Live Camera Scanner
                </h2>
                {detectorSupported !== false && (
                  <button
                    onClick={() => (isScanning ? stopCamera() : void startCamera())}
                    disabled={cameraStarting}
                    aria-busy={cameraStarting}
                    className={`btn ${isScanning ? "btn-danger" : ""}`}
                    aria-pressed={isScanning}
                  >
                    {cameraStarting ? "Starting…" : isScanning ? "Stop Camera" : "Start Camera"}
                  </button>
                )}
              </div>

              {/* Viewfinder */}
              <div
                className={`relative aspect-[4/3] sm:aspect-video overflow-hidden flex flex-col items-center justify-center text-center ${
                  isScanning ? "plane-ink" : "bg-field text-ink p-6"
                }`}
              >
                {isScanning ? (
                  <>
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      playsInline
                      aria-label="Camera preview"
                    />
                    <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center" aria-hidden="true">
                      {/* Corner brackets */}
                      <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
                      <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
                      <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
                      <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
                      <span className="absolute inset-x-3 top-1/2 h-1 bg-sky edge-in" />
                    </div>
                    <p className="absolute bottom-3 inset-x-3 text-sm text-white font-semibold">
                      {busy ? "Verifying…" : "Scanning active · Hold ticket steady in front of lens"}
                    </p>
                  </>
                ) : detectorSupported === false ? (
                  <div className="space-y-3">
                    <CameraOff className="w-14 h-14 text-ink-2 mx-auto" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Camera isn&apos;t available here</p>
                      <p className="text-sm text-ink-2 mt-0.5">
                        The camera needs the site to be opened over HTTPS and camera permission. Use manual Registration ID entry meanwhile.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <QrCode className="w-14 h-14 text-ink-2 mx-auto" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Camera Viewfinder Ready</p>
                      <p className="text-sm text-ink-2 mt-0.5">
                        Click &quot;Start Camera&quot; or type registration code below
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {cameraError && (
                <p className="p-4 rule-t text-sm text-alert" role="alert">
                  {cameraError}
                </p>
              )}
            </section>

            <div className="lg:col-span-5 space-y-6">
              {/* Manual entry */}
              <form onSubmit={handleFormSubmit} className="frame bg-paper p-5 space-y-3">
                <label htmlFor="manual-ticket" className="field-label">
                  Manual Registration ID Lookup
                </label>
                <div className="relative">
                  <Search className="w-5 h-5 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="manual-ticket"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    placeholder="e.g. P2P-2026-A8F92X"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value.toUpperCase())}
                    className="field font-mono uppercase text-lg min-h-[56px] pl-11"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy || !inputQuery.trim()}
                  aria-busy={busy}
                  className="btn btn-primary btn-lg w-full"
                >
                  <UserCheck className="w-5 h-5" aria-hidden="true" />
                  {busy ? "Verifying…" : "Verify"}
                </button>
              </form>
            </div>
          </div>
        </>
      ) : (
        <div className="frame bg-paper p-5 flex items-start gap-3">
          <Lock className="w-5 h-5 text-ink-2 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-ink-2">
            You can view gate activity, but scanning tickets needs the check-in manage permission. Ask the event admin
            to enable it.
          </p>
        </div>
      )}

      {/* Recent check-ins */}
      <section className="frame bg-paper" aria-labelledby="recent-heading">
        <div className="p-5 rule-b">
          <h2 id="recent-heading" className="text-xl font-semibold wide">
            Recent Check-ins
          </h2>
        </div>
        {recent.length === 0 ? (
          <p className="p-5 text-sm text-ink-2">No check-ins recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-planes">
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Participant</th>
                  <th scope="col">Registration ID</th>
                  <th scope="col">Checked in by</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id}>
                    <td className="font-mono font-bold whitespace-nowrap">{a.check_in_time}</td>
                    <td>
                      <span className="font-bold block">{a.participant_name}</span>
                      <span className="text-xs text-ink-2">
                        {a.roll_number} · {a.branch}
                      </span>
                    </td>
                    <td className="font-mono text-xs whitespace-nowrap">{a.registration_number}</td>
                    <td className="text-ink-2 whitespace-nowrap">{a.checked_in_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
