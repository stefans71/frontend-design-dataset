import { useState, useEffect } from 'react'
import { getConversations } from '@/lib/api'
import type { Conversation } from '@/lib/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import PageWrapper from '@/components/ui/PageWrapper'
import SectionHeading from '@/components/ui/SectionHeading'
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
    <PageWrapper>
      <SectionHeading
        title="Conversation Traces"
        subtitle={`${total} conversations — qualifying (ask questions) vs immediate (build directly)`}
        divider
        className="mb-8"
      />

      <div className="flex gap-2 mb-6">
        {typeFilters.map(f => (
          <button
            key={f.value}
            onClick={() => { setType(f.value); setPage(0) }}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-[var(--duration-fast)] cursor-pointer ${
              type === f.value
                ? 'bg-accent text-white'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {convs.map(conv => (
            <Card key={conv.id} padding={false}>
              <button
                onClick={() => setExpanded(expanded === conv.id ? null : conv.id)}
                className="w-full text-left p-4 cursor-pointer bg-transparent border-none text-inherit"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={conv.type === 'qualifying_conversation' ? 'accent' : 'default'}>
                      {conv.type === 'qualifying_conversation' ? 'qualifying' : 'immediate'}
                    </Badge>
                    {conv.domain && (
                      <span className="text-sm text-text-secondary">{conv.domain}</span>
                    )}
                    {conv.persona && (
                      <span className="text-xs text-text-muted">{conv.persona}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-text-muted">{conv.turn_count} turns</span>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className="text-text-muted transition-transform duration-[var(--duration-base)]"
                      style={{ transform: expanded === conv.id ? 'rotate(180deg)' : 'rotate(0)' }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
                {conv.messages?.[0] && (
                  <p className="text-sm mt-2 line-clamp-1 text-text-muted italic">
                    {conv.messages[0].content}
                  </p>
                )}
              </button>

              <div className={`expand-content ${expanded === conv.id ? 'open' : ''}`}>
                <div>
                  <div className="px-4 pb-4 space-y-3 border-t border-border-subtle">
                    <div className="pt-3" />
                    {conv.messages?.map((msg, i) => (
                      <div
                        key={i}
                        className={`rounded-[var(--radius)] p-3 ${
                          msg.role === 'user'
                            ? 'bg-accent-subtle border-l-2 border-accent ml-8'
                            : 'bg-bg-secondary border-l-2 border-border-accent mr-8'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`label-caps ${msg.role === 'user' ? 'text-accent' : 'text-text-muted'}`}>
                            {msg.role}
                          </span>
                        </div>
                        {msg.content.includes('<!DOCTYPE') || msg.content.includes('<html') ? (
                          <details>
                            <summary className="text-xs cursor-pointer text-text-muted hover:text-text-secondary transition-colors">
                              HTML output ({msg.content.length.toLocaleString()} chars)
                            </summary>
                            <pre className="mt-2 p-3 rounded text-xs overflow-x-auto font-mono max-h-60 overflow-y-auto bg-bg-primary text-text-secondary border border-border-subtle">
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
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm rounded-[var(--radius)] bg-bg-secondary text-text-secondary hover:bg-bg-elevated transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-default"
          >
            Prev
          </button>
          <span className="text-sm px-3 font-mono text-text-muted">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-sm rounded-[var(--radius)] bg-bg-secondary text-text-secondary hover:bg-bg-elevated transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-default"
          >
            Next
          </button>
        </div>
      )}
    </PageWrapper>
  )
}
