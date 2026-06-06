export default function PiHarness() {
  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
        PI HARNESS V4.2
      </div>
      <h1 className="text-text-primary" style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 8 }}>Pi Harness Testing</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 580, lineHeight: 1.6 }}>
        Head-to-head comparison of the same prompts run through the Pi Harness pipeline.
        Compare Qwen3.6-27B original output, GPT-5.4 improved output, and Pi Harness results side by side.
      </p>
    </div>
  )
}
