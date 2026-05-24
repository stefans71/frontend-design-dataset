export default function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-[var(--duration-base)] cursor-pointer ${
        checked ? 'bg-accent' : 'bg-border'
      }`}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white transition-transform duration-[var(--duration-base)]"
        style={{ transform: checked ? 'translateX(24px)' : 'translateX(4px)' }}
      />
    </button>
  )
}
