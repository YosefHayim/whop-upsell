"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseExitIntentOptions {
  onTrigger: () => void;
  inactivityDelay?: number; // milliseconds
  mouseThreshold?: number; // pixels from top
}

/**
 * Custom hook to detect exit intent in an iframe environment.
 * Uses hybrid detection: mouse movement towards top + inactivity fallback.
 */
export function useExitIntent({
  onTrigger,
  inactivityDelay = 20000, // 20 seconds default
  mouseThreshold = 50, // 50px from top
}: UseExitIntentOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const hasTriggeredRef = useRef<boolean>(false);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    lastActivityRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onTrigger();
      }
    }, inactivityDelay);
  }, [onTrigger, inactivityDelay]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Reset activity timestamp
      lastActivityRef.current = Date.now();

      // Check for rapid upward movement (exit intent)
      if (e.clientY < mouseThreshold && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onTrigger();
        return;
      }

      // Reset inactivity timer on any mouse movement
      resetTimer();
    },
    [onTrigger, mouseThreshold, resetTimer]
  );

  const handleScroll = useCallback(() => {
    lastActivityRef.current = Date.now();
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Start the inactivity timer
    resetTimer();

    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [handleMouseMove, handleScroll, resetTimer]);
}

