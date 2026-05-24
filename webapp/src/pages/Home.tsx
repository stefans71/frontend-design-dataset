import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getComponents } from '@/lib/api'
import type { ComponentWithScore } from '@/lib/types'

function scoreColor(score: number) {
  if (score >= 7) return 'bg-score-high/80 text-white'
  if (score >= 5) return 'bg-score-mid/80 text-white'
  return 'bg-score-low/80 text-white'
}

export default function Home() {
  const [featured, setFeatured] = useState<ComponentWithScore[]>([])

  useEffect(() => {
    getComponents({ sort: 'score_desc', limit: 6, hasPng: 1 }).then(r => setFeatured(r.items))
  }, [])

  return (
    <div>
      {/* SECTION 1 — HERO */}
      <section className="page-container" style={{ paddingTop: 64, paddingBottom: 56 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          {/* Left column */}
          <div>
            <span className="section-label block" style={{ marginBottom: 16 }}>FINE-TUNED MODEL</span>
            <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }}>
              <span className="text-text-primary">Qwen3-VL-8B</span><br />
              <span className="text-text-secondary">Fine-Tuned on</span><br />
              <span className="text-text-secondary">GPT-5.4 Critiques</span>
            </h1>

            {/* Training data table */}
            <div style={{
              marginTop: 24,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-secondary)',
              padding: '16px 20px',
            }}>
              {[
                ['500', 'UI components', 'Qwen3.6-27B'],
                ['500', 'Design critiques', 'GPT-5.4'],
                ['500', 'Improved rewrites', 'GPT-5.4'],
                ['254', 'Qualifying conversations', ''],
              ].map(([num, label, source], i) => (
                <div key={i} className="flex items-center justify-between" style={{ padding: '5px 0' }}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-accent" style={{ fontSize: 14, fontWeight: 700, minWidth: 36 }}>{num}</span>
                    <span className="text-text-primary" style={{ fontSize: 14 }}>{label}</span>
                  </div>
                  {source && <span className="font-mono text-text-muted" style={{ fontSize: 12 }}>{source}</span>}
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0', padding: 0 }} />
              <div className="flex items-center gap-3" style={{ padding: '5px 0' }}>
                <span className="font-mono text-accent" style={{ fontSize: 14, fontWeight: 700, minWidth: 36 }}>3,090</span>
                <span className="text-text-primary" style={{ fontSize: 14, fontWeight: 600 }}>Total training records</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3" style={{ marginTop: 24 }}>
              <a
                href="https://huggingface.co/stefans71/frontend-design-expert-8b"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center no-underline bg-accent text-white hover:bg-accent-hover transition-colors duration-150"
                style={{ padding: '10px 20px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600 }}
              >
                Download 8B — 12GB GPU ↓
              </a>
              <a
                href="https://huggingface.co/stefans71/frontend-design-lite-4b"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center no-underline text-text-secondary hover:text-text-primary transition-colors duration-150"
                style={{ padding: '10px 20px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 500, border: '1px solid var(--border)' }}
              >
                Download 4B — 8GB GPU ↓
              </a>
              <Link
                to="/components"
                className="inline-flex items-center no-underline text-text-secondary hover:text-text-primary transition-colors duration-150"
                style={{ padding: '10px 16px', fontSize: 14, fontWeight: 500 }}
              >
                Browse Training Data →
              </Link>
            </div>
          </div>

          {/* Right column — Terminal demo */}
          <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            {/* Base model panel */}
            <div>
              <div className="flex items-center gap-2" style={{ padding: '10px 14px', background: '#0a0a0a', borderBottom: '1px solid var(--border)' }}>
                <div className="flex gap-1.5">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ef4444', marginLeft: 6 }}>
                  BASE QWEN3-VL-8B
                </span>
              </div>
              <div className="font-mono" style={{ padding: '14px 16px', background: '#0a0a0a', fontSize: 12, lineHeight: 1.7 }}>
                <div className="text-text-muted" style={{ marginBottom: 8 }}>
                  <span style={{ color: '#22c55e' }}>user:</span>{' '}
                  <span className="text-text-secondary">"Build me a website for my dog daycare called Stay Fit"</span>
                </div>
                <div>
                  <span style={{ color: '#ef4444' }}>assistant:</span>{' '}
                  <span className="text-text-muted">{'<!DOCTYPE html>'}</span>
                </div>
                <div className="text-text-muted">{'<html><head><title>Stay Fit</title>'}</div>
                <div className="text-text-muted">{'<style>body { font-family: Arial; }'}</div>
                <div className="text-text-muted">{'/* generic layout, no brand colors,'}</div>
                <div className="text-text-muted">{'   no booking system, no images */'}</div>
                <div className="text-text-muted">{'</style></head>...'}</div>
              </div>
            </div>
            {/* Fine-tuned model panel */}
            <div>
              <div className="flex items-center gap-2" style={{ padding: '10px 14px', background: '#0a0a0a', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#22c55e', marginLeft: 24 }}>
                  FRONTEND DESIGN EXPERT (FINE-TUNED)
                </span>
              </div>
              <div className="font-mono" style={{ padding: '14px 16px', background: '#0a0a0a', fontSize: 12, lineHeight: 1.7 }}>
                <div className="text-text-muted" style={{ marginBottom: 8 }}>
                  <span style={{ color: '#22c55e' }}>user:</span>{' '}
                  <span className="text-text-secondary">"Build me a website for my dog daycare called Stay Fit"</span>
                </div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: '#22c55e' }}>assistant:</span>{' '}
                  <span className="text-text-secondary">I'd love to help! A few questions first:</span>
                </div>
                <div className="text-text-secondary">
                  <span className="text-accent" style={{ fontWeight: 600 }}>1.</span> What services do you offer — boarding, grooming, training?
                </div>
                <div className="text-text-secondary">
                  <span className="text-accent" style={{ fontWeight: 600 }}>2.</span> Do you have brand colors or a logo to match?
                </div>
                <div className="text-text-secondary">
                  <span className="text-accent" style={{ fontWeight: 600 }}>3.</span> Should visitors be able to book appointments online?
                </div>
                <div className="text-text-secondary">
                  <span className="text-accent" style={{ fontWeight: 600 }}>4.</span> What tone — playful and fun, or professional and clean?
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — STATS ROW */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="page-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '24px 0' }}>
          {[
            { label: 'QUALIFYING QUESTIONS', value: '1/10', arrow: '→', value2: '10/10', sub: 'base → fine-tuned' },
            { label: 'AVG SCORE DELTA', value: '+1.0', sub: '/ 10 points' },
            { label: 'TRAINING RECORDS', value: '3,090', sub: 'component + conversation' },
            { label: 'LICENSE', value: 'Apache 2.0', sub: 'weights + dataset' },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center"
              style={{
                padding: '0 24px',
                borderRight: i < 3 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 500 }}>
                {stat.label}
              </span>
              <div style={{ marginTop: 8 }}>
                {stat.arrow ? (
                  <span className="font-mono" style={{ fontSize: 28, fontWeight: 700 }}>
                    <span className="text-text-muted">{stat.value}</span>
                    <span className="text-text-muted" style={{ fontSize: 16, margin: '0 6px' }}>{stat.arrow}</span>
                    <span className="text-accent">{stat.value2}</span>
                  </span>
                ) : (
                  <span className="font-mono text-accent" style={{ fontSize: 28, fontWeight: 700 }}>{stat.value}</span>
                )}
              </div>
              <span className="text-text-muted" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>{stat.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — HOW THE TRAINING DATA WAS BUILT */}
      <section className="page-container" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <span className="section-label block" style={{ marginBottom: 8 }}>HOW IT WORKS</span>
        <h2 className="text-text-primary" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
          Teacher-Student Distillation
        </h2>
        <p className="text-text-secondary" style={{ fontSize: 14, lineHeight: 1.6, marginTop: 8, maxWidth: 560 }}>
          GPT-5.4 taught a smaller model expert design reasoning through structured critique and improvement examples.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16, marginTop: 32 }}>
          {[
            {
              step: '01',
              title: 'Generate',
              body: 'Qwen3.6-27B generates 500 self-contained HTML/CSS components from natural language prompts across 6 categories — landing pages, dashboards, forms, portfolios, e-commerce, and marketing.',
              footer: '500 components · 5 temperature variants',
            },
            {
              step: '02',
              title: 'Critique & Improve',
              body: 'GPT-5.4 analyzes each component screenshot with px-level measurements, hex color contrast ratios, and WCAG accessibility checks — then rewrites the HTML with those specific improvements applied.',
              footer: '1,000 records · critique + improved HTML',
            },
            {
              step: '03',
              title: 'Fine-Tune',
              body: 'QLoRA fine-tuning on 3,090 records teaches Qwen3-VL-8B to ask qualifying questions before building, produce clean HTML output, and critique designs with specific measurements — behaviors impossible via prompting alone.',
              footer: '3 epochs · 2h 39m · RTX 5090',
            },
          ].map(card => (
            <div
              key={card.step}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 24,
              }}
            >
              <span className="font-mono text-accent" style={{ fontSize: 11, fontWeight: 700 }}>{card.step}</span>
              <h3 className="text-text-primary" style={{ fontSize: 16, fontWeight: 600, marginTop: 8, marginBottom: 12 }}>
                {card.title}
              </h3>
              <p className="text-text-secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
                {card.body}
              </p>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, marginTop: 12 }}>
                <span className="font-mono text-text-muted" style={{ fontSize: 12 }}>{card.footer}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — BEFORE / AFTER */}
      <section className="border-t border-border">
        <div className="page-container" style={{ paddingTop: 56, paddingBottom: 56 }}>
          <span className="section-label block" style={{ marginBottom: 8 }}>FINE-TUNED MODEL OUTPUT</span>
          <h2 className="text-text-primary" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
            Same prompt. Different result.
          </h2>
          <p className="text-text-secondary" style={{ fontSize: 14, lineHeight: 1.6, marginTop: 8, maxWidth: 560 }}>
            Base Qwen3-VL-8B produces generic HTML with no brand identity.
            The fine-tuned model builds polished, branded components that match the prompt.
          </p>

          <img
            src="/hero-comparison.png"
            alt="Base model vs fine-tuned model output comparison"
            className="w-full"
            style={{ marginTop: 32, borderRadius: 12, border: '1px solid var(--border)' }}
          />

          <div className="flex items-center gap-8" style={{ marginTop: 24 }}>
            {[
              'Branded identity — correct name, colors, and tone',
              'Functional UI — real form inputs, proper layout hierarchy',
              'Design polish — shadows, spacing, contrast ratios',
            ].map((point, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-score-high" style={{ fontSize: 16, fontWeight: 700 }}>✓</span>
                <span className="text-text-secondary" style={{ fontSize: 14 }}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — BROWSE THE TRAINING DATA */}
      {featured.length > 0 && (
        <section className="border-t border-border">
          <div className="page-container" style={{ paddingTop: 56, paddingBottom: 56 }}>
            <span className="section-label block" style={{ marginBottom: 8 }}>TRAINING DATASET</span>
            <h2 className="text-text-primary" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
              500 GPT-5.4 Improved Components
            </h2>
            <p className="text-text-secondary" style={{ fontSize: 14, lineHeight: 1.6, marginTop: 8, maxWidth: 560 }}>
              Browse the training data — original components, critiques with specific measurements,
              and improved rewrites. This is the dataset, not fine-tuned model output.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16, marginTop: 32 }}>
              {featured.map(c => {
                const score = c.score?.total ?? c.total
                return (
                  <Link
                    key={c.id}
                    to={`/components/${c.id}`}
                    className="block overflow-hidden no-underline bg-bg-card transition-all duration-150 hover:-translate-y-0.5"
                    style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                  >
                    <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                      <img
                        src={`/screenshots/${c.id}-desktop.webp`}
                        alt={c.prompt}
                        loading="lazy"
                        className="w-full h-full object-cover object-top"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      {score !== undefined && (
                        <span className={`absolute font-mono ${scoreColor(score)}`} style={{ top: 8, right: 8, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, backdropFilter: 'blur(4px)' }}>
                          {score}/9
                        </span>
                      )}
                      <span className="absolute text-white/80" style={{ top: 8, left: 8, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                        {c.category}
                      </span>
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <p className="text-text-primary" style={{ fontSize: 13, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.prompt}
                      </p>
                    </div>
                    <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-subtle)', fontSize: 11, color: '#22c55e' }}>
                      Qwen3.6-27B · {c.category} · {c.theme} · T={c.temperature}
                    </div>
                  </Link>
                )
              })}
            </div>

            <div style={{ marginTop: 24 }}>
              <Link
                to="/components"
                className="inline-flex items-center no-underline text-text-secondary hover:text-text-primary transition-colors duration-150"
                style={{ fontSize: 14, fontWeight: 500 }}
              >
                Browse all 500 training components →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6 — DOWNLOAD THE MODEL */}
      <section className="border-t border-border">
        <div className="page-container" style={{ paddingTop: 56, paddingBottom: 64 }}>
          <span className="section-label block" style={{ marginBottom: 8 }}>OPEN SOURCE</span>
          <h2 className="text-text-primary" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
            Run locally on consumer hardware
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16, marginTop: 32 }}>
            {/* 8B Expert card */}
            <div style={{
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius)',
              padding: 28,
            }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                <div>
                  <span className="text-text-primary" style={{ fontSize: 18, fontWeight: 700 }}>8B Expert</span>
                  <span className="text-text-muted block" style={{ fontSize: 13, marginTop: 2 }}>Qwen3-VL-8B Fine-Tuned</span>
                </div>
                <span className="font-mono text-accent" style={{ fontSize: 13, fontWeight: 600 }}>RECOMMENDED</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  ['Size', 'Q4_K_M 4.7GB'],
                  ['VRAM', '12GB GPU'],
                  ['Hardware', 'RTX 3060 / 4070 / M2'],
                  ['Qualifying', '10/10'],
                  ['Delta', '+1.0 / 10'],
                  ['Loss', '0.246'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-text-muted block" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</span>
                    <span className="font-mono text-text-primary" style={{ fontSize: 13 }}>{value}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://huggingface.co/stefans71/frontend-design-expert-8b"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center no-underline bg-accent text-white hover:bg-accent-hover transition-colors duration-150 w-full"
                style={{ padding: '10px 20px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600 }}
              >
                Download 8B Expert ↓
              </a>
            </div>

            {/* 4B Lite card */}
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: 28,
            }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                <div>
                  <span className="text-text-primary" style={{ fontSize: 18, fontWeight: 700 }}>4B Lite</span>
                  <span className="text-text-muted block" style={{ fontSize: 13, marginTop: 2 }}>Qwen3-VL-4B Fine-Tuned</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  ['Size', 'Q4_K_M 2.4GB'],
                  ['VRAM', '8GB GPU'],
                  ['Hardware', 'RTX 3060 8GB / M1'],
                  ['Qualifying', '9/10'],
                  ['Delta', 'similar'],
                  ['Loss', '0.325'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-text-muted block" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</span>
                    <span className="font-mono text-text-primary" style={{ fontSize: 13 }}>{value}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://huggingface.co/stefans71/frontend-design-lite-4b"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center no-underline text-text-secondary hover:text-text-primary transition-colors duration-150 w-full"
                style={{ padding: '10px 20px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 500, border: '1px solid var(--border)' }}
              >
                Download 4B Lite ↓
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
