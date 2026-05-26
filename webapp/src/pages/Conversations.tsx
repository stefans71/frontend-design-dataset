import { useState, useEffect } from 'react'
import { getConversations } from '@/lib/api'
import type { Conversation } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import Shimmer from '@/components/ui/Shimmer'
import { ChevronRight, ChevronDown, User, Bot } from 'lucide-react'

const typeFilters = [
  { key: 'all', label: 'All', count: 254 },
  { key: 'qualifying_conversation', label: 'Qualifying', count: 150 },
  { key: 'immediate_conversation', label: 'Immediate', count: 104 },
]

const domainList = [
  { key: 'all', label: 'All' },
  { key: 'saas', label: 'SaaS' },
  { key: 'e-commerce', label: 'E-commerce' },
  { key: 'finance', label: 'Finance' },
  { key: 'creative', label: 'Creative' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'fitness', label: 'Fitness' },
  { key: 'education', label: 'Education' },
  { key: 'healthcare', label: 'Healthcare' },
  { key: 'real-estate', label: 'Real Estate' },
  { key: 'legal', label: 'Legal' },
  { key: 'travel', label: 'Travel' },
  { key: 'other', label: 'Other' },
]

const sortOptions = [
  { key: 'default', label: 'Default' },
  { key: 'turns_desc', label: 'Most turns' },
  { key: 'turns_asc', label: 'Fewest turns' },
]

function SidebarItem({ label, active, count, onClick }: { label: string; active: boolean; count?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left cursor-pointer bg-transparent border-0"
      style={{
        padding: '6px 8px',
        paddingLeft: active ? 10 : 8,
        fontSize: 14,
        borderRadius: 4,
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: active ? 500 : 400,
        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
        background: active ? 'var(--bg-secondary)' : 'transparent',
        transition: 'all 150ms',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{count}</span>
      )}
    </button>
  )
}

function SidebarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--text-muted)', marginBottom: 8, paddingBottom: 4,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

