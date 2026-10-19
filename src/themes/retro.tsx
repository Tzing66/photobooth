// Retro 70s: cream enamel cabinet, chrome trim, red velvet curtain, marquee bulbs.

import type { ReactNode } from "react";
import type { ThemeKit } from "./types";
import { ArrowDown, BackIcon, EXT, STEPS, ScissorsIcon, Svg, perimeter } from "./shared";

const INK = "#3a1f12";
const CREAM = "#f6ead2";
const RED = "#d2452b";
const ORANGE = "#e07a24";
const MUSTARD = "#e9a825";

function ChromeDefs({ id = "chrome" }: { id?: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fdfdfd" />
      <stop offset="0.45" stopColor="#b8b8b8" />
      <stop offset="0.55" stopColor="#f0f0f0" />
      <stop offset="1" stopColor="#8a8a8a" />
    </linearGradient>
  );
}

function Bulbs({ x, y, w, h, spacing, r = 2.6 }: { x: number; y: number; w: number; h: number; spacing: number; r?: number }) {
  return (
    <g>
      {perimeter(x, y, w, h, spacing).map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r + 1.5} fill="#ffd76a" opacity={0.35} className="anim-bulb" style={{ animationDelay: `${(i % 2) * 0.6}s` }} />
          <circle cx={cx} cy={cy} r={r} fill="#fff4c2" stroke={INK} strokeWidth={0.8} className="anim-bulb" style={{ animationDelay: `${(i % 2) * 0.6}s` }} />
        </g>
      ))}
    </g>
  );
}

function ExteriorArt() {
  const { featured: f, door: d } = EXT;
  return (
    <Svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full">
      <defs>
        <ChromeDefs />
        <linearGradient id="velvet" x1="0" x2="14" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
          <stop offset="0" stopColor="#5c0c0a" />
          <stop offset="0.5" stopColor="#b02a20" />
          <stop offset="1" stopColor="#5c0c0a" />
        </linearGradient>
        <radialGradient id="booth-glow" cx="0.5" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#1b0d08" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* floor shadow */}
      <ellipse cx="150" cy="378" rx="140" ry="8" fill="#000" opacity="0.35" />

      {/* cabinet */}
      <path d="M22 372 V100 Q22 78 44 78 H256 Q278 78 278 100 V372 Z" fill={CREAM} stroke={INK} strokeWidth="3" />
      <rect x="22" y="352" width="256" height="20" fill="url(#chrome)" stroke={INK} strokeWidth="2" />

      {/* sign */}
      <rect x="30" y="12" width="240" height="60" rx="12" fill={RED} stroke={INK} strokeWidth="3" />
      <rect x="37" y="19" width="226" height="46" rx="8" fill="none" stroke="url(#chrome)" strokeWidth="2.5" />
      <Bulbs x={37} y={19} w={226} h={46} spacing={13} />
      <text x="150" y="53" textAnchor="middle" fontFamily="Shrikhand" fontSize="30" fill={CREAM} stroke={INK} strokeWidth="2.5" paintOrder="stroke">
        Photos
      </text>
      <rect x="60" y="72" width="8" height="8" fill="url(#chrome)" stroke={INK} strokeWidth="1.5" />
      <rect x="232" y="72" width="8" height="8" fill="url(#chrome)" stroke={INK} strokeWidth="1.5" />

      {/* featured board */}
      <text x={f.x + f.w / 2} y={f.y - 9} textAnchor="middle" fontFamily="Courier Prime" fontWeight="700" fontSize="8" letterSpacing="2" fill={INK}>
        ★ SAMPLES ★
      </text>
      <rect x={f.x - 4} y={f.y - 4} width={f.w + 8} height={f.h + 8} rx="6" fill="url(#chrome)" stroke={INK} strokeWidth="2" />
      <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="3" fill="#2b1a12" />

      {/* stripes */}
      {[RED, ORANGE, MUSTARD].map((c, i) => (
        <rect key={c} x="22" y={226 + i * 8} width="130" height="6" fill={c} />
      ))}

      {/* price placard */}
      <rect x="40" y="258" width="90" height="34" rx="6" fill={MUSTARD} stroke={INK} strokeWidth="2.5" />
      <text x="85" y="275" textAnchor="middle" fontFamily="Shrikhand" fontSize="13" fill={INK}>
        4 poses
      </text>
      <text x="85" y="286" textAnchor="middle" fontFamily="Courier Prime" fontWeight="700" fontSize="8" fill={INK}>
        1 STRIP
      </text>

      {/* coin slot */}
      <rect x="62" y="302" width="46" height="38" rx="5" fill="url(#chrome)" stroke={INK} strokeWidth="2" />
      <rect x="82" y="308" width="6" height="18" rx="2" fill={INK} />
      <text x="85" y="335" textAnchor="middle" fontFamily="Courier Prime" fontWeight="700" fontSize="5" fill={INK}>
        INSERT COIN
      </text>

      {/* doorway */}
      <rect x={d.x} y={d.y} width={d.w} height={d.h} fill="#1b0d08" stroke={INK} strokeWidth="3" />
      <rect x={d.x} y={d.y} width={d.w} height={d.h} fill="url(#booth-glow)" />
      {/* stool */}
      <rect x={d.x + 14} y={d.y + 190} width="34" height="7" rx="3" fill="#6b3a22" />
      <rect x={d.x + 18} y={d.y + 197} width="4" height="63" fill="#3d2013" />
      <rect x={d.x + 40} y={d.y + 197} width="4" height="63" fill="#3d2013" />
      {/* curtain: gathered to the right */}
      <path
        d={`M${d.x + 52} ${d.y + 6} Q${d.x + 70} ${d.y + 120} ${d.x + 60} ${d.y + 250} L${d.x + d.w} ${d.y + 250} L${d.x + d.w} ${d.y + 6} Z`}
        fill="url(#velvet)"
        stroke={INK}
        strokeWidth="2"
      />
      <path d={`M${d.x + 64} ${d.y + 140} Q${d.x + 90} ${d.y + 150} ${d.x + d.w} ${d.y + 138}`} stroke={MUSTARD} strokeWidth="4" fill="none" />
      <rect x={d.x - 4} y={d.y} width={d.w + 8} height="7" rx="3" fill="url(#chrome)" stroke={INK} strokeWidth="1.5" />
      <rect x={d.x + 8} y={d.y - 12} width={d.w - 16} height="10" rx="3" fill={INK} />
      <text x={d.x + d.w / 2} y={d.y - 4.5} textAnchor="middle" fontFamily="Courier Prime" fontWeight="700" fontSize="6.5" letterSpacing="1.5" fill={MUSTARD}>
        STEP RIGHT IN
      </text>
    </Svg>
  );
}

