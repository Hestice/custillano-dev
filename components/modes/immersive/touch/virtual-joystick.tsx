"use client";

import { useCallback, useRef } from "react";
import { touchInput } from "@/lib/three/touch-input";

const BASE_SIZE = 120;
const KNOB_SIZE = 48;
const MAX_RADIUS = (BASE_SIZE - KNOB_SIZE) / 2;

export function VirtualJoystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeTouch = useRef<number | null>(null);

  const updateKnob = useCallback((dx: number, dz: number) => {
    if (!knobRef.current) return;
    knobRef.current.style.transform = `translate(${dx}px, ${dz}px)`;
  }, []);

  const reset = useCallback(() => {
    touchInput.x = 0;
    touchInput.z = 0;
    activeTouch.current = null;
    updateKnob(0, 0);
  }, [updateKnob]);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!baseRef.current) return;
      const rect = baseRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      let dx = clientX - cx;
      let dy = clientY - cy;

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MAX_RADIUS) {
        dx = (dx / dist) * MAX_RADIUS;
        dy = (dy / dist) * MAX_RADIUS;
      }

      // Normalize to -1..1
      touchInput.x = dx / MAX_RADIUS;
      touchInput.z = dy / MAX_RADIUS;

      updateKnob(dx, dy);
    },
    [updateKnob]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (activeTouch.current !== null) return;
      const touch = e.changedTouches[0];
      activeTouch.current = touch.identifier;
      handleMove(touch.clientX, touch.clientY);
    },
    [handleMove]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouch.current) {
          handleMove(touch.clientX, touch.clientY);
          break;
        }
      }
    },
    [handleMove]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouch.current) {
          reset();
          break;
        }
      }
    },
    [reset]
  );

  return (
    <div
      ref={baseRef}
      className="absolute bottom-8 left-8 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
      style={{ width: BASE_SIZE, height: BASE_SIZE }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div
        ref={knobRef}
        className="absolute left-1/2 top-1/2 -ml-6 -mt-6 rounded-full border border-white/30 bg-white/20"
        style={{ width: KNOB_SIZE, height: KNOB_SIZE }}
      />
    </div>
  );
}
