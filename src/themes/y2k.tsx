// Y2K purikura: glossy pastel plastic, sticker outlines, hearts and twinkling sparkles.

import type { ReactNode } from "react";
import type { ThemeKit } from "./types";
import { ArrowDown, BackIcon, EXT, STEPS, ScissorsIcon, Svg } from "./shared";

const PURPLE = "#5b2a86";
const PINK = "#ff5fae";
const SOFTPINK = "#ff9fd0";
const BLUE = "#5fd3ff";
const LILAC = "#c9a7ff";
const bubbly = { fontFamily: "Fredoka", fontWeight: 700 };

const sparklePath = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r}Z`;

const heartPath = (cx: number, cy: number, s: number) =>
  `M${cx} ${cy + s * 0.9} C${cx - s * 1.4} ${cy - s * 0.1} ${cx - s * 0.8} ${cy - s * 1.2} ${cx} ${cy - s * 0.45} C${cx + s * 0.8} ${cy - s * 1.2} ${cx + s * 1.4} ${cy - s * 0.1} ${cx} ${cy + s * 0.9}Z`;

function Sparkle({ x, y, r, delay = 0, fill = "#fff" }: { x: number; y: number; r: number; delay?: number; fill?: string }) {
  return <path d={sparklePath(x, y, r)} fill={fill} className="anim-twinkle" style={{ animationDelay: `${delay}s` }} />;
}

/** Sticker = white outline + soft shadow around any shape. */
function Sticker({ d, fill }: { d: string; fill: string }) {
  return (
    <g>
      <path d={d} fill="#fff" stroke="#fff" strokeWidth="6" strokeLinejoin="round" filter="url(#sticker-shadow)" />
      <path d={d} fill={fill} />
    </g>
  );
}

function Defs() {
  return (
    <>
      <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#ffd9ef" />
      </linearGradient>
      <linearGradient id="rainbow" x1="0" x2="1">
        <stop offset="0" stopColor={PINK} />
        <stop offset="0.5" stopColor={LILAC} />
        <stop offset="1" stopColor={BLUE} />
      </linearGradient>
      <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
        <rect width="14" height="14" fill="#ffc4e3" />
        <path d={heartPath(7, 7, 2.6)} fill="#fff" />
      </pattern>
      <filter id="sticker-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#9a4fc4" floodOpacity="0.35" />
      </filter>
    </>
  );
}

function ExteriorArt() {
  const { featured: f, door: d } = EXT;
  return (
    <Svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full">
      <defs>
        <Defs />
      </defs>
      <ellipse cx="150" cy="378" rx="135" ry="8" fill={PURPLE} opacity="0.15" />

      {/* cabinet */}
      <rect x="22" y="80" width="256" height="292" rx="30" fill="url(#gloss)" stroke="#fff" strokeWidth="5" filter="url(#sticker-shadow)" />
      <rect x="36" y="88" width="228" height="10" rx="5" fill="#fff" opacity="0.8" />

      {/* sign */}
      <rect x="34" y="14" width="232" height="58" rx="29" fill="url(#rainbow)" stroke="#fff" strokeWidth="5" filter="url(#sticker-shadow)" />
      <text x="150" y="53" textAnchor="middle" fontSize="27" fill="#fff" stroke={PURPLE} strokeWidth="3" paintOrder="stroke" {...bubbly}>
        puri ♡ booth
      </text>

      {/* sticker book */}
      <rect x={f.x - 5} y={f.y - 5} width={f.w + 10} height={f.h + 10} rx="14" fill="#fff" stroke={SOFTPINK} strokeWidth="3" strokeDasharray="5 4" />
      <text x={f.x + f.w / 2} y={f.y - 10} textAnchor="middle" fontSize="9" fill={PURPLE} {...bubbly}>
        ✧ my sticker book ✧
      </text>

      {/* price badge */}
      <Sticker d={heartPath(85, 268, 30)} fill={PINK} />
      <text x="85" y="266" textAnchor="middle" fontSize="11" fill="#fff" {...bubbly}>
        4 shots
      </text>
      <text x="85" y="279" textAnchor="middle" fontSize="9" fill="#fff" {...bubbly}>
        ¥400
      </text>
      <Sticker d={sparklePath(46, 322, 12)} fill={BLUE} />
      <Sticker d={heartPath(124, 330, 9)} fill={LILAC} />

      {/* doorway with polka-heart curtain */}
      <rect x={d.x} y={d.y} width={d.w} height={d.h} rx="18" fill="#fbe9ff" stroke="#fff" strokeWidth="4" />
      <path
        d={`M${d.x + 50} ${d.y + 4} Q${d.x + 64} ${d.y + 120} ${d.x + 54} ${d.y + d.h - 4} H${d.x + d.w - 14} Q${d.x + d.w - 3} ${d.y + d.h - 4} ${d.x + d.w - 3} ${d.y + d.h - 18} V${d.y + 18} Q${d.x + d.w - 3} ${d.y + 4} ${d.x + d.w - 18} ${d.y + 4} Z`}
        fill="url(#dots)"
      />
      <path d={`M${d.x + 58} ${d.y + 135} Q${d.x + 80} ${d.y + 146} ${d.x + d.w - 3} ${d.y + 132}`} stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Sticker d={heartPath(d.x + 62, d.y + 136, 7)} fill={PINK} />

      <Sparkle x={20} y={20} r={9} />
      <Sparkle x={282} y={60} r={7} delay={0.8} />
      <Sparkle x={288} y={180} r={10} delay={1.4} fill="#fff8b0" />
      <Sparkle x={12} y={210} r={6} delay={0.4} />
      <Sparkle x={150} y={392} r={6} delay={1.1} />
    </Svg>
  );
}

function Lightbox() {
  return (
    <Svg viewBox="0 0 600 160" className="h-full w-full">
      <defs>
        <Defs />
      </defs>
      <rect x="20" y="22" width="560" height="116" rx="58" fill="url(#rainbow)" stroke="#fff" strokeWidth="8" filter="url(#sticker-shadow)" />
      <rect x="70" y="34" width="460" height="14" rx="7" fill="#fff" opacity="0.55" />
      <text x="300" y="104" textAnchor="middle" fontSize="60" fill="#fff" stroke={PURPLE} strokeWidth="6" paintOrder="stroke" {...bubbly}>
        puri ♡ booth
      </text>
      <Sparkle x={40} y={30} r={16} />
      <Sparkle x={565} y={130} r={14} delay={0.9} />
      <Sparkle x={545} y={28} r={9} delay={1.5} fill="#fff8b0" />
    </Svg>
  );
}

function ScreenBezel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 rounded-[28px] border-4 border-white p-[7%]" style={{ background: "linear-gradient(160deg,#ffffff,#ffd9ef 60%,#e4d4ff)", boxShadow: `0 0 0 3px ${SOFTPINK}, 0 12px 26px rgba(150,70,200,.3)` }}>
      <span className="absolute -left-3 -top-3 text-3xl drop-shadow-[0_2px_0_#fff]" style={{ color: PINK }}>
        ♥
      </span>
      <span className="anim-twinkle absolute -right-2 -top-3 text-2xl" style={{ color: BLUE }}>
        ✦
      </span>
      <span className="absolute -bottom-3 -left-2 text-2xl" style={{ color: LILAC }}>
        ★
      </span>
      <div className="relative h-full w-full overflow-hidden rounded-[18px] border-4 border-white bg-[#fbe9ff]">{children}</div>
    </div>
  );
}

function EyeLevel() {
  return (
    <div className="anim-bob relative rounded-2xl border-[3px] border-white px-2 py-1 text-center text-[10px] leading-tight font-semibold text-white md:text-xs" style={{ background: PINK, boxShadow: "0 3px 8px rgba(150,70,200,.3)" }}>
      look
      <br />
      here ♡
      <span className="absolute -right-2 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-l-[8px] border-y-transparent" style={{ borderLeftColor: PINK }} />
    </div>
  );
}

function PriceSticker() {
  return (
    <Svg viewBox="0 0 90 90" className="w-full rotate-12">
      <defs>
        <Defs />
      </defs>
      <Sticker d={heartPath(45, 50, 34)} fill={BLUE} />
      <text x="45" y="47" textAnchor="middle" fontSize="12" fill="#fff" {...bubbly}>
        4 shots
      </text>
      <text x="45" y="62" textAnchor="middle" fontSize="13" fill={PURPLE} {...bubbly}>
        ¥400
      </text>
    </Svg>
  );
}

function Instructions() {
  return (
    <div className="card relative px-3 py-2 text-xs leading-snug font-semibold md:text-sm">
      <div className="mb-0.5 text-sm font-bold md:text-base" style={{ color: PINK }}>
        ✧ how to puri ✧
      </div>
      {STEPS.map((s, i) => (
        <div key={s}>
          <span style={{ color: PINK }}>{["①", "②", "③", "④"][i]}</span> {s}
        </div>
      ))}
    </div>
  );
}

function CoinPanel({ onClick, go, label }: { onClick?: () => void; go: boolean; label: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-lg font-bold transition-opacity md:text-2xl ${label ? "opacity-100" : "opacity-0"}`} style={{ color: PINK, textShadow: "0 2px 0 #fff" }}>
        {label ?? "·"} ♡
      </span>
      <div className="card flex w-16 flex-col items-center gap-2 px-2 py-3 md:w-20">
        <span className="text-[9px] font-bold" style={{ color: PURPLE }}>
          coin ¥
        </span>
        <button
          onClick={onClick}
          aria-label={label ?? "button"}
          className="h-10 w-10 rounded-full border-4 border-white transition-transform active:scale-90 md:h-12 md:w-12"
          style={{
            background: `radial-gradient(circle at 35% 30%, #fff, ${go ? "#3ddc97" : "#ff5f7e"} 55%)`,
            boxShadow: `0 0 0 2px ${go ? "#3ddc97" : "#ff5f7e"}, 0 4px 10px rgba(150,70,200,.3)`,
            animation: go ? "pulse-ring 1.3s ease-out infinite" : undefined,
            ["--ring" as string]: "rgba(61,220,151,.7)",
          }}
        />
      </div>
    </div>
  );
}

