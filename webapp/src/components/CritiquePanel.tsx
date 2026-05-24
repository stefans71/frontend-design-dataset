export default function CritiquePanel({ critique }: { critique: string }) {
  const sections = critique.split(/(?=\*\*\d+\.)/)

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const lines = section.trim().split('\n')
        const title = lines[0]?.replace(/\*\*/g, '').trim()
        const body = lines.slice(1).join('\n').trim()
        return (
          <div key={i}>
            {title && (
              <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h4>
            )}
            <div
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--text-secondary)' }}
            >
              {body}
            </div>
          </div>
        )
      })}
    </div>
  )
}
