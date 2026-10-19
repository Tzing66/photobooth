// Hello Kitty & friends: pink gingham, red bows, a scalloped awning, and
// Kitty, My Melody, Kuromi, Keroppi and Pompompurin hanging around the booth.

import type { ReactNode } from "react";
import type { ThemeKit } from "./types";
import { BackIcon, EXT, STEPS, ScissorsIcon, Svg } from "./shared";
import { BOW_RED, Bow, CharIcon, Keroppi, Kitty, Kuromi, Melody, Purin } from "./kittyChars";

const OUT = "#2b2b2b";
const PINK = "#ff8fb3";
const BLUSH = "#ffd6e5";
const TEXT = "#5a2a3a";
const pop = { fontFamily: "'Mochiy Pop One'" };

function Defs() {
  return (
    <pattern id="gingham" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="#fff" />
      <rect width="6" height="12" fill={BOW_RED} opacity="0.45" />
      <rect width="12" height="6" fill={BOW_RED} opacity="0.45" />
    </pattern>
  );
}

function Scallops({ x, y, w, r }: { x: number; y: number; w: number; r: number }) {
  const n = Math.round(w / (r * 2));
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${x + i * 2 * r} ${y} a${r} ${r} 0 0 0 ${2 * r} 0 Z`} fill={i % 2 ? "#fff" : PINK} stroke={OUT} strokeWidth="2" />
      ))}
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
      <ellipse cx="150" cy="378" rx="135" ry="7" fill={TEXT} opacity="0.12" />

      {/* sign, with Kitty peeking over it */}
      <rect x="44" y="20" width="220" height="50" rx="25" fill={PINK} stroke={OUT} strokeWidth="3" />
      <text x="164" y="52" textAnchor="middle" fontSize="19" fill="#fff" stroke={OUT} strokeWidth="3" paintOrder="stroke" {...pop}>
        hello! photos
      </text>
      <Kitty x={10} y={2} size={70} rotate={-8} />

      {/* cabinet + awning */}
      <rect x="22" y="80" width="256" height="292" rx="22" fill="#fff" stroke={OUT} strokeWidth="3" />
      <rect x="22" y="80" width="256" height="14" rx="7" fill={PINK} stroke={OUT} strokeWidth="2.5" />
      <Scallops x={26} y={94} w={248} r={8} />
      <Kuromi x={228} y={40} size={52} rotate={10} />

      {/* photo board */}
      <rect x={f.x - 5} y={f.y - 5} width={f.w + 10} height={f.h + 10} rx="10" fill={BLUSH} stroke={OUT} strokeWidth="2.5" />
      <Bow cx={f.x + f.w + 2} cy={f.y - 3} scale={0.6} rotate={12} />
      <text x={f.x + f.w / 2} y={f.y + f.h + 20} textAnchor="middle" fontSize="8" fill={TEXT} {...pop}>
        ♡ our photos ♡
      </text>

      {/* friends */}
      <Keroppi x={30} y={248} size={56} rotate={-6} />
      <Purin x={88} y={258} size={54} rotate={6} />
      <text x="85" y="342" textAnchor="middle" fontSize="9" fill={BOW_RED} {...pop}>
        4 poses ♡
      </text>

      {/* doorway with gingham curtain */}
      <rect x={d.x} y={d.y + 16} width={d.w} height={d.h - 16} rx="14" fill={BLUSH} stroke={OUT} strokeWidth="3" />
      <path
        d={`M${d.x + 52} ${d.y + 20} Q${d.x + 66} ${d.y + 130} ${d.x + 56} ${d.y + d.h - 4} H${d.x + d.w - 14} Q${d.x + d.w - 3} ${d.y + d.h - 4} ${d.x + d.w - 3} ${d.y + d.h - 16} V${d.y + 20} Z`}
        fill="url(#gingham)"
        stroke={OUT}
        strokeWidth="2"
      />
      <Bow cx={d.x + 60} cy={d.y + 138} scale={0.75} />
      <Melody x={d.x - 22} y={d.y + 150} size={60} rotate={-12} />
    </Svg>
  );
}

function Lightbox() {
  return (
    <Svg viewBox="0 0 600 160" className="h-full w-full">
      <rect x="10" y="24" width="580" height="120" rx="60" fill={PINK} stroke={OUT} strokeWidth="5" />
      <text x="320" y="102" textAnchor="middle" fontSize="50" fill="#fff" stroke={OUT} strokeWidth="6" paintOrder="stroke" {...pop}>
        hello! photos
      </text>
      <Kitty x={8} y={6} size={120} rotate={-10} />
      <Melody x={500} y={40} size={92} rotate={10} />
    </Svg>
  );
}

function ScreenBezel({ children }: { children: ReactNode }) {
  // The screen is Kitty's head: ears on top, bow on the right ear.
  return (
    <div className="absolute inset-0">
      <Svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
        <path d="M14 90 L26 -44 L124 24 Z" fill="#fff" stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
        <path d="M286 90 L274 -44 L176 24 Z" fill="#fff" stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
      </Svg>
      <div className="absolute inset-0 rounded-[34px] border-[5px] bg-white p-[7%]" style={{ borderColor: OUT, boxShadow: `0 6px 0 ${PINK}` }}>
        <div className="relative h-full w-full overflow-hidden rounded-[22px] border-[3px]" style={{ borderColor: PINK, background: BLUSH }}>
          {children}
        </div>
      </div>
      <svg viewBox="-24 -12 48 24" className="absolute -top-[13%] right-[-4%] w-[30%] rotate-12" aria-hidden>
        <Bow cx={0} cy={0} />
      </svg>
    </div>
  );
}

function PriceSticker() {
  return (
    <div className="relative">
      <CharIcon who="keroppi" className="w-full" />
      <span className="absolute -top-2 -right-1 rounded-full border-2 bg-white px-1.5 text-[10px] md:text-xs" style={{ ...pop, borderColor: OUT, color: BOW_RED }}>
        x4
      </span>
    </div>
  );
}

function Instructions() {
  return (
    <div className="card px-3 py-2 text-xs leading-snug md:text-sm" style={{ color: TEXT }}>
      <div className="mb-0.5 text-sm md:text-base" style={{ ...pop, color: BOW_RED }}>
        how to ♡
      </div>
      {STEPS.map((s) => (
        <div key={s} className="font-semibold">
          <span style={{ color: BOW_RED }}>♥</span> {s}
        </div>
      ))}
    </div>
  );
}

function CoinPanel({ onClick, go, label }: { onClick?: () => void; go: boolean; label: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-base transition-opacity md:text-xl ${label ? "opacity-100" : "opacity-0"}`} style={{ ...pop, color: BOW_RED }}>
        {label ?? "·"}
      </span>
      <div className="card flex w-16 flex-col items-center gap-1 px-2 py-3 md:w-20">
        <div className="relative">
          <button
            onClick={onClick}
            aria-label={label ?? "button"}
            className={`h-10 w-10 rounded-full border-[3px] transition-transform active:scale-90 md:h-12 md:w-12 ${go ? "press-me" : ""}`}
            style={{
              borderColor: OUT,
              background: `radial-gradient(circle at 35% 30%, #fff 0 10%, ${go ? "#7bd88f" : PINK} 11%)`,
              ["--ring" as string]: PINK,
            }}
          />
          <svg viewBox="-24 -12 48 24" className="pointer-events-none absolute -top-2 -right-3 w-7 rotate-12" aria-hidden>
            <Bow cx={0} cy={0} />
          </svg>
        </div>
      </div>
    </div>
  );
}

