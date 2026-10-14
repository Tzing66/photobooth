// Photo Boy: a grey handheld with a four-shade green dot-matrix LCD, a magenta
// A button, and a little thermal printer for the strip.

import type { ReactNode } from "react";
import type { ThemeKit, ToggleProps } from "./types";
import { BackIcon, EXT, STEPS, ScissorsIcon, Svg } from "./shared";

// The classic four LCD shades, darkest to lightest.
const D0 = "#0f380f";
const D1 = "#306230";
const D2 = "#8bac0f";
const D3 = "#9bbc0f";
const SHELL = "#c9c7bf";
const SHELL_EDGE = "#8f8c84";
const BEZEL = "#4f4f63";
const NAVY = "#2a2f7a";
const MAGENTA = "#a2195b";
const font = { fontFamily: "Silkscreen" };
const crisp = { shapeRendering: "crispEdges" as const };

/** Dark LCD bezel with the two signature stripes and a power LED. */
function LcdBezel({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <path d={`M${x} ${y + 6} Q${x} ${y} ${x + 6} ${y} H${x + w - 6} Q${x + w} ${y} ${x + w} ${y + 6} V${y + h - 20} Q${x + w} ${y + h} ${x + w - 20} ${y + h} H${x + 6} Q${x} ${y + h} ${x} ${y + h - 6} Z`} fill={BEZEL} />
      <rect x={x + 6} y={y + 5} width={w * 0.55} height="1.6" fill={MAGENTA} />
      <rect x={x + 6} y={y + 8} width={w * 0.55} height="1.6" fill={NAVY} />
      <circle cx={x + 6} cy={y + h / 2} r="2.2" fill="#ff3030" />
    </g>
  );
}

function ExteriorArt() {
  const { featured: f, door: d } = EXT;
  return (
    <Svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full">
      {/* logo */}
      <text x="150" y="52" textAnchor="middle" fontSize="28" fontStyle="italic" fontWeight="700" fill={NAVY} {...font}>
        PHOTO BOY
      </text>
      <text x="150" y="68" textAnchor="middle" fontSize="7" fill="#6b6b8a" {...font}>
        DOT MATRIX WITH 4-SHOT PRINTER
      </text>

      {/* console shell: the big rounded bottom-right corner is the giveaway */}
      <path d="M22 88 Q22 78 32 78 H268 Q278 78 278 88 V322 Q278 372 228 372 H32 Q22 372 22 362 Z" fill={SHELL} stroke={SHELL_EDGE} strokeWidth="2.5" />
      <rect x="22" y="84" width="256" height="2" fill={SHELL_EDGE} opacity="0.6" />
      <text x="34" y="96" fontSize="5" fill="#77746c" {...font}>
        ◀ OFF · ON ▶
      </text>

      {/* LCD featured board */}
      <LcdBezel x={f.x - 9} y={f.y - 14} w={f.w + 18} h={f.h + 28} />
      <rect x={f.x} y={f.y} width={f.w} height={f.h} fill={D3} />
      <text x={f.x + f.w / 2} y={f.y + f.h + 22} textAnchor="middle" fontSize="5" fill="#77746c" {...font}>
        SAVED PHOTOS
      </text>

      {/* d-pad, A/B, select/start */}
      <g transform="translate(62 280)">
        <rect x="-18" y="-6" width="36" height="12" rx="2" fill="#2b2b2b" />
        <rect x="-6" y="-18" width="12" height="36" rx="2" fill="#2b2b2b" />
        <circle r="3" fill="#3a3a3a" />
      </g>
      <circle cx="110" cy="290" r="10" fill={MAGENTA} />
      <circle cx="132" cy="276" r="10" fill={MAGENTA} />
      <text x="110" y="309" textAnchor="middle" fontSize="6" fill={NAVY} {...font}>
        B
      </text>
      <text x="132" y="295" textAnchor="middle" fontSize="6" fill={NAVY} {...font}>
        A
      </text>
      {[58, 92].map((x) => (
        <rect key={x} x={x} y="326" width="22" height="6" rx="3" fill="#8e8b84" transform={`rotate(-25 ${x + 11} 329)`} />
      ))}
      {/* speaker grille */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={112 + i * 7} y="330" width="3" height="22" rx="1.5" fill="#9a978e" transform={`rotate(-30 ${113 + i * 7} 341)`} />
      ))}

      {/* doorway as a second LCD with a dithered curtain */}
      <LcdBezel x={d.x - 6} y={d.y - 6} w={d.w + 12} h={d.h + 12} />
      <rect x={d.x + 4} y={d.y + 4} width={d.w - 8} height={d.h - 8} fill={D3} />
      <g style={crisp}>
        {Array.from({ length: 9 }, (_, i) => {
          const lift = Math.max(0, 3 - Math.abs(i - 1)) * 8;
          return <rect key={i} x={d.x + 52 + i * 6.6} y={d.y + 4} width="6.6" height={d.h - 8 - lift} fill={i % 2 ? D1 : D0} />;
        })}
        <rect x={d.x + 52} y={d.y + 118} width={d.w - 56} height="5" fill={D2} />
        <rect x={d.x + 12} y={d.y + 196} width="30" height="6" fill={D1} />
        <rect x={d.x + 16} y={d.y + 202} width="4" height={d.h - 210} fill={D1} />
        <rect x={d.x + 34} y={d.y + 202} width="4" height={d.h - 210} fill={D1} />
      </g>
      <text x={d.x + d.w / 2} y={d.y - 10} textAnchor="middle" fontSize="6" fill={NAVY} {...font}>
        ▼ PRESS A TO ENTER ▼
      </text>
    </Svg>
  );
}

