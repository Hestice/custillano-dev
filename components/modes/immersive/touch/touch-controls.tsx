"use client";

import { useTouchDevice } from "@/lib/hooks/use-touch-device";
import { useStory } from "@/components/modes/immersive/state/story-context";
import { VirtualJoystick } from "./virtual-joystick";

export function TouchControls() {
  const isTouch = useTouchDevice();
  const { state } = useStory();

  if (!isTouch) return null;

  const showJoystick =
    state.phase === "exploring" || state.phase === "complete";

  if (!showJoystick) return null;

  return (
    <div className="pointer-events-auto">
      <VirtualJoystick />
    </div>
  );
}
