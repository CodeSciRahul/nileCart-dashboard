import { useState, useEffect, useCallback, useRef } from "react";

export const RESEND_COOLDOWN_SECONDS = 30;

export function useResendCooldown(durationSeconds = RESEND_COOLDOWN_SECONDS) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startCooldown = useCallback(() => {
    setSecondsLeft(durationSeconds);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [durationSeconds]);

  return {
    secondsLeft,
    isCoolingDown: secondsLeft > 0,
    startCooldown,
  };
}
