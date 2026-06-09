import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import SegmentBuilder from './pages/SegmentBuilder'
import Campaigns from './pages/Campaigns'
import Analytics from './pages/Analytics'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface flex">
        <Navbar />
        <main className="flex-1 ml-64 p-8 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/segments" element={<SegmentBuilder />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