function PrintTimer({ seconds }: { seconds: number }) {
  return (
    <div className="relative h-full w-full pt-[22%]">
      <CharIcon who="kitty" className="absolute -top-[2%] left-1/2 z-10 w-[58%] -translate-x-1/2" />
      <div className="card grid h-full w-full place-items-center rounded-full! text-center" style={{ color: TEXT }}>
        <div className="pt-[30%]">
          <div className="text-[10px] md:text-xs" style={pop}>
            printing!
          </div>
          <div className="text-3xl leading-tight md:text-4xl" style={{ ...pop, color: BOW_RED }}>
            {seconds}
          </div>
          <div className="text-[10px] md:text-xs" style={pop}>
            sec ♡
          </div>
        </div>
      </div>
    </div>
  );
}

function PickupSlot({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-x-0 top-0 z-20 h-[6%] rounded-full border-[3px]" style={{ borderColor: OUT, background: PINK }}>
        <div className="mx-auto mt-[4%] h-[32%] w-[78%] rounded-full" style={{ background: OUT }} />
        <svg viewBox="-24 -12 48 24" className="absolute -top-3 -right-4 w-9 rotate-12" aria-hidden>
          <Bow cx={0} cy={0} />
        </svg>
      </div>
      <div className="absolute inset-x-[7%] top-[4%] bottom-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Note({ kind }: { kind: "yourStrip" | "tapToSave" }) {
  return (
    <div className="flex items-end gap-1">
      <CharIcon who={kind === "yourStrip" ? "melody" : "purin"} className="w-12 shrink-0 md:w-14" />
      <div className="mb-3 rounded-2xl rounded-bl-none border-[3px] bg-white px-2 py-1 text-[10px] leading-tight md:text-xs" style={{ ...pop, borderColor: OUT, color: BOW_RED }}>
        {kind === "yourStrip" ? "so cute!" : "tap to save ♡"}
      </div>
    </div>
  );
}

function IconButton({ kind, onClick }: { kind: "cut" | "back"; onClick: () => void }) {
  const Icon = kind === "cut" ? ScissorsIcon : BackIcon;
  return (
    <button
      onClick={onClick}
      aria-label={kind === "cut" ? "Cut into single photos" : "Back to strip"}
      className="grid h-12 w-12 place-items-center rounded-full border-[3px] text-white transition-transform hover:scale-110 md:h-14 md:w-14"
      style={{ borderColor: OUT, background: PINK, boxShadow: `0 3px 0 ${OUT}` }}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}

export const kitty: ThemeKit = {
  id: "kitty",
  label: "Hello Kitty & Friends",
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
