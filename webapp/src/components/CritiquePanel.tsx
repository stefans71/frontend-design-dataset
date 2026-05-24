export default function CritiquePanel({ critique }: { critique: string }) {
  const sections = critique.split(/(?=\*\*\d+\.)/)

  return (
    <div className="space-y-5">
      {sections.map((section, i) => {
        const lines = section.trim().split('\n')
        const title = lines[0]?.replace(/\*\*/g, '').trim()
        const body = lines.slice(1).join('\n').trim()
        return (
          <div key={i} className="border-l-2 border-border-accent pl-4">
            {title && (
              <h4 className="font-display text-base text-text-display mb-1.5">{title}</h4>
            )}
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-text-secondary">
              {body}
            </div>
          </div>
        )
      })}
    </div>
  )
}
