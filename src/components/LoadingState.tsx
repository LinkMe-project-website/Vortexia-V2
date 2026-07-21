import { useEffect, useState } from "react";

/**
 * [Bug fix, carried over from v1] v1 had screens that could hang on
 * "Loading…" forever if a request stalled (slow network, dropped
 * connection) — no bound on how long to wait. In v2, React Query already
 * surfaces `isError`, but a *stalled* (never resolving) request needs an
 * explicit timeout. This component wraps that pattern: shows a clear
 * "taking too long" message + Retry button instead of hanging silently.
 */
export function LoadingState({
  isLoading,
  isError,
  onRetry,
  timeoutMs = 8000,
  label = "This",
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  timeoutMs?: number;
  label?: string;
}) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) { setTimedOut(false); return; }
    const t = setTimeout(() => setTimedOut(true), timeoutMs);
    return () => clearTimeout(t);
  }, [isLoading, timeoutMs]);

  if (isError || timedOut) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center text-gray-500">
        <div>{label} took too long to load. Please check your connection.</div>
        <button onClick={onRetry} className="rounded-full bg-navy px-4 py-2 text-sm text-white">
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) return <div className="p-8 text-center text-gray-400">Loading…</div>;
  return null;
}
