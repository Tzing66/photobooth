// Darkroom: black room, safelight-red neon edges, film sprockets, monospace labels.

import type { ReactNode } from "react";
import type { ThemeKit } from "./types";
import { ArrowDown, BackIcon, EXT, STEPS, ScissorsIcon, Svg } from "./shared";

const RED = "#ff3b2f";
const DIM = "#5a1712";
const AMBER = "#ffb000";
const BLACK = "#0a0707";
const mono = { fontFamily: "Space Mono", fontWeight: 700 };
const glow = (px = 10) => ({ boxShadow: `0 0 ${px}px rgba(255,59,47,.45), inset 0 0 ${px / 2}px rgba(255,59,47,.25)` });

function GlowDefs() {
  return (
    <filter id="neon" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.2" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

function Sprockets({ x, y, h, gap = 12 }: { x: number; y: number; h: number; gap?: number }) {
  const holes = [];
  for (let yy = y; yy < y + h - 6; yy += gap) holes.push(<rect key={yy} x={x} y={yy} width="6" height="7" rx="1.2" fill={BLACK} stroke={DIM} strokeWidth="0.8" />);
  return <>{holes}</>;
}

function ExteriorArt() {
  const { featured: f, door: d } = EXT;
  return (
    <Svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full">
      <defs>
        <GlowDefs />
        <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff6a55" />
          <stop offset="1" stopColor={RED} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dr-curtain" x1="0" x2="10" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
          <stop offset="0" stopColor="#120b0a" />
          <stop offset="0.5" stopColor="#2a1311" />
          <stop offset="1" stopColor="#120b0a" />
        </linearGradient>
      </defs>

      {/* hanging safelight */}
      <line x1="150" y1="0" x2="150" y2="10" stroke={DIM} strokeWidth="1.5" />
      <g className="anim-flicker">
        <circle cx="150" cy="16" r="26" fill="url(#lamp)" opacity="0.6" />
        <path d="M138 10 h24 l4 10 h-32 z" fill={RED} filter="url(#neon)" />
      </g>

      {/* cabinet */}
      <rect x="22" y="80" width="256" height="292" fill="#120c0b" stroke={RED} strokeWidth="1.5" filter="url(#neon)" />
      <rect x="22" y="80" width="14" height="292" fill="#1c1110" />
      <Sprockets x={26} y={86} h={284} />
      <rect x="264" y="80" width="14" height="292" fill="#1c1110" />
      <Sprockets x={268} y={86} h={284} />

      {/* sign */}
      <rect x="44" y="40" width="212" height="32" fill={BLACK} stroke={RED} strokeWidth="1.2" filter="url(#neon)" />
      <text x="150" y="62" textAnchor="middle" fontSize="16" letterSpacing="6" fill={RED} filter="url(#neon)" className="anim-flicker" {...mono}>
        DARKROOM
      </text>

      {/* contact sheet */}
      <text x={f.x + f.w / 2 + 4} y={f.y - 8} textAnchor="middle" fontSize="6.5" letterSpacing="2" fill={AMBER} {...mono}>
        CONTACT SHEET
      </text>
      <rect x={f.x - 3} y={f.y - 3} width={f.w + 6} height={f.h + 6} fill="#1a100f" stroke={DIM} strokeWidth="1" />
      {[0, 1, 2, 3, 4].map((i) => (
        <text key={i} x={f.x + 6 + i * 21} y={f.y + f.h + 12} fontSize="5" fill={DIM} {...mono}>
          {`${12 + i}A`}
        </text>
      ))}

      {/* labels */}
      <text x="88" y="250" textAnchor="middle" fontSize="8" fill={RED} letterSpacing="1.5" {...mono}>
        ISO 400 · 4 EXP
      </text>
      <rect x="44" y="262" width="88" height="40" fill="none" stroke={DIM} strokeDasharray="3 2" />
      <text x="88" y="279" textAnchor="middle" fontSize="6.5" fill={AMBER} {...mono}>
        DEVELOPING
      </text>
      <text x="88" y="292" textAnchor="middle" fontSize="6.5" fill={AMBER} {...mono}>
        TIME ≈ 5 SEC
      </text>
      <circle cx="88" cy="330" r="14" fill="none" stroke={RED} strokeWidth="1.2" filter="url(#neon)" />
      <path d="M88 320 v10 l7 5" stroke={RED} strokeWidth="1.2" fill="none" />

      {/* doorway */}
      <rect x={d.x} y={d.y} width={d.w} height={d.h} fill={BLACK} stroke={RED} strokeWidth="1.5" filter="url(#neon)" />
      <path
        d={`M${d.x + 2} ${d.y + 2} H${d.x + d.w - 2} V${d.y + d.h - 2} H${d.x + 64} Q${d.x + 50} ${d.y + 130} ${d.x + 30} ${d.y + 2} Z`}
        fill="url(#dr-curtain)"
      />
      <rect x={d.x + 30} y={d.y - 16} width={d.w - 60} height="11" fill={BLACK} stroke={RED} strokeWidth="1" />
      <text x={d.x + d.w / 2} y={d.y - 8} textAnchor="middle" fontSize="6.5" letterSpacing="2" fill={RED} className="anim-flicker" {...mono}>
        IN USE
      </text>
    </Svg>
  );
}

function Lightbox() {
  return (
    <Svg viewBox="0 0 600 160" className="h-full w-full">
      <defs>
        <GlowDefs />
      </defs>
      <rect x="10" y="20" width="580" height="120" fill={BLACK} stroke={RED} strokeWidth="2" filter="url(#neon)" />
      {Array.from({ length: 24 }, (_, i) => (
        <g key={i}>
          <rect x={22 + i * 23.5} y="28" width="10" height="9" rx="2" fill="#1c1110" />
          <rect x={22 + i * 23.5} y="123" width="10" height="9" rx="2" fill="#1c1110" />
        </g>
      ))}
      <text x="300" y="98" textAnchor="middle" fontSize="44" letterSpacing="14" fill={RED} filter="url(#neon)" className="anim-flicker" {...mono}>
        DARKROOM
      </text>
      <text x="300" y="116" textAnchor="middle" fontSize="11" letterSpacing="5" fill={AMBER} {...mono}>
        SAFELIGHT ON · DO NOT OPEN
      </text>
    </Svg>
  );
}

function ScreenBezel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 border bg-[#120c0b] px-[11%] py-[8%]" style={{ borderColor: RED, ...glow(18) }}>
      <div className="absolute inset-y-[4%] left-[2.5%] flex w-[5%] flex-col justify-between">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="block aspect-[6/7] w-full rounded-[2px] bg-black" style={{ outline: `1px solid ${DIM}` }} />
        ))}
      </div>
      <div className="absolute inset-y-[4%] right-[2.5%] flex w-[5%] flex-col justify-between">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="block aspect-[6/7] w-full rounded-[2px] bg-black" style={{ outline: `1px solid ${DIM}` }} />
        ))}
      </div>
      <span className="absolute left-[11%] top-[2%] text-[9px] tracking-widest" style={{ color: AMBER }}>
        ▶ 24A
      </span>
      <span className="absolute bottom-[2%] right-[11%] text-[9px] tracking-widest" style={{ color: AMBER }}>
        KODAK 400TX
      </span>
      <div className="relative h-full w-full overflow-hidden bg-black">{children}</div>
    </div>
  );
}