function Lightbox() {
  return (
    <Svg viewBox="0 0 600 160" className="h-full w-full">
      <rect x="6" y="10" width="588" height="140" rx="18" fill={SHELL} stroke={SHELL_EDGE} strokeWidth="4" />
      <circle cx="54" cy="80" r="8" fill="#ff3030" />
      <circle cx="54" cy="80" r="16" fill="#ff3030" opacity="0.2" className="anim-flicker" />
      <text x="54" y="112" textAnchor="middle" fontSize="10" fill="#77746c" {...font}>
        BATTERY
      </text>
      <text x="320" y="90" textAnchor="middle" fontSize="56" fontStyle="italic" fontWeight="700" fill={NAVY} {...font}>
        PHOTO BOY
      </text>
      <text x="320" y="122" textAnchor="middle" fontSize="13" fill="#6b6b8a" {...font}>
        DOT MATRIX WITH 4-SHOT PRINTER
      </text>
    </Svg>
  );
}

function ScreenBezel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 rounded-[10px] rounded-br-[44px] p-[9%] pt-[11%]" style={{ background: BEZEL, boxShadow: "0 6px 0 #3a3a4b" }}>
      <span className="absolute top-[3.5%] left-[6%] h-[2px] w-[55%]" style={{ background: MAGENTA }} />
      <span className="absolute top-[5%] left-[6%] h-[2px] w-[55%]" style={{ background: NAVY }} />
      <span className="absolute top-1/2 left-[3.5%] h-2 w-2 -translate-y-1/2 rounded-full bg-[#ff3030] shadow-[0_0_6px_#ff3030]" />
      <span className="absolute bottom-[3%] left-1/2 -translate-x-1/2 text-[8px] tracking-wider text-[#a9a9c0]" style={font}>
        DOT MATRIX
      </span>
      <div className="relative h-full w-full overflow-hidden border-[3px]" style={{ borderColor: "#2b2b38", background: D3 }}>
        {children}
      </div>
    </div>
  );
}

function EyeLevel() {
  return (
    <div className="text-center text-[10px] leading-tight md:text-xs" style={{ ...font, color: NAVY }}>
      LOOK
      <div className="anim-bulb text-base">▶</div>
    </div>
  );
}

function PriceSticker() {
  // A tiny cartridge: notched top-right corner, green label.
  return (
    <div className="relative px-1.5 pt-2 pb-3" style={{ background: "#aeaba3", clipPath: "polygon(0 0, 78% 0, 100% 12%, 100% 100%, 0 100%)" }}>
      <div className="grid place-items-center border-2 px-1 py-1.5 text-center leading-none" style={{ ...font, background: D3, borderColor: D1, color: D0 }}>
        <div className="text-lg md:text-xl">x4</div>
        <div className="text-[7px] md:text-[8px]">SHOTS</div>
      </div>
    </div>
  );
}

