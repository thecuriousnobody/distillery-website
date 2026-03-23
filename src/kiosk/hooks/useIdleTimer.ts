import { useEffect, useRef } from "react";

/**
 * Calls `onIdle` after `timeout` ms of inactivity.
 * Only active when `enabled` is true.
 */
export function useIdleTimer(
  onIdle: () => void,
  timeout: number,
  enabled: boolean
) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!enabled) return;

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onIdleRef.current(), timeout);
    };

    reset();

    const events = ["mousedown", "keydown", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, reset));

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeout, enabled]);
}
