import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import Navbar from '@/components/layout/Navbar'
import Home from '@/pages/Home'
import Gallery from '@/pages/Gallery'
import ComponentPage from '@/pages/ComponentPage'
import Validation from '@/pages/Validation'
import Conversations from '@/pages/Conversations'
import '@/styles/globals.css'

export default function App() {
  const { theme } = useTheme()

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <BrowserRouter>
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/components" element={<Gallery />} />
            <Route path="/components/:id" element={<ComponentPage />} />
            <Route path="/validation" element={<Validation />} />
            <Route path="/conversations" element={<Conversations />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  )
}
