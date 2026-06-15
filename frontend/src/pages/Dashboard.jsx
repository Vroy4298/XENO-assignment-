import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import StatCard from '../components/StatCard'
import CampaignCard from '../components/CampaignCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/api/customers'),
      api.get('/api/campaigns'),
      api.get('/api/segments'),
    ]).then(([cRes, campRes, segRes]) => {
      const campaigns = campRes.data.campaigns
      const totalSent = campaigns.reduce((s, c) => s + (c.stats?.sent || 0), 0)
      const totalDelivered = campaigns.reduce((s, c) => s + (c.stats?.delivered || 0), 0)
      setData({
        customers: cRes.data.total,
        campaigns,
        segments: segRes.data.segments.length,
        totalSent,
        deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0,
      })
    }).catch((err) => {
      console.error(err)
      setError('Backend is waking up — Render free tier spins down after inactivity. Please wait a moment and try again.')
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Loading dashboard... (may take ~15s on first load)" />

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <p className="text-4xl">⚡</p>
      <h2 className="font-serif text-2xl text-white tracking-wide">Backend Waking Up</h2>
      <p className="text-slate-400 text-sm max-w-sm leading-relaxed">{error}</p>
      <button className="btn-primary" onClick={() => { setError(null); setLoading(true); Promise.all([api.get('/api/customers'), api.get('/api/campaigns'), api.get('/api/segments')]).then(([cRes, campRes, segRes]) => { const campaigns = campRes.data.campaigns; const totalSent = campaigns.reduce((s, c) => s + (c.stats?.sent || 0), 0); const totalDelivered = campaigns.reduce((s, c) => s + (c.stats?.delivered || 0), 0); setData({ customers: cRes.data.total, campaigns, segments: segRes.data.segments.length, totalSent, deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0 }); }).catch((err) => { setError('Still loading. Please retry in a few seconds.'); }).finally(() => setLoading(false)); }}>Retry</button>
    </div>
  )

  return (
    <div className="page-enter space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-surface-border/40 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-light text-white tracking-wide">Dashboard</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-2">Drape CRM & Marketing Hub</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/segments')} className="btn-secondary">
            Create Segment
          </button>
          <button onClick={() => navigate('/campaigns')} className="btn-primary">
            Create Campaign
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard label="Total Shoppers" value={data?.customers} icon="✧" gradient />
        <StatCard label="Active Segments"  value={data?.segments}  icon="✦" />
        <StatCard label="Dispatched Logs"   value={data?.totalSent} icon="✧" />
        <StatCard label="Avg Delivery"   value={`${data?.deliveryRate}%`} icon="✦" gradient />
      </div>

      {/* Recent Campaigns */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-surface-border/20 pb-3">
          <h2 className="font-serif text-2xl font-light text-white tracking-wide">Recent Campaigns</h2>
          <button onClick={() => navigate('/campaigns')} className="btn-ghost text-[10px] uppercase tracking-widest hover:text-brand-300">
            View all →
          </button>
        </div>

        {data?.campaigns?.length === 0 ? (
          <div className="card text-center py-20 border border-dashed border-surface-border">
            <p className="text-3xl text-brand-300 mb-4 font-serif">✧</p>
            <p className="text-white font-serif text-lg tracking-wide">No campaigns launched</p>
            <p className="text-slate-500 text-xs mt-2 font-sans tracking-wide">Start a conversation with your fashion segment</p>
            <button onClick={() => navigate('/campaigns')} className="btn-primary mt-6">
              Create First Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {data.campaigns.slice(0, 4).map(c => (
              <CampaignCard
                key={c._id}
                campaign={c}
                onClick={() => navigate('/analytics')}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Hint */}
      <div className="card-gradient border-brand-400/30 glow-brand">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-full border border-brand-300/40 flex items-center justify-center text-lg text-brand-300 flex-shrink-0">
            ✦
          </div>
          <div className="space-y-1">
            <p className="font-serif text-lg text-white tracking-wide">AI-Native Segment Generator</p>
            <p className="text-xs text-slate-500 tracking-normal font-sans leading-relaxed">
              Describe your target clientele in plain English—such as "high value spenders from Chennai with repeat purchases"—and watch the system generate targeted customer lists instantly.
            </p>
          </div>
          <button onClick={() => navigate('/segments')} className="btn-secondary ml-auto flex-shrink-0">
            Build Segment
          </button>
        </div>
      </div>
    </div>
  )
}
