import { useState, useEffect } from 'react'
import { getConversations } from '@/lib/api'
import type { Conversation } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import Shimmer from '@/components/ui/Shimmer'
import { MessageSquare, HelpCircle, Zap, ChevronRight, ChevronDown, User, Bot } from 'lucide-react'

function StatCard({ label, sublabel, value, color }: { label: string; sublabel: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '20px 24px' }}>
      <span className="block text-text-secondary" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 2 }}>{label}</span>
      <span className="text-text-secondary block" style={{ fontSize: 11, marginBottom: 10 }}>{sublabel}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-mono" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, color: color || 'var(--text-primary)' }}>{value}</span>
      </div>
    </div>
  )
}

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
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
          TRACES · TRAINING DATA
        </div>
        <h1 className="text-text-primary" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>
          Conversation Traces
        </h1>
        <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.4 }}>
          Multi-turn conversations that teach the model when to ask and when to build
        </h2>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { Icon: HelpCircle, text: 'Qualifying — model asks clarifying questions before writing code (150 traces)' },
            { Icon: Zap, text: 'Immediate — clear prompt triggers direct HTML output (104 traces)' },
            { Icon: MessageSquare, text: 'Each trace is a complete user↔assistant exchange used as a training record' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <item.Icon size={14} style={{ marginTop: 3, flexShrink: 0, color: 'var(--text-muted)' }} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 validation-stats-grid" style={{ gap: 12, marginBottom: 32 }}>
        <StatCard label="TOTAL TRACES" sublabel="In training set" value="254" color="var(--text-primary)" />
        <StatCard label="QUALIFYING" sublabel="Ask before building" value="150" color="var(--score-high)" />
        <StatCard label="IMMEDIATE" sublabel="Direct code output" value="104" color="var(--accent)" />
        <StatCard label="AVG TURNS" sublabel="Per conversation" value="3.4" color="var(--text-primary)" />
      </div>

      {/* Type filters */}
      <div className="flex items-center" style={{ gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {typeFilters.map(f => (
          <button
            key={f.value}
            onClick={() => { setType(f.value); setPage(0) }}
            className="cursor-pointer bg-transparent border-0 transition-colors duration-150"
            style={{
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: type === f.value ? 600 : 400,
              color: type === f.value ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: type === f.value ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {f.label}
            {f.value === 'all' && <span className="text-text-muted font-mono" style={{ fontSize: 11, marginLeft: 6 }}>{total}</span>}
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
  )
}