function PriceSticker() {
  return (
    <div className="border px-1.5 py-2 text-center text-[9px] leading-snug tracking-wider md:text-[11px]" style={{ borderColor: AMBER, color: AMBER }}>
      ISO
      <div className="text-lg leading-none md:text-xl">400</div>
      B&W/C-41
    </div>
  );
}

function Instructions() {
  return (
    <div className="card px-3 py-2 text-[10px] leading-relaxed tracking-wide md:text-xs">
      <div className="mb-1 tracking-[0.3em]" style={{ color: AMBER }}>
        // PROCESS
      </div>
      {STEPS.map((s, i) => (
        <div key={s}>
          <span style={{ color: RED }}>0{i + 1}</span> {s.toUpperCase()}
        </div>
      ))}
    </div>
  );
}

function CoinPanel({ onClick, go, label }: { onClick?: () => void; go: boolean; label: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-xs tracking-[0.3em] transition-opacity md:text-sm ${label ? "opacity-100" : "opacity-0"}`} style={{ color: RED, textShadow: `0 0 8px ${RED}` }}>
        {(label ?? "·").toUpperCase()}
      </span>
      <div className="flex w-16 flex-col items-center gap-2 border bg-[#120c0b] px-2 py-3 md:w-20" style={{ borderColor: DIM }}>
        <span className="text-[8px] tracking-widest" style={{ color: AMBER }}>
          SHUTTER
        </span>
        <button
          onClick={onClick}
          aria-label={label ?? "button"}
          className={`h-10 w-10 rounded-full border-2 transition-all active:scale-90 md:h-12 md:w-12 ${go ? "press-me" : ""}`}
          style={{
            borderColor: go ? RED : DIM,
            background: go ? `radial-gradient(circle, ${RED} 30%, #7a140d)` : "#1a0d0c",
            boxShadow: go ? `0 0 18px ${RED}` : "none",
            ["--ring" as string]: RED,
          }}
        />
      </div>
    </div>
  );
}

