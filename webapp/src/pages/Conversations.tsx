import { useState, useEffect } from 'react'
import { getConversations } from '@/lib/api'
import type { Conversation } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import Shimmer from '@/components/ui/Shimmer'

export default function Conversations() {
  const [convs, setConvs] = useState<Conversation[]>([])
  const [total, setTotal] = useState(0)
  const [type, setType] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getConversations({ type: type !== 'all' ? type : undefined, page })
      .then(res => { setConvs(res.items); setTotal(res.total) })
      .finally(() => setLoading(false))
  }, [type, page])

  const totalPages = Math.ceil(total / 20)

  const typeFilters = [
    { value: 'all', label: 'All' },
    { value: 'qualifying_conversation', label: 'Qualifying' },
    { value: 'immediate_conversation', label: 'Immediate' },
  ]

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <span className="section-label block" style={{ marginBottom: 8 }}>Traces</span>
        <h1 className="text-text-primary" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
          Conversation Traces
        </h1>
        <p className="text-text-secondary" style={{ fontSize: 14, lineHeight: 1.6, marginTop: 8, maxWidth: 560 }}>
          {total} multi-turn conversations used for fine-tuning. Qualifying traces
          show the model asking clarifying questions before building.
        </p>
      </div>

      {/* Type filters */}
      <div className="flex gap-2" style={{ marginBottom: 20 }}>
        {typeFilters.map(f => (
          <button
            key={f.value}
            onClick={() => { setType(f.value); setPage(0) }}
            className="cursor-pointer transition-colors duration-150"
            style={{
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: type === f.value ? 600 : 400,
              borderRadius: 6,
              border: type === f.value ? '1px solid var(--border)' : '1px solid transparent',
              background: type === f.value ? 'var(--bg-elevated)' : 'transparent',
              color: type === f.value ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {convs.map(conv => {
            const isExpanded = expanded === conv.id
            return (
              <div
                key={conv.id}
                className="rounded-lg overflow-hidden transition-all duration-150"
                style={{
                  border: isExpanded ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: isExpanded ? 'var(--bg-card)' : 'transparent',
                }}
              >
                {/* Row header */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : conv.id)}
                  className="cursor-pointer transition-colors duration-100"
                  style={{ padding: '14px 20px' }}
                  onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--bg-secondary)' }}
                  onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted" style={{ fontSize: 11, width: 12, textAlign: 'center' }}>
                        {isExpanded ? '▾' : '▸'}
                      </span>
                      <Badge variant={conv.type === 'qualifying_conversation' ? 'accent' : 'outline'}>
                        {conv.type === 'qualifying_conversation' ? 'qualifying' : 'immediate'}
                      </Badge>
                      {conv.domain && (
                        <span className="text-text-primary" style={{ fontSize: 14, fontWeight: 500 }}>{conv.domain}</span>
                      )}
                      {conv.persona && (
                        <span className="text-text-muted" style={{ fontSize: 13 }}>· {conv.persona}</span>
                      )}
                    </div>
                    <span className="font-mono text-text-muted" style={{ fontSize: 11 }}>{conv.turn_count} turns</span>
                  </div>
                  {conv.messages?.[0] && (
                    <p className="line-clamp-1" style={{ fontSize: 13, marginTop: 6, marginLeft: 27, color: '#22c55e' }}>
                      "{conv.messages[0].content}"
                    </p>
                  )}
                </div>

                {/* Expanded messages */}
                <div className={`expand-content ${isExpanded ? 'open' : ''}`}>
                  <div>
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16 }}>
                        {conv.messages?.map((msg, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '12px 16px',
                              borderRadius: 8,
                              background: msg.role === 'user' ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                              marginLeft: msg.role === 'user' ? 48 : 0,
                              marginRight: msg.role === 'user' ? 0 : 48,
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                              <span style={{
                                fontSize: 10,
                                fontWeight: 600,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase' as const,
                                color: msg.role === 'user' ? 'var(--accent)' : 'var(--score-high)',
                              }}>
                                {msg.role}
                              </span>
                            </div>
                            {msg.content.includes('<!DOCTYPE') || msg.content.includes('<html') ? (
                              <div>
                                <div className="rounded-lg overflow-hidden border border-border" style={{ marginTop: 4 }}>
                                  <div className="flex items-center justify-between bg-bg-secondary" style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)' }}>
                                    <div className="flex items-center gap-2">
                                      <div className="flex gap-1.5">
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--border)' }} />
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--border)' }} />
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--border)' }} />
                                      </div>
                                      <span className="font-mono text-text-muted" style={{ fontSize: 10 }}>output.html</span>
                                    </div>
                                    <span style={{ fontSize: 10, color: '#22c55e' }}>{msg.content.length.toLocaleString()} chars</span>
                                  </div>
                                  <iframe
                                    srcDoc={msg.content}
                                    title="HTML output"
                                    className="w-full border-0"
                                    style={{ height: 400, background: '#fff' }}
                                    sandbox="allow-scripts"
                                  />
                                </div>
                              </div>
                            ) : (
                              <p className="text-text-primary" style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                                {msg.content}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1" style={{ marginTop: 32 }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="cursor-pointer disabled:cursor-default disabled:opacity-25 transition-colors duration-150"
            style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)' }}
          >
            ←
          </button>
          <span className="font-mono text-text-muted" style={{ fontSize: 12, padding: '0 12px' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="cursor-pointer disabled:cursor-default disabled:opacity-25 transition-colors duration-150"
            style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)' }}
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