function Instructions() {
  return (
    <div className="card px-3 py-2 text-[10px] leading-relaxed md:text-xs" style={font}>
      <div className="mb-0.5 font-bold" style={{ color: MAGENTA }}>
        HOW TO PLAY
      </div>
      {STEPS.map((s, i) => (
        <div key={s}>
          {i + 1}. {s.toUpperCase()}
        </div>
      ))}
    </div>
  );
}

function CoinPanel({ onClick, go, label }: { onClick?: () => void; go: boolean; label: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`text-sm font-bold transition-opacity md:text-base ${label ? "opacity-100" : "opacity-0"}`} style={{ ...font, color: MAGENTA }}>
        {(label ?? "·").toUpperCase()}
      </span>
      <div className="flex w-16 flex-col items-center gap-1 rounded-xl px-2 py-3 md:w-20" style={{ background: SHELL, border: `2px solid ${SHELL_EDGE}` }}>
        <button
          onClick={onClick}
          aria-label={label ?? "button"}
          className={`h-11 w-11 rounded-full transition-transform active:scale-90 md:h-12 md:w-12 ${go ? "press-me" : ""}`}
          style={{
            background: go ? `radial-gradient(circle at 35% 30%, #d0457f, ${MAGENTA} 60%)` : "#6e6a72",
            boxShadow: "0 3px 0 #5a0d32",
            ["--ring" as string]: MAGENTA,
          }}
        />
        <span className="text-[9px] font-bold" style={{ ...font, color: NAVY }}>
          A
        </span>
      </div>
    </div>
  );
}

function Toggle({ on, onToggle, left, right, label }: ToggleProps) {
  const pill = (active: boolean) => ({
    background: active ? NAVY : "#8e8b84",
    color: active ? "#fff" : "#e8e6df",
  });
  return (
    <button onClick={onToggle} aria-label={label} className="flex -rotate-6 items-center gap-2 text-[9px] md:text-[10px]" style={font}>
      <span className="rounded-full px-3 py-1 transition-colors" style={pill(!on)}>
        {left.toUpperCase()}
      </span>
      <span className="rounded-full px-3 py-1 transition-colors" style={pill(on)}>
        {right.toUpperCase()}
      </span>
    </button>
  );
}

function PrintTimer({ seconds }: { seconds: number }) {
  return (
    <div className="h-full w-full rounded-lg p-[10%]" style={{ background: BEZEL, boxShadow: "0 5px 0 #3a3a4b" }}>
      <div className="grid h-full w-full place-items-center text-center" style={{ ...font, background: D3, color: D0 }}>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] md:text-[11px]">PRINTING</span>
          <span className="text-4xl leading-none md:text-5xl">{seconds}</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="h-2 w-2" style={{ background: i < 5 - seconds ? D0 : D2 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PickupSlot({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-x-0 top-0 z-20 h-[7%] rounded-md" style={{ background: SHELL, border: `2px solid ${SHELL_EDGE}`, boxShadow: "0 3px 0 #a9a69e" }}>
        <div className="mx-auto mt-[6%] h-[30%] w-[82%] rounded-sm bg-[#3a3a3a]" />
      </div>
      <div className="absolute inset-x-[7%] top-[5%] bottom-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Note({ kind }: { kind: "yourStrip" | "tapToSave" }) {
  return (
    <div className="border-2 px-2 py-1 text-center text-[10px] leading-tight md:text-xs" style={{ ...font, background: D3, borderColor: D1, color: D0 }}>
      {kind === "yourStrip" ? "NICE SHOT!" : "TAP TO SAVE"}
    </div>
  );
}

function IconButton({ kind, onClick }: { kind: "cut" | "back"; onClick: () => void }) {
  const Icon = kind === "cut" ? ScissorsIcon : BackIcon;
  return (
    <button
      onClick={onClick}
      aria-label={kind === "cut" ? "Cut into single photos" : "Back to strip"}
      className="grid h-12 w-12 place-items-center rounded-full text-white transition-transform active:scale-90"
      style={{ background: MAGENTA, boxShadow: "0 3px 0 #5a0d32" }}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}

export const photoboy: ThemeKit = {
  id: "photoboy",
  label: "Photo Boy",
  ExteriorArt,
  Lightbox,
  ScreenBezel,
  EyeLevel,
  PriceSticker,
  Instructions,
  CoinPanel,
  Toggle,
  PrintTimer,
  PickupSlot,
  Note,
  IconButton,
};