function PrintTimer({ seconds }: { seconds: number }) {
  return (
    <div className="grid h-full w-full place-items-center border bg-[#120c0b] text-center text-[10px] tracking-[0.2em] md:text-xs" style={{ borderColor: RED, color: RED, ...glow(16) }}>
      <div>
        DEVELOPING
        <div className="my-1 text-4xl leading-none tracking-normal md:text-5xl" style={{ color: AMBER, textShadow: `0 0 12px ${AMBER}` }}>
          {String(seconds).padStart(2, "0")}
        </div>
        SEC
        <ArrowDown className="anim-bob mx-auto mt-1 h-4 w-4" />
      </div>
    </div>
  );
}

function PickupSlot({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-x-0 top-0 z-20 h-[5%] border bg-black" style={{ borderColor: RED, ...glow(10) }}>
        <div className="mx-auto mt-[4%] h-[30%] w-[85%]" style={{ background: RED, boxShadow: `0 0 10px ${RED}` }} />
      </div>
      <div className="absolute inset-x-[6%] top-[3.5%] bottom-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Note({ kind }: { kind: "yourStrip" | "tapToSave" }) {
  return (
    <div className="text-[10px] leading-relaxed tracking-[0.25em] md:text-xs" style={{ color: AMBER }}>
      {kind === "yourStrip" ? "← PRINT READY" : "← TAP TO SAVE"}
    </div>
  );
}

function IconButton({ kind, onClick }: { kind: "cut" | "back"; onClick: () => void }) {
  const Icon = kind === "cut" ? ScissorsIcon : BackIcon;
  return (
    <button
      onClick={onClick}
      aria-label={kind === "cut" ? "Cut into single photos" : "Back to strip"}
      className="grid h-11 w-11 place-items-center border transition-all hover:scale-110 md:h-12 md:w-12"
      style={{ borderColor: RED, color: RED, ...glow(10) }}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export const darkroom: ThemeKit = {
  id: "darkroom",
  label: "Darkroom",
  ExteriorArt,
  Lightbox,
  ScreenBezel,
  PriceSticker,
  Instructions,
  CoinPanel,
  PrintTimer,
  PickupSlot,
  Note,
  IconButton,
};
