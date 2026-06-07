import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import Navbar from '@/components/layout/Navbar'
import SectionNav from '@/components/layout/SectionNav'
import Home from '@/pages/Home'
import FineTuned from '@/pages/FineTuned'
import Gallery from '@/pages/Gallery'
import ComponentPage from '@/pages/ComponentPage'
import Validation from '@/pages/Validation'
import Conversations from '@/pages/Conversations'
import PiHarnessComponentPage from '@/pages/PiHarnessComponentPage'
import HarnessResults from '@/pages/HarnessResults'
import ThePi from '@/pages/ThePi'
import HtmlCompareComponentPage from '@/pages/HtmlCompareComponentPage'
import '@/styles/globals.css'

export default function App() {
  const { theme } = useTheme()

  return (
    <div data-theme={theme} className="min-h-screen bg-bg-primary text-text-primary">
      <BrowserRouter>
        <Navbar />
        <SectionNav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fine-tuned" element={<FineTuned />} />
            <Route path="/components" element={<Gallery />} />
            <Route path="/components/:id" element={<ComponentPage />} />
            <Route path="/validation" element={<Validation />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/html-compare" element={<Gallery basePath="/html-compare" />} />
            <Route path="/html-compare/:id" element={<HtmlCompareComponentPage />} />
            <Route path="/pi-harness/components" element={<Gallery basePath="/pi-harness/components" />} />
            <Route path="/pi-harness/components/:id" element={<PiHarnessComponentPage />} />
            <Route path="/pi-harness/results" element={<HarnessResults />} />
            <Route path="/pi-harness/the-pi" element={<ThePi />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  )
}
