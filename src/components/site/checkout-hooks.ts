"use client";

/**
 * Timing helpers shared by checkout, payment, branch confirmation and tracking.
 *
 * Nothing here talks to a network. `sim.fastForward` compresses simulated time
 * 15× so a reviewer can watch a 5-minute rule play out in about 20 seconds,
 * while the copy on screen always states the real rule.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export const FAST_FORWARD = 15;

/** Real milliseconds to wait for `seconds` of simulated time. */
export function scaledMs(seconds: number, fastForward: boolean, minMs = 0): number {
  const ms = (seconds * 1000) / (fastForward ? FAST_FORWARD : 1);
  return Math.max(minMs, ms);
}

/**
 * Counts simulated seconds down to zero. Restart by changing `restartKey`.
 * Returns the seconds remaining so callers can render `countdown()`.
 */
export function useCountdown({
  seconds,
  fastForward,
  running = true,
  restartKey = 0,
  onComplete,
}: {
  seconds: number;
  fastForward: boolean;
  running?: boolean;
  restartKey?: number;
  onComplete?: () => void;
}): number {
  const [remaining, setRemaining] = useState(seconds);
  const done = useRef(false);
  const complete = useRef(onComplete);
  complete.current = onComplete;

  useEffect(() => {
    setRemaining(seconds);
    done.current = false;
  }, [seconds, restartKey]);

  useEffect(() => {
    if (!running) return;
    const tick = Math.max(16, 1000 / (fastForward ? FAST_FORWARD : 1));
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (!done.current) {
            done.current = true;
            complete.current?.();
          }
          return 0;
        }
        return r - 1;
      });
    }, tick);
    return () => window.clearInterval(id);
  }, [running, fastForward, restartKey, seconds]);

  return remaining;
}

/** One-shot simulated delay. Returns a `start` function; cancels on unmount. */
export function useDelayedStep(): (fn: () => void, ms: number) => void {
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  return useCallback((fn: () => void, ms: number) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  }, []);
}

/** Local clock label, e.g. "19:04". */
export function clockLabel(date: Date = new Date()): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
