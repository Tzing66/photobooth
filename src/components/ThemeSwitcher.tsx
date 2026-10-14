import { useTheme } from "../themes/ThemeContext";

/** Floating pill that cycles through the four booth themes. */
export default function ThemeSwitcher() {
  const { kit, cycle } = useTheme();
  return (
    <button
      onClick={cycle}
      className="btn fixed right-3 bottom-3 z-40 h-10 w-10 p-0! text-xs! sm:h-auto sm:w-auto sm:px-3! sm:py-1.5! md:right-5 md:bottom-5"
      title="Switch booth theme"
      aria-label={`Theme: ${kit.label}. Switch theme`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5" />
      </svg>
      <span className="hidden sm:inline">{kit.label}</span>
    </button>
  );
}
