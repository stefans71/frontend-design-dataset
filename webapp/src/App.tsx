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
    <div data-theme={theme} className="min-h-screen bg-bg-primary text-text-primary">
      <BrowserRouter>
        <Navbar />
        <main>
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
