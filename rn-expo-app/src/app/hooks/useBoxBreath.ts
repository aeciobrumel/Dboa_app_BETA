import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

export type BoxBreathPhase = 'inspire' | 'segura' | 'expire' | 'segura2' | 'done';

const PHASE_DURATION_MS = 4000;

export function useBoxBreath(cycles: number) {
  const [phase, setPhase] = useState<BoxBreathPhase>('inspire');
  const [cycle, setCycle] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runIdRef = useRef(0);

  const clearCurrentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const cancelCurrentRun = useCallback(() => {
    runIdRef.current += 1;
    clearCurrentTimeout();
  }, [clearCurrentTimeout]);

  const stop = useCallback(() => {
    cancelCurrentRun();
    setPhase('done');
    setIsRunning(false);
  }, [cancelCurrentRun]);

  const wait = useCallback(
    (duration: number, runId: number) =>
      new Promise<boolean>(resolve => {
        clearCurrentTimeout();
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          resolve(runIdRef.current === runId);
        }, duration);
      }),
    [clearCurrentTimeout]
  );

  const start = useCallback(async () => {
    cancelCurrentRun();

    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    setCycle(0);
    setPhase('inspire');
    setIsRunning(true);

    try {
      for (let currentCycle = 1; currentCycle <= cycles; currentCycle += 1) {
        if (runIdRef.current !== runId) {
          return;
        }

        setCycle(currentCycle);

        setPhase('inspire');
        AccessibilityInfo.announceForAccessibility(`Ciclo ${currentCycle}. Inspirar`);
        Haptics.selectionAsync();
        if (!(await wait(PHASE_DURATION_MS, runId))) {
          return;
        }

        setPhase('segura');
        AccessibilityInfo.announceForAccessibility('Segurar');
        Haptics.selectionAsync();
        if (!(await wait(PHASE_DURATION_MS, runId))) {
          return;
        }

        setPhase('expire');
        AccessibilityInfo.announceForAccessibility('Expirar');
        Haptics.selectionAsync();
        if (!(await wait(PHASE_DURATION_MS, runId))) {
          return;
        }

        setPhase('segura2');
        AccessibilityInfo.announceForAccessibility('Segurar');
        Haptics.selectionAsync();
        if (!(await wait(PHASE_DURATION_MS, runId))) {
          return;
        }
      }

      if (runIdRef.current !== runId) {
        return;
      }

      setPhase('done');
      setIsRunning(false);
      AccessibilityInfo.announceForAccessibility('Exercício concluído');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      if (runIdRef.current === runId) {
        setPhase('done');
        setIsRunning(false);
      }
    }
  }, [cancelCurrentRun, cycles, wait]);

  useEffect(() => stop, [stop]);

  return {
    phase,
    cycle,
    isRunning,
    start,
    stop,
  };
}
