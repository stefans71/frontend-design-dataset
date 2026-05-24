export default function ThemeToggle({ theme, onToggle }: { theme: string; onToggle: () => void }) {
  return <button onClick={onToggle}>{theme}</button>
}