export default function Conversations() {
  const [convs, setConvs] = useState<Conversation[]>([])
  const [total, setTotal] = useState(0)
  const [type, setType] = useState('all')
  const [domain, setDomain] = useState('all')
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [domainCounts, setDomainCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    setLoading(true)
    getConversations({
      type: type !== 'all' ? type : undefined,
      domain: domain !== 'all' ? domain : undefined,
      sort: sort !== 'default' ? sort : undefined,
      page,
    })
      .then(res => {
        setConvs(res.items)
        setTotal(res.total)
        if (res.domainCounts) setDomainCounts(res.domainCounts)
      })
      .finally(() => setLoading(false))
  }, [type, domain, sort, page])

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
          TRAINING DATA · CONVERSATIONS
        </div>
        <h1 className="text-text-primary" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>
          Qualifying Conversations
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 580, lineHeight: 1.6, marginBottom: 12 }}>
          254 conversation traces used to train the qualifying question behavior.
          <strong style={{ color: 'var(--text-primary)' }}> Qualifying</strong> traces show the model asking clarifying questions before building.
          <strong style={{ color: 'var(--text-primary)' }}> Immediate</strong> traces show direct builds on clear, specific prompts.
        </p>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span><strong style={{ color: '#2dd4bf' }}>150</strong> qualifying — model asks first</span>
          <span>·</span>
          <span><strong style={{ color: 'var(--accent)' }}>104</strong> immediate — direct build</span>
          <span>·</span>
          <span><strong style={{ color: 'var(--text-primary)' }}>3.4</strong> avg turns</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gallery-layout" style={{ gap: 32 }}>
        {/* Sidebar */}
        <aside className="shrink-0 space-y-5 gallery-sidebar" style={{ width: 200 }}>
          <SidebarGroup label="Type">
            {typeFilters.map(f => (
              <SidebarItem
                key={f.key}
                label={f.label}
                count={f.count}
                active={type === f.key}
                onClick={() => { setType(f.key); setPage(0) }}
              />
            ))}
          </SidebarGroup>

          <SidebarGroup label="Domain">
            {domainList.map(d => (
              <SidebarItem
                key={d.key}
                label={d.label}
                count={d.key === 'all' ? undefined : domainCounts[d.key]}
                active={domain === d.key}
                onClick={() => { setDomain(d.key); setPage(0) }}
              />
            ))}
          </SidebarGroup>

          <SidebarGroup label="Sort">
            {sortOptions.map(s => (
              <SidebarItem
                key={s.key}
                label={s.label}
                active={sort === s.key}
                onClick={() => { setSort(s.key); setPage(0) }}
              />
            ))}
          </SidebarGroup>

          {(type !== 'all' || domain !== 'all' || sort !== 'default') && (
            <button
              onClick={() => { setType('all'); setDomain('all'); setSort('default'); setPage(0) }}
              className="cursor-pointer transition-colors duration-150 bg-transparent border-0"
              style={{ fontSize: 12, color: 'var(--text-muted)' }}
            >
              Reset filters
            </button>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Shimmer key={i} className="h-16" />
              ))}
            </div>
          ) : convs.length === 0 ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
              <p className="text-text-muted" style={{ fontSize: 16 }}>No conversations found</p>
              <p className="text-text-muted" style={{ fontSize: 14, marginTop: 4 }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {convs.map(conv => {
                const isExpanded = expanded === conv.id
                const isQualifying = conv.type === 'qualifying_conversation'
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
                          {isExpanded
                            ? <ChevronDown size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                            : <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          }
                          <Badge variant={isQualifying ? 'accent' : 'outline'}>
                            {isQualifying ? 'qualifying' : 'immediate'}
                          </Badge>
                          {conv.domain && conv.domain !== 'other' && (
                            <span className="text-text-primary" style={{ fontSize: 14, fontWeight: 500 }}>{conv.domain}</span>
                          )}
                          {conv.persona && (
                            <span className="text-text-muted" style={{ fontSize: 13 }}>· {conv.persona}</span>
                          )}
                        </div>
                        <span className="font-mono text-text-muted" style={{ fontSize: 11 }}>{conv.turn_count} turns</span>
                      </div>
                      {conv.messages?.[0] && (
                        <p className="line-clamp-1 text-text-secondary" style={{ fontSize: 13, marginTop: 6, marginLeft: 27 }}>
                          "{conv.messages[0].content}"
                        </p>
                      )}
                    </div>

                    {/* Expanded messages */}
                    <div className={`expand-content ${isExpanded ? 'open' : ''}`}>
                      <div>
                        <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 16 }}>
                            {conv.messages?.map((msg, i) => {
                              const isUser = msg.role === 'user'
                              const htmlMatch = msg.content.match(/(<!DOCTYPE[\s\S]*|<html[\s\S]*)/)
                              const hasHtml = !!htmlMatch
                              const preamble = hasHtml ? msg.content.slice(0, msg.content.indexOf(htmlMatch![0])).trim() : null
                              const htmlContent = hasHtml ? htmlMatch![0] : null

                              return (
                                <div
                                  key={i}
                                  style={{
                                    padding: '14px 16px',
                                    borderRadius: 8,
                                    background: isUser ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                                    marginLeft: isUser ? 48 : 0,
                                    marginRight: isUser ? 0 : 48,
                                    border: '1px solid var(--border-subtle)',
                                  }}
                                >
                                  <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                                    {isUser
                                      ? <User size={12} style={{ color: 'var(--accent)' }} />
                                      : <Bot size={12} style={{ color: 'var(--score-high)' }} />
                                    }
                                    <span style={{
                                      fontSize: 11,
                                      fontWeight: 600,
                                      letterSpacing: '0.06em',
                                      textTransform: 'uppercase' as const,
                                      color: isUser ? 'var(--accent)' : 'var(--score-high)',
                                    }}>
                                      {msg.role}
                                    </span>
                                  </div>
                                  {hasHtml ? (
                                    <div>
                                      {preamble && (
                                        <p className="text-text-primary" style={{ fontSize: 13, lineHeight: 1.6, margin: '0 0 10px' }}>
                                          {preamble}
                                        </p>
                                      )}
                                      <div className="rounded-lg overflow-hidden border border-border">
                                        <div className="flex items-center justify-between bg-bg-secondary" style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)' }}>
                                          <div className="flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--border)' }} />
                                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--border)' }} />
                                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--border)' }} />
                                            </div>
                                            <span className="font-mono text-text-muted" style={{ fontSize: 10 }}>output.html</span>
                                          </div>
                                          <span className="font-mono" style={{ fontSize: 10, color: 'var(--score-high)' }}>{msg.content.length.toLocaleString()} chars</span>
                                        </div>
                                        <iframe
                                          srcDoc={htmlContent!}
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
                              )
                            })}
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
                style={{ padding: '6px 10px', fontSize: 14, borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)' }}
              >
                ←
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                let pageNum: number
                if (totalPages <= 7) pageNum = i
                else if (page < 3) pageNum = i
                else if (page > totalPages - 4) pageNum = totalPages - 7 + i
                else pageNum = page - 3 + i
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className="font-mono cursor-pointer transition-colors duration-150"
                    style={{
                      width: 32, height: 32,
                      fontSize: 13,
                      borderRadius: 'var(--radius)',
                      border: page === pageNum ? '1px solid var(--accent)' : '1px solid transparent',
                      background: page === pageNum ? 'var(--accent)' : 'transparent',
                      color: page === pageNum ? '#fff' : 'var(--text-muted)',
                      fontWeight: page === pageNum ? 600 : 400,
                    }}
                  >
                    {pageNum + 1}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="cursor-pointer disabled:cursor-default disabled:opacity-25 transition-colors duration-150"
                style={{ padding: '6px 10px', fontSize: 14, borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)' }}
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
