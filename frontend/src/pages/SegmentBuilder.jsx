import { useState, useEffect } from 'react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

const EXAMPLE_QUERIES = [
  'Customers from Mumbai who spent more than ₹10,000',
  'High-value customers who haven\'t ordered in 90 days',
  'New customers from Delhi or Bengaluru',
  'Repeat buyers with total spend over ₹15,000',
  'Lapsed customers from Hyderabad',
  'Sale shoppers with spend between ₹5,000 and ₹12,000',
]

export default function SegmentBuilder() {
  const [query, setQuery]           = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState('')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [segments, setSegments]     = useState([])
  const [loadingSegs, setLoadingSegs] = useState(true)

  useEffect(() => {
    api.get('/api/segments')
      .then(r => setSegments(r.data.segments))
      .catch(console.error)
      .finally(() => setLoadingSegs(false))
  }, [saved])

  const generate = async () => {
    if (!query.trim()) return
    setGenerating(true)
    setError('')
    setResult(null)
    setSaved(false)
    try {
      const r = await api.post('/api/segments/generate', { query })
      setResult(r.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const saveSegment = async () => {
    if (!result) return
    setSaving(true)
    try {
      await api.post('/api/segments', {
        name: result.suggestedName || query.slice(0, 50),
        description: query,
        naturalLanguageQuery: query,
        mongoQuery: result.mongoQuery,
        customerIds: result.customers.map(c => c._id),
      })
      setSaved(true)
      setResult(null)
      setQuery('')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-enter space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">AI Segment Builder</h1>
        <p className="text-slate-500 mt-1">Describe your audience in plain English — AI creates the segment</p>
      </div>

      {/* AI Input Box */}
      <div className="card-gradient border-brand-800 glow-brand space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🤖</span>
          <span className="font-semibold text-white">Natural Language Segmentation</span>
          <span className="badge-info ml-auto">GPT-4 Powered</span>
        </div>

        <div className="relative">
          <textarea
            id="segment-query-input"
            className="input resize-none h-24 pr-4"
            placeholder="e.g. Customers from Mumbai who spent more than ₹10,000 in the last 90 days"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), generate())}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            id="generate-segment-btn"
            onClick={generate}
            disabled={!query.trim() || generating}
            className="btn-primary"
          >
            {generating ? '⏳ Generating...' : '✨ Generate Segment'}
          </button>
          <button onClick={() => setQuery('')} className="btn-ghost">Clear</button>
        </div>

        {/* Example chips */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-border">
          <span className="text-xs text-slate-600 self-center">Try:</span>
          {EXAMPLE_QUERIES.map(eq => (
            <button
              key={eq}
              onClick={() => setQuery(eq)}
              className="text-xs px-3 py-1.5 rounded-full bg-surface-muted text-slate-400 hover:text-brand-300 hover:bg-brand-950 border border-surface-border transition-all duration-200"
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {generating && <LoadingSpinner text="AI is building your segment..." />}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-400 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Saved success */}
      {saved && (
        <div className="bg-emerald-900/30 border border-emerald-800 rounded-xl p-4 text-emerald-400 text-sm animate-fade-in">
          ✅ Segment saved successfully! You can now use it to create a campaign.
        </div>
      )}

      {/* Result */}
      {result && !generating && (
        <div className="space-y-4 animate-slide-up">
          <div className="card-gradient border-emerald-800">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-bold text-white text-lg">{result.suggestedName}</h2>
                <p className="text-slate-500 text-sm mt-0.5">"{query}"</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-emerald-400">{result.count}</span>
                <p className="text-xs text-slate-500">customers matched</p>
              </div>
            </div>

            {/* MongoDB query display */}
            <div className="bg-surface rounded-xl p-3 mb-4">
              <p className="text-xs text-slate-600 mb-1 font-mono uppercase tracking-wider">Generated MongoDB Filter</p>
              <pre className="text-xs text-brand-300 font-mono overflow-x-auto">
                {JSON.stringify(result.mongoQuery, null, 2)}
              </pre>
            </div>

            {/* Matched customers preview */}
            {result.customers.length > 0 ? (
              <div className="table-container max-h-64 overflow-y-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>City</th>
                      <th>Spend</th>
                      <th>Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.customers.map(c => (
                      <tr key={c._id}>
                        <td className="font-medium text-white">{c.name}</td>
                        <td className="text-slate-400">{c.city}</td>
                        <td className="text-gold-400 font-semibold">₹{c.totalSpend.toLocaleString('en-IN')}</td>
                        <td>
                          <div className="flex gap-1">
                            {c.tags.slice(0, 2).map(t => (
                              <span key={t} className="badge-default">{t}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-4">No customers matched this filter</p>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-surface-border">
              <button
                id="save-segment-btn"
                onClick={saveSegment}
                disabled={saving || result.count === 0}
                className="btn-primary"
              >
                {saving ? '⏳ Saving...' : '💾 Save Segment'}
              </button>
              <button onClick={() => { setResult(null); setQuery('') }} className="btn-ghost">
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Past Segments */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Saved Segments</h2>
        {loadingSegs ? <LoadingSpinner size="sm" /> : segments.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-slate-500">No segments saved yet. Generate your first one above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {segments.map(seg => (
              <div key={seg._id} className="card-gradient hover:border-brand-700 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{seg.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 italic">"{seg.naturalLanguageQuery}"</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-brand-400">{seg.customerCount}</span>
                    <p className="text-xs text-slate-600">customers</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-3">
                  Created {new Date(seg.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
