import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import CampaignCard from '../components/CampaignCard'
import LoadingSpinner from '../components/LoadingSpinner'

const CHANNELS = [
  { value: 'whatsapp', label: '💬 WhatsApp' },
  { value: 'sms',      label: '📱 SMS' },
  { value: 'email',    label: '✉️ Email' },
]

export default function Campaigns() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns]   = useState([])
  const [segments, setSegments]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [sending, setSending]       = useState(null) // campaignId being sent

  // Form state
  const [form, setForm] = useState({
    name: '', segmentId: '', message: '', channel: 'whatsapp'
  })
  const [drafting, setDrafting]   = useState(false)
  const [creating, setCreating]   = useState(false)
  const [formError, setFormError] = useState('')

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      api.get('/api/campaigns'),
      api.get('/api/segments'),
    ]).then(([cRes, sRes]) => {
      setCampaigns(cRes.data.campaigns)
      setSegments(sRes.data.segments)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const draftMessage = async () => {
    if (!form.segmentId) return setFormError('Select a segment first')
    const seg = segments.find(s => s._id === form.segmentId)
    setDrafting(true)
    setFormError('')
    try {
      const r = await api.post('/api/segments/draft-message', {
        segmentDescription: seg?.naturalLanguageQuery || seg?.name,
        channel: form.channel,
      })
      setForm(f => ({ ...f, message: r.data.message }))
    } catch (e) {
      setFormError(e.message)
    } finally {
      setDrafting(false)
    }
  }

  const createCampaign = async (e) => {
    e.preventDefault()
    if (!form.name || !form.segmentId || !form.message) return setFormError('All fields are required')
    setCreating(true)
    setFormError('')
    try {
      await api.post('/api/campaigns', form)
      setShowForm(false)
      setForm({ name: '', segmentId: '', message: '', channel: 'whatsapp' })
      fetchAll()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const sendCampaign = async (campaignId) => {
    setSending(campaignId)
    try {
      const r = await api.post(`/api/campaigns/${campaignId}/send`)
      alert(`🚀 Campaign fired! Sending to ${r.data.recipientCount} recipients. Stats will update in real-time.`)
      fetchAll()
      // Navigate to analytics after a moment
      setTimeout(() => navigate('/analytics'), 1500)
    } catch (e) {
      alert(`❌ Error: ${e.message}`)
    } finally {
      setSending(null)
    }
  }

  if (loading) return <LoadingSpinner text="Loading campaigns..." />

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaigns</h1>
          <p className="text-slate-500 mt-1">Create and manage your marketing campaigns</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary" id="new-campaign-btn">
          + New Campaign
        </button>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={() => setShowForm(false)}>
          <div className="card w-full max-w-xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Campaign</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost text-xl">×</button>
            </div>

            <form onSubmit={createCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Campaign Name
                </label>
                <input
                  id="campaign-name"
                  className="input"
                  placeholder="e.g. Mumbai VIP Summer Collection"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Segment
                </label>
                <select
                  id="campaign-segment"
                  className="select"
                  value={form.segmentId}
                  onChange={e => setForm(f => ({ ...f, segmentId: e.target.value }))}
                >
                  <option value="">Select a segment...</option>
                  {segments.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.customerCount} customers)
                    </option>
                  ))}
                </select>
                {segments.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1">
                    ⚠️ No segments yet — <a href="/segments" className="underline">create one first</a>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Channel
                </label>
                <select
                  id="campaign-channel"
                  className="select"
                  value={form.channel}
                  onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
                >
                  {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Message
                  </label>
                  <button
                    type="button"
                    id="ai-draft-btn"
                    onClick={draftMessage}
                    disabled={drafting || !form.segmentId}
                    className="btn-secondary text-xs py-1"
                  >
                    {drafting ? '⏳ Drafting...' : '🤖 AI Draft'}
                  </button>
                </div>
                <textarea
                  id="campaign-message"
                  className="input resize-none h-28"
                  placeholder="Your personalized message to the segment..."
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                />
                <p className="text-xs text-slate-600 mt-1">{form.message.length} characters</p>
              </div>

              {formError && (
                <div className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-xl p-3">
                  ❌ {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  id="create-campaign-submit"
                  disabled={creating}
                  className="btn-primary flex-1"
                >
                  {creating ? '⏳ Creating...' : '💾 Create Campaign'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📣</p>
          <p className="text-slate-400 font-medium">No campaigns yet</p>
          <p className="text-slate-600 text-sm mt-1">Create your first campaign above</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map(campaign => (
            <div key={campaign._id} className="relative">
              <CampaignCard campaign={campaign} onClick={() => {}} />
              {campaign.status === 'draft' && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    id={`send-campaign-${campaign._id}`}
                    onClick={() => sendCampaign(campaign._id)}
                    disabled={sending === campaign._id}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    {sending === campaign._id ? '🚀 Sending...' : '🚀 Send Campaign'}
                  </button>
                </div>
              )}
              {campaign.status !== 'draft' && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => navigate('/analytics')}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    📊 Analytics →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
