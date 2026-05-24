import { useState, useEffect } from 'react'
import { getConversations } from '@/lib/api'
import type { Conversation } from '@/lib/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Conversation Traces</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {total} conversations — qualifying (ask questions) vs immediate (build directly)
        </p>
      </div>

      <div className="flex gap-2">
        {typeFilters.map(f => (
          <button
            key={f.value}
            onClick={() => { setType(f.value); setPage(0) }}
            className="px-3 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer"
            style={{
              backgroundColor: type === f.value ? 'var(--accent)' : 'var(--bg-secondary)',
              color: type === f.value ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-[var(--radius-lg)] animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {convs.map(conv => (
            <Card key={conv.id} padding={false}>
              <button
                onClick={() => setExpanded(expanded === conv.id ? null : conv.id)}
                className="w-full text-left p-4 cursor-pointer"
                style={{ background: 'none', border: 'none', color: 'inherit' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={conv.type === 'qualifying_conversation' ? 'accent' : 'default'}>
                      {conv.type === 'qualifying_conversation' ? 'qualifying' : 'immediate'}
                    </Badge>
                    {conv.domain && (
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{conv.domain}</span>
                    )}
                    {conv.persona && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{conv.persona}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{conv.turn_count} turns</span>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{
                        color: 'var(--text-muted)',
                        transform: expanded === conv.id ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
                {conv.messages?.[0] && (
                  <p className="text-sm mt-2 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                    {conv.messages[0].content}
                  </p>
                )}
              </button>

              {expanded === conv.id && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="pt-3" />
                  {conv.messages?.map((msg, i) => (
                    <div
                      key={i}
                      className="rounded-[var(--radius)] p-3"
                      style={{
                        backgroundColor: msg.role === 'user' ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                        border: msg.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase" style={{ color: msg.role === 'user' ? 'var(--accent)' : 'var(--text-muted)' }}>
                          {msg.role}
                        </span>
                      </div>
                      {msg.content.includes('<!DOCTYPE') || msg.content.includes('<html') ? (
                        <details>
                          <summary className="text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                            HTML output ({msg.content.length.toLocaleString()} chars)
                          </summary>
                          <pre
                            className="mt-2 p-3 rounded text-xs overflow-x-auto font-mono max-h-60 overflow-y-auto"
                            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                          >
                            {msg.content.slice(0, 2000)}
                            {msg.content.length > 2000 && '\n... truncated'}
                          </pre>
                        </details>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                          {msg.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm rounded-[var(--radius)] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-default"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          >
            Prev
          </button>
          <span className="text-sm px-2" style={{ color: 'var(--text-muted)' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-sm rounded-[var(--radius)] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-default"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
