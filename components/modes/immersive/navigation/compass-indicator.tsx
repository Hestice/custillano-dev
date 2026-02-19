"use client";

export function CompassOverlay({
  indicator,
}: {
  indicator: {
    visible: boolean;
    x: number;
    y: number;
    angle: number;
    name: string;
    distance: number;
  };
}) {
  if (!indicator.visible) return null;

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{
        left: `${indicator.x}%`,
        top: `${indicator.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="flex flex-col items-center gap-1">
        <div
          className="w-3 h-3 border-2 border-blue-400 bg-blue-400/30"
          style={{
            transform: `rotate(${indicator.angle + 90}deg)`,
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          }}
        />
        <span className="text-[9px] text-blue-400 font-mono whitespace-nowrap">
          {indicator.name} ({indicator.distance}m)
        </span>
      </div>
    </div>
  );
}
