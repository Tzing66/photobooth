import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetSettings } from "../lib/frames";
import { clearSession } from "../lib/storage";
import { useGallery } from "../hooks/useGallery";
import { useTheme } from "../themes/ThemeContext";
import { EXT } from "../themes/shared";

const TILTS = ["-rotate-4", "rotate-2 -translate-y-0.5", "-rotate-3", "rotate-3 -translate-y-0.5", "-rotate-3 -translate-y-0.5"];
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** Five of your past strips (random), or blank strips until you've made some. */
function FeaturedBoard() {
  const { items } = useGallery();
  const picks = useMemo(() => (items ? [...items].sort(() => Math.random() - 0.5).slice(0, 5) : []), [items]);

  return (
    <div className="flex h-full w-full items-center justify-center gap-[4%] px-[8%] py-[6%]">
      {picks.length
        ? picks.map((p, i) => <img key={p.id} src={p.url} alt="Past strip" className={`h-full w-auto max-w-[17%] object-contain shadow-sm ${TILTS[i]}`} />)
        : TILTS.map((t, i) => (
            <div key={i} className={`flex h-full w-[14%] flex-col gap-[6%] bg-[#e9e5dd] p-[2%] opacity-80 ${t}`}>
              {[0, 1, 2, 3].map((k) => (
                <div key={k} className="flex-1 bg-[#8d877f]" />
              ))}
            </div>
          ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { kit } = useTheme();
  const { featured: f, enter } = EXT;

  const enterBooth = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.error("Failed to clear previous session", e);
    }
    resetSettings();
    navigate("/frameSelection");
  };

  return (
    <div className="flex h-dvh w-full items-center justify-center p-4 md:p-8">
      <div className="relative" style={{ width: "min(100%, 40rem, calc((100dvh - 2rem) * 0.75))", aspectRatio: "3 / 4" }}>
        <kit.ExteriorArt />

        <button
          onClick={() => navigate("/features")}
          aria-label="See your past strips"
          className="absolute"
          style={{ left: pct(f.x, EXT.w), top: pct(f.y, EXT.h), width: pct(f.w, EXT.w), height: pct(f.h, EXT.h) }}
        >
          <FeaturedBoard />
        </button>

        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: pct(enter.x, EXT.w), top: pct(enter.y, EXT.h) }}>
          <button className="btn btn-lg" onClick={enterBooth}>
            enter
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </button>
        </div>

        <nav className="absolute inset-x-0 flex -translate-y-1/2 justify-center gap-5 text-[10px] sm:text-xs md:text-sm" style={{ top: pct(EXT.footerY, EXT.h) }}>
          <Link to="/features" className="link">
            Gallery
          </Link>
          <Link to="/faq" className="link">
            FAQ
          </Link>
          <Link to="/about" className="link">
            About
          </Link>
        </nav>
      </div>
    </div>
  );
}
