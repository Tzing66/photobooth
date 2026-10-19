import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { BACKDROPS, filmDef, frameDef, getBackdrop, getFilm, getFrame, isAuthentic, isColorMode, isFalloff } from "../lib/frames";
import { useTheme } from "../themes/ThemeContext";

interface Props {
  children: ReactNode;
  /** Text above the coin button; null hides it. */
  actionLabel?: string | null;
  /** Green = ready to press, red = idle/disabled. */
  actionReady?: boolean;
  onAction?: () => void;
  /** Hide the "change" link (e.g. mid-shoot). */
  locked?: boolean;
}

/** One line recap of what was chosen on the set-up screen. */
function Summary({ locked }: { locked: boolean }) {
  const navigate = useNavigate();
  const backdrop = getBackdrop();
  const parts = [
    frameDef(getFrame()).name,
    isColorMode() ? "Colour" : "B&W",
    ...(isAuthentic() ? [filmDef(getFilm(), isColorMode()).name, ...(isFalloff() ? ["Flash"] : [])] : ["Normal"]),
    ...(backdrop === "none" ? [] : [BACKDROPS.find((b) => b.type === backdrop)!.name]),
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 text-xs text-muted md:text-sm">
      <span>{parts.join(" · ")}</span>
      {!locked && (
        <button className="link" onClick={() => navigate("/setup")}>
          change
        </button>
      )}
    </div>
  );
}

/**
 * Inside the booth: lightbox sign, the screen (children render on it), price
 * sticker, a recap of the chosen settings, instructions and the coin button
 * that drives each step.
 */
export default function BoothInterior({ children, actionLabel = null, actionReady = false, onAction, locked = false }: Props) {
  const { kit } = useTheme();

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-start gap-3 overflow-auto px-4 pt-5 pb-16 sm:pb-6 md:gap-4">
      <div className="h-[clamp(64px,15dvh,150px)] w-full max-w-2xl shrink-0">
        <kit.Lightbox />
      </div>

      <div className="relative shrink-0" style={{ width: "min(68vw, calc(48dvh * 0.75), 22rem)", aspectRatio: "3 / 4" }}>
        <kit.ScreenBezel>{children}</kit.ScreenBezel>
        <div className="absolute bottom-[6%] left-full z-20 ml-1 w-[3.6rem] max-[350px]:hidden md:ml-4 md:w-[5rem]">
          <kit.PriceSticker />
        </div>
      </div>

      <Summary locked={locked} />

      <div className="flex w-full max-w-md items-end justify-center gap-4 md:max-w-lg">
        <div className="max-w-[16rem] flex-1">
          <kit.Instructions />
        </div>
        <kit.CoinPanel onClick={onAction} go={actionReady} label={actionLabel} />
      </div>
    </div>
  );
}
