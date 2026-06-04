import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="page-container" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ maxWidth: 640 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
          FRONTEND DESIGN EXPERT
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Open-source design models for local LLMs
        </h1>
        <p className="text-text-secondary" style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16, maxWidth: 520 }}>
          Fine-tuned vision-language models that ask the right questions, critique designs with specific measurements, and produce clean HTML output.
        </p>

        <div className="flex items-center gap-4" style={{ marginTop: 32 }}>
          <Link
            to="/fine-tuned"
            className="inline-flex items-center no-underline bg-accent text-white hover:bg-accent-hover transition-colors duration-150"
            style={{ padding: '10px 20px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600 }}
          >
            Explore Fine-Tuned Models
          </Link>
          <a
            href="https://github.com/stefans71/frontend-design-dataset"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center no-underline text-text-secondary hover:text-text-primary transition-colors duration-150"
            style={{ padding: '10px 20px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 500, border: '1px solid var(--border)' }}
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
