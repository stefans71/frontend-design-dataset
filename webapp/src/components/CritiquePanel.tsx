function parseLine(line: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = line
  let key = 0

  while (remaining.length > 0) {
    const codeMatch = remaining.match(/`([^`]+)`/)
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)

    const nextCode = codeMatch?.index ?? Infinity
    const nextBold = boldMatch?.index ?? Infinity

    if (nextCode === Infinity && nextBold === Infinity) {
      parts.push(remaining)
      break
    }

    if (nextCode <= nextBold && codeMatch) {
      if (codeMatch.index! > 0) parts.push(remaining.slice(0, codeMatch.index))
      parts.push(
        <code key={key++} style={{ fontSize: 12, fontFamily: 'var(--font-mono)', padding: '1px 5px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--accent)' }}>
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch.index! + codeMatch[0].length)
    } else if (boldMatch) {
      if (boldMatch.index! > 0) parts.push(remaining.slice(0, boldMatch.index))
      parts.push(<strong key={key++} className="text-text-primary" style={{ fontWeight: 600 }}>{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch.index! + boldMatch[0].length)
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}

function renderBlocks(lines: string[]): React.ReactNode[] {
  const blocks: React.ReactNode[] = []
  let blockKey = 0
  let j = 0

  while (j < lines.length) {
    const line = lines[j]

    if (line.trim() === '') {
      j++
      continue
    }

    if (line.match(/^- /)) {
      const bullets: string[] = []
      while (j < lines.length && lines[j].match(/^- /)) {
        bullets.push(lines[j].replace(/^- /, ''))
        j++
      }
      blocks.push(
        <ul key={blockKey++} style={{ margin: '6px 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {bullets.map((b, bi) => (
            <li key={bi} className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>
              {parseLine(b)}
            </li>
          ))}
        </ul>
      )
      continue
    }

    const subHeadingMatch = line.match(/^(.+?):$/)
    if (subHeadingMatch && line.length < 80 && !line.startsWith('-')) {
      blocks.push(
        <p key={blockKey++} className="text-text-primary" style={{ fontSize: 13, fontWeight: 600, margin: '10px 0 2px' }}>
          {parseLine(subHeadingMatch[1])}
        </p>
      )
      j++
      continue
    }

    blocks.push(
      <p key={blockKey++} className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.6, margin: '4px 0' }}>
        {parseLine(line)}
      </p>
    )
    j++
  }

  return blocks
}

export default function CritiquePanel({ critique }: { critique: string }) {
  const lines = critique.trim().split('\n')

  const scoreMatch = critique.match(/(?:\*\*)?(?:Overall )?Score(?:\*\*)?[:\s]*`?(\d+(?:\.\d+)?\/\d+)`?/i)

  const introLines: string[] = []
  const sections: { title: string; lines: string[] }[] = []
  let current: { title: string; lines: string[] } | null = null
  let pastScore = false

  for (const line of lines) {
    const sectionMatch = line.match(/^\*\*(\d+\..+?)\*\*\s*$/)
    if (sectionMatch) {
      if (current) sections.push(current)
      current = { title: sectionMatch[1], lines: [] }
      pastScore = true
      continue
    }

    if (line.match(/^\*\*(?:Overall )?Score\*\*\s*$/i) || line.match(/^\*\*Score:/i) || line.match(/^`?\d+(?:\.\d+)?\/\d+`?$/)) {
      pastScore = true
      continue
    }

    if (current) {
      current.lines.push(line)
    } else if (pastScore && line.trim()) {
      introLines.push(line)
    }
  }
  if (current) sections.push(current)

  return (
    <div>
      {scoreMatch && (
        <div className="flex items-center gap-3" style={{ marginBottom: introLines.length > 0 ? 12 : 20, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="font-mono text-text-primary" style={{ fontSize: 24, fontWeight: 700 }}>{scoreMatch[1]}</span>
          <span className="text-text-muted" style={{ fontSize: 13 }}>GPT-5.4 Design Score</span>
        </div>
      )}

      {introLines.length > 0 && (
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
          {introLines.map((line, i) => (
            <p key={i} className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.6, margin: '4px 0', fontStyle: 'italic' }}>
              {parseLine(line)}
            </p>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sections.map((section, i) => (
          <div key={i}>
            <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
              <span className="font-mono text-accent" style={{ fontSize: 11, fontWeight: 600 }}>
                {section.title.match(/^(\d+)\./)?.[1]?.padStart(2, '0')}
              </span>
              <span className="text-text-primary" style={{ fontSize: 14, fontWeight: 600 }}>
                {section.title.replace(/^\d+\.\s*/, '')}
              </span>
            </div>
            <div style={{ paddingLeft: 24 }}>
              {renderBlocks(section.lines)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
