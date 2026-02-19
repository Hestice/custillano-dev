"use client";

import { useEffect, useState, useCallback } from "react";
import type { KeyboardState } from "./types";
import { touchInput } from "./touch-input";

export function useKeyboardControls() {
  const [keys, setKeys] = useState<KeyboardState>({});

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    setKeys((prev) => ({ ...prev, [event.key.toLowerCase()]: true }));
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setKeys((prev) => ({ ...prev, [event.key.toLowerCase()]: false }));
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return keys;
}

export function useCharacterControls() {
  const keys = useKeyboardControls();

  const getMovementDirection = useCallback(() => {
    const direction = { x: 0, z: 0 };

    if (keys["w"] || keys["W"]) {
      direction.z -= 1;
    }
    if (keys["s"] || keys["S"]) {
      direction.z += 1;
    }
    if (keys["a"] || keys["A"]) {
      direction.x -= 1;
    }
    if (keys["d"] || keys["D"]) {
      direction.x += 1;
    }

    // Merge touch joystick input
    direction.x += touchInput.x;
    direction.z += touchInput.z;

    const magnitude = Math.sqrt(direction.x ** 2 + direction.z ** 2);
    if (magnitude > 0) {
      direction.x /= magnitude;
      direction.z /= magnitude;
    }

    return direction;
  }, [keys]);

  return {
    keys,
    getMovementDirection,
    isMoving: (keys["w"] || keys["W"] || keys["s"] || keys["S"] || keys["a"] || keys["A"] || keys["d"] || keys["D"] || touchInput.x !== 0 || touchInput.z !== 0),
  };
}
