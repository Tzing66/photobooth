export default function Spinner({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <div className={`${className} animate-[spin_3s_linear_infinite] rounded-full border-4 border-dashed`} style={{ borderColor: "var(--t-ink)" }} role="status" aria-label="Loading" />
  );
}
