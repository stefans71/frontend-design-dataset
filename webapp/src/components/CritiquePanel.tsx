export default function CritiquePanel({ critique }: { critique: string }) {
  const sections = critique.split(/(?=\*\*\d+\.)/)

  return (
    <div className="space-y-3">
      {sections.map((section, i) => {
        const lines = section.trim().split('\n')
        const title = lines[0]?.replace(/\*\*/g, '').trim()
        const body = lines.slice(1).join('\n').trim()
        return (
          <div key={i} className="pl-3 border-l border-border-subtle">
            {title && (
              <h4 className="text-sm font-medium text-text-primary mb-1">{title}</h4>
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