function Lightbox() {
  return (
    <Svg viewBox="0 0 600 160" className="h-full w-full">
      <defs>
        <ChromeDefs id="chrome-lb" />
      </defs>
      <rect x="6" y="6" width="588" height="148" rx="22" fill={RED} stroke={INK} strokeWidth="5" />
      <rect x="20" y="20" width="560" height="120" rx="14" fill="none" stroke="url(#chrome-lb)" strokeWidth="4" />
      <Bulbs x={20} y={20} w={560} h={120} spacing={24} r={4.5} />
      <text x="300" y="98" textAnchor="middle" fontFamily="Shrikhand" fontSize="70" fill={CREAM} stroke={INK} strokeWidth="5" paintOrder="stroke">
        Photos
      </text>
      <text x="300" y="126" textAnchor="middle" fontFamily="Courier Prime" fontWeight="700" fontSize="17" letterSpacing="6" fill={MUSTARD}>
        ★ 4 POSES · 1 STRIP ★
      </text>
    </Svg>
  );
}

function ScreenBezel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 rounded-[18px] border-[3px] p-[7%]" style={{ borderColor: INK, background: "linear-gradient(180deg,#fdfdfd,#b8b8b8 45%,#f0f0f0 55%,#8a8a8a)", boxShadow: `0 5px 0 ${INK}` }}>
      {[
        "left-[3%] top-[3%]",
        "right-[3%] top-[3%]",
        "left-[3%] bottom-[3%]",
        "right-[3%] bottom-[3%]",
      ].map((p) => (
        <span key={p} className={`absolute ${p} h-2 w-2 rounded-full border`} style={{ borderColor: INK, background: "#ddd" }} />
      ))}
      <div className="relative h-full w-full overflow-hidden rounded-md border-[3px] bg-[#1b0d08]" style={{ borderColor: INK }}>
        {children}
      </div>
    </div>
  );
}

