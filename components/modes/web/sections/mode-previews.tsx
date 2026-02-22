"use client";

export function CliPreview() {
  return (
    <div className="flex h-full flex-col bg-[oklch(0.17_0_0)] p-3">
      {/* Title bar */}
      <div className="mb-3 flex items-center gap-1.5">
        <div className="size-2 rounded-full bg-[#ff5f57]" />
        <div className="size-2 rounded-full bg-[#febc2e]" />
        <div className="size-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[10px] text-white/30">
          ~/custillano.dev
        </span>
      </div>

      {/* Terminal lines */}
      <div className="flex flex-1 flex-col justify-center gap-2 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-green-400/70">$</span>
          <div className="h-2 w-20 rounded-sm bg-green-400/40" />
          <div className="h-2 w-12 rounded-sm bg-white/15" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/20">&gt;</span>
          <div className="h-2 w-32 rounded-sm bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/20">&gt;</span>
          <div className="h-2 w-24 rounded-sm bg-violet-400/25" />
          <div className="h-2 w-10 rounded-sm bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/20">&gt;</span>
          <div className="h-2 w-16 rounded-sm bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-green-400/70">$</span>
          <div
            className="h-3 w-1.5 bg-green-400/70"
            style={{ animation: "blink 1s step-end infinite" }}
          />
        </div>
      </div>
    </div>
  );
}

export function ImmersivePreview() {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-gradient-to-b from-[oklch(0.2_0.08_280)] to-[oklch(0.1_0.02_270)]">
      {/* Stars */}
      {[
        { top: "12%", left: "10%", opacity: 0.8, size: 2 },
        { top: "20%", left: "75%", opacity: 0.5, size: 1.5 },
        { top: "35%", left: "85%", opacity: 0.7, size: 2 },
        { top: "15%", left: "45%", opacity: 0.4, size: 1 },
        { top: "50%", left: "20%", opacity: 0.6, size: 1.5 },
        { top: "65%", left: "60%", opacity: 0.3, size: 1 },
        { top: "8%", left: "30%", opacity: 0.5, size: 1.5 },
        { top: "70%", left: "90%", opacity: 0.4, size: 2 },
        { top: "40%", left: "5%", opacity: 0.6, size: 1 },
        { top: "80%", left: "40%", opacity: 0.3, size: 1.5 },
      ].map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            opacity: star.opacity,
            width: star.size,
            height: star.size,
          }}
        />
      ))}

      {/* Planet - large with ring */}
      <div className="absolute bottom-4 left-6">
        <div className="relative size-10">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/40 to-indigo-700/30" />
          <div className="absolute -inset-1.5 rounded-full border border-white/10" />
        </div>
      </div>

      {/* Planet - small */}
      <div className="absolute right-10 top-6">
        <div className="size-4 rounded-full bg-gradient-to-br from-purple-400/30 to-fuchsia-600/20" />
      </div>

      {/* Rocket */}
      <div className="relative flex flex-col items-center">
        {/* Glow */}
        <div
          className="absolute -inset-6 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.6 0.2 290 / 0.2) 0%, transparent 70%)",
          }}
        />

        {/* Rocket body */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Nose cone */}
          <div
            className="h-3 w-4 bg-white/80"
            style={{
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            }}
          />
          {/* Body */}
          <div className="h-6 w-4 rounded-b-sm bg-gradient-to-b from-white/70 to-white/50" />
          {/* Fins */}
          <div className="flex -translate-y-1.5 items-end gap-0">
            <div
              className="h-3 w-2 bg-violet-400/60"
              style={{
                clipPath: "polygon(100% 0%, 0% 100%, 100% 100%)",
              }}
            />
            <div className="h-0 w-4" />
            <div
              className="h-3 w-2 bg-violet-400/60"
              style={{
                clipPath: "polygon(0% 0%, 0% 100%, 100% 100%)",
              }}
            />
          </div>

          {/* Flame */}
          <div className="-mt-1.5 flex flex-col items-center">
            <div
              className="h-4 w-2.5 bg-gradient-to-b from-amber-400/80 to-orange-500/60"
              style={{
                clipPath: "polygon(20% 0%, 80% 0%, 100% 50%, 50% 100%, 0% 50%)",
              }}
            />
            <div
              className="-mt-1 h-3 w-1.5 bg-gradient-to-b from-orange-500/40 to-transparent"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