function FilterToggle({ color, onToggle }: { color: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold md:text-base">
      <span className={color ? "opacity-50" : ""}>mono</span>
      <button
        onClick={onToggle}
        aria-label="Toggle colour mode"
        className="relative h-8 w-16 rounded-full border-[3px] border-white"
        style={{ background: color ? `linear-gradient(90deg,${PINK},${LILAC},${BLUE})` : "#cfc4dc", boxShadow: `0 0 0 2px ${SOFTPINK}` }}
      >
        <span className="absolute top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-white text-xs transition-all duration-300" style={{ left: color ? "calc(100% - 1.6rem)" : "2px", color: PINK }}>
          ♥
        </span>
      </button>
      <span className={color ? "" : "opacity-50"}>color</span>
    </div>
  );
}

function PrintTimer({ seconds }: { seconds: number }) {
  return (
    <div className="card grid h-full w-full place-items-center rounded-full! text-center text-xs font-semibold md:text-sm">
      <div>
        printing ✧
        <div className="text-4xl leading-none font-bold md:text-5xl" style={{ color: PINK }}>
          {seconds}
        </div>
        sec
        <ArrowDown className="anim-bob mx-auto h-4 w-4" style={{ color: PINK }} />
      </div>
    </div>
  );
}

function PickupSlot({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-x-0 top-0 z-20 h-[6%] rounded-full border-4 border-white" style={{ background: `linear-gradient(90deg,${PINK},${LILAC},${BLUE})`, boxShadow: "0 4px 10px rgba(150,70,200,.3)" }}>
        <div className="mx-auto mt-[4%] h-[30%] w-[78%] rounded-full" style={{ background: PURPLE }} />
      </div>
      <div className="absolute inset-x-[7%] top-[4%] bottom-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Note({ kind }: { kind: "yourStrip" | "tapToSave" }) {
  return (
    <div className="-rotate-6 rounded-2xl border-[3px] border-white px-3 py-1 text-center text-sm leading-tight font-bold text-white md:text-base" style={{ background: PINK, boxShadow: "0 3px 8px rgba(150,70,200,.3)" }}>
      {kind === "yourStrip" ? "kawaii strip ♡" : "tap to save ✧"}
    </div>
  );
}

function IconButton({ kind, onClick }: { kind: "cut" | "back"; onClick: () => void }) {
  const Icon = kind === "cut" ? ScissorsIcon : BackIcon;
  return (
    <button
      onClick={onClick}
      aria-label={kind === "cut" ? "Cut into single photos" : "Back to strip"}
      className="grid h-12 w-12 place-items-center rounded-full border-4 border-white text-white transition-transform hover:scale-110 md:h-14 md:w-14"
      style={{ background: `linear-gradient(135deg,${PINK},${LILAC})`, boxShadow: `0 0 0 2px ${SOFTPINK}, 0 4px 10px rgba(150,70,200,.3)` }}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}

export const y2k: ThemeKit = {
  id: "y2k",
  label: "Y2K Purikura",
  ExteriorArt,
  Lightbox,
  ScreenBezel,
  EyeLevel,
  PriceSticker,
  Instructions,
  CoinPanel,
  FilterToggle,
  PrintTimer,
  PickupSlot,
  Note,
  IconButton,
};