function PriceSticker() {
  const pts = Array.from({ length: 24 }, (_, i) => {
    const r = i % 2 ? 31 : 39;
    const a = (i / 24) * Math.PI * 2;
    return `${45 + Math.cos(a) * r},${45 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <Svg viewBox="0 0 90 90" className="w-full -rotate-12">
      <polygon points={pts} fill={RED} stroke={INK} strokeWidth="2.5" />
      <text x="45" y="47" textAnchor="middle" fontFamily="Shrikhand" fontSize="28" fill={CREAM}>
        4
      </text>
      <text x="45" y="62" textAnchor="middle" fontFamily="Shrikhand" fontSize="13" fill={MUSTARD}>
        poses!
      </text>
    </Svg>
  );
}

function Instructions() {
  return (
    <div className="card relative rotate-[-1.5deg] px-3 py-2 text-xs md:text-sm" style={{ boxShadow: `0 4px 0 ${INK}` }}>
      <div className="font-display text-center text-base md:text-lg" style={{ color: RED }}>
        How it works
      </div>
      <ol className="mt-1 space-y-0.5 font-bold">
        {STEPS.map((s, i) => (
          <li key={s} className="flex gap-2">
            <span className="inline-grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px]" style={{ background: MUSTARD, color: INK }}>
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

function CoinPanel({ onClick, go, label }: { onClick?: () => void; go: boolean; label: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`font-display text-lg md:text-2xl transition-opacity ${label ? "opacity-100" : "opacity-0"}`} style={{ color: MUSTARD, textShadow: `2px 2px 0 ${INK}` }}>
        {label ?? "·"}
      </span>
      <div
        className="flex w-16 flex-col items-center gap-2 rounded-lg border-[3px] px-2 py-3 md:w-20"
        style={{ borderColor: INK, background: "linear-gradient(180deg,#fdfdfd,#b8b8b8 45%,#f0f0f0 55%,#8a8a8a)" }}
      >
        <span className="h-5 w-1.5 rounded-sm" style={{ background: INK }} />
        <button
          onClick={onClick}
          aria-label={label ?? "button"}
          className={`h-9 w-9 rounded-full border-[3px] transition-transform active:scale-90 md:h-11 md:w-11 ${go ? "press-me" : ""}`}
          style={{
            borderColor: INK,
            background: `radial-gradient(circle at 35% 30%, ${go ? "#9be89f" : "#ff9a84"}, ${go ? "#2e9b3a" : "#b3241a"} 70%)`,
            ["--ring" as string]: "#2e9b3a",
          }}
        />
        <span className="text-[8px] font-bold tracking-widest" style={{ color: INK }}>
          PUSH
        </span>
      </div>
    </div>
  );
}

function PrintTimer({ seconds }: { seconds: number }) {
  return (
    <div className="relative grid h-full w-full place-items-center rounded-full border-4 text-center" style={{ borderColor: INK, background: MUSTARD, boxShadow: `0 5px 0 ${INK}`, color: INK }}>
      <div className="font-bold leading-tight text-[11px] sm:text-sm">
        PHOTOS
        <br />
        DELIVERED
        <br />
        HERE IN
        <div className="font-display text-2xl leading-none sm:text-3xl" style={{ color: RED }}>
          {seconds}
        </div>
        SECONDS
        <ArrowDown className="anim-bob mx-auto mt-0.5 h-4 w-4" />
      </div>
    </div>
  );
}

function PickupSlot({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-x-0 top-0 z-20 h-[7%] rounded-md border-[3px]" style={{ borderColor: INK, background: "linear-gradient(180deg,#fdfdfd,#b8b8b8 45%,#f0f0f0 55%,#8a8a8a)" }}>
        <div className="mx-auto mt-[6%] h-[30%] w-[80%] rounded-sm" style={{ background: INK }} />
      </div>
      <div className="absolute inset-x-[6%] top-[5%] bottom-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Note({ kind }: { kind: "yourStrip" | "tapToSave" }) {
  return (
    <div className="font-display -rotate-6 text-center text-lg leading-tight md:text-2xl" style={{ color: MUSTARD, textShadow: `2px 2px 0 ${INK}` }}>
      {kind === "yourStrip" ? "your strip!" : "tap to save!"}
    </div>
  );
}

function IconButton({ kind, onClick }: { kind: "cut" | "back"; onClick: () => void }) {
  const Icon = kind === "cut" ? ScissorsIcon : BackIcon;
  return (
    <button
      onClick={onClick}
      aria-label={kind === "cut" ? "Cut into single photos" : "Back to strip"}
      className="grid h-12 w-12 place-items-center rounded-full border-[3px] transition-transform hover:scale-110 md:h-14 md:w-14"
      style={{ borderColor: INK, background: MUSTARD, color: INK, boxShadow: `0 3px 0 ${INK}` }}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}

export const retro: ThemeKit = {
  id: "retro",
  label: "Retro ’70s",
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
