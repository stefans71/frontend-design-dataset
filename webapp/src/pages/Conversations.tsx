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
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div className="mb-6">
        <span className="section-label">Traces</span>
        <h1 className="font-semibold text-text-primary mt-2" style={{ fontSize: 20 }}>Conversations</h1>
        <p className="text-sm text-text-muted mt-0.5">{total} total</p>
      </div>

      <div className="flex gap-2 mb-5">
        {typeFilters.map(f => (
          <button
            key={f.value}
            onClick={() => { setType(f.value); setPage(0) }}
            className={`px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors duration-150 ${
              type === f.value
                ? 'bg-bg-elevated text-text-primary font-medium border border-border'
                : 'text-text-secondary hover:text-text-primary border border-transparent'
            }`}
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
        <div className="rounded-lg border border-border overflow-hidden">
          {convs.map((conv, ci) => (
            <div key={conv.id} className={ci > 0 ? 'border-t border-border-subtle' : ''}>
              <button
                onClick={() => setExpanded(expanded === conv.id ? null : conv.id)}
                className="w-full text-left p-4 cursor-pointer bg-transparent border-none text-inherit hover:bg-bg-secondary/50 transition-colors duration-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={conv.type === 'qualifying_conversation' ? 'accent' : 'outline'}>
                      {conv.type === 'qualifying_conversation' ? 'qualifying' : 'immediate'}
                    </Badge>
                    {conv.domain && (
                      <span className="text-sm text-text-primary">{conv.domain}</span>
                    )}
                    {conv.persona && (
                      <span className="text-sm text-text-muted">· {conv.persona}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-text-muted">{conv.turn_count} turns</span>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className="text-text-muted transition-transform duration-200"
                      style={{ transform: expanded === conv.id ? 'rotate(180deg)' : 'rotate(0)' }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
                {conv.messages?.[0] && (
                  <p className="text-sm mt-1.5 line-clamp-1 text-text-muted">
                    "{conv.messages[0].content}"
                  </p>
                )}
              </button>

              <div className={`expand-content ${expanded === conv.id ? 'open' : ''}`}>
                <div>
                  <div className="px-4 pb-4 space-y-2 border-t border-border-subtle pt-3">
                    {conv.messages?.map((msg, i) => (
                      <div
                        key={i}
                        className={`rounded-md p-3 ${
                          msg.role === 'user'
                            ? 'bg-bg-elevated ml-8'
                            : 'bg-bg-secondary mr-8'
                        }`}
                      >
                        <span className="text-xs font-medium text-text-muted block mb-1">
                          {msg.role}
                        </span>
                        {msg.content.includes('<!DOCTYPE') || msg.content.includes('<html') ? (
                          <details>
                            <summary className="text-xs cursor-pointer text-text-muted hover:text-text-secondary transition-colors duration-150">
                              HTML output · {msg.content.length.toLocaleString()} chars
                            </summary>
                            <pre className="mt-2 p-3 rounded-md text-xs overflow-x-auto font-mono max-h-60 overflow-y-auto bg-bg-primary text-text-secondary border border-border-subtle">
                              {msg.content.slice(0, 2000)}
                              {msg.content.length > 2000 && '\n... truncated'}
                            </pre>
                          </details>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap text-text-primary leading-relaxed">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-2.5 py-1.5 text-sm rounded-md border border-border text-text-secondary hover:bg-bg-elevated transition-colors duration-150 disabled:opacity-25 cursor-pointer disabled:cursor-default"
          >
            ←
          </button>
          <span className="font-mono text-sm px-3 text-text-muted">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-2.5 py-1.5 text-sm rounded-md border border-border text-text-secondary hover:bg-bg-elevated transition-colors duration-150 disabled:opacity-25 cursor-pointer disabled:cursor-default"
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
