import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = {
  sent:      '#6366f1',
  delivered: '#10b981',
  failed:    '#ef4444',
  opened:    '#3b82f6',
  clicked:   '#f59e0b',
}

const STATUS_BADGE = {
  sent:      'badge-default',
  delivered: 'badge-success',
  failed:    'badge-danger',
  opened:    'badge-info',
  clicked:   'badge-warning',
}

export default function Analytics() {
  const [campaigns, setCampaigns] = useState([])
  const [selected, setSelected]   = useState('')
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    api.get('/api/campaigns').then(r => {
      const sent = r.data.campaigns.filter(c => c.status !== 'draft')
      setCampaigns(sent)
      if (sent.length > 0) setSelected(sent[0]._id)
    }).catch(console.error)
  }, [])

  const fetchAnalytics = (id) => {
    if (!id) return
    setLoading(true)
    api.get(`/api/receipt/analytics/${id}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  // Auto-refresh every 5s while a campaign is in 'sending' status
  useEffect(() => {
    if (selected) fetchAnalytics(selected)

    intervalRef.current = setInterval(() => {
      if (selected) fetchAnalytics(selected)
    }, 5000)

    return () => clearInterval(intervalRef.current)
  }, [selected])

  const stats = data?.stats || {}
  const barData = [
    { name: 'Sent',      value: stats.sent      || 0 },
    { name: 'Delivered', value: stats.delivered  || 0 },
    { name: 'Failed',    value: stats.failed     || 0 },
    { name: 'Opened',    value: stats.opened     || 0 },
    { name: 'Clicked',   value: stats.clicked    || 0 },
  ]
  const pieData = [
    { name: 'Delivered', value: stats.delivered || 0 },
    { name: 'Failed',    value: stats.failed    || 0 },
  ].filter(d => d.value > 0)

  const deliveryRate = stats.sent > 0
    ? ((stats.delivered / stats.sent) * 100).toFixed(1)
    : 0
  const openRate = stats.delivered > 0
    ? ((stats.opened / stats.delivered) * 100).toFixed(1)
    : 0
  const clickRate = stats.opened > 0
    ? ((stats.clicked / stats.opened) * 100).toFixed(1)
    : 0

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-500 mt-1">Live campaign performance — auto-refreshes every 5 seconds</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-slow" />
          <span className="text-xs text-emerald-400">Live</span>
        </div>
      </div>

      {/* Campaign selector */}
      <div className="card">
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Select Campaign
        </label>
        {campaigns.length === 0 ? (
          <p className="text-slate-500 text-sm">No sent campaigns yet. Fire a campaign first!</p>
        ) : (
          <select
            id="analytics-campaign-select"
            className="select max-w-sm"
            value={selected}
            onChange={e => setSelected(e.target.value)}
          >
            {campaigns.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading && !data && <LoadingSpinner text="Loading analytics..." />}

      {data && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
            {barData.map(({ name, value }) => (
              <div key={name} className="stat-card text-center">
                <p className="text-2xl font-bold" style={{ color: COLORS[name.toLowerCase()] }}>
                  {value}
                </p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{name}</p>
              </div>
            ))}
          </div>

          {/* Rate cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card text-center">
              <p className="text-3xl font-bold text-emerald-400">{deliveryRate}%</p>
              <p className="text-xs text-slate-500 mt-1">Delivery Rate</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-3xl font-bold text-blue-400">{openRate}%</p>
              <p className="text-xs text-slate-500 mt-1">Open Rate</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-3xl font-bold text-gold-400">{clickRate}%</p>
              <p className="text-xs text-slate-500 mt-1">Click Rate</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Bar chart */}
            <div className="card xl:col-span-2">
              <h3 className="font-semibold text-white mb-4">Message Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2b55" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16152a', border: '1px solid #2d2b55', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 600 }}
                    itemStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {barData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name.toLowerCase()] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Delivery vs Failed</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.name === 'Delivered' ? COLORS.delivered : COLORS.failed}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#16152a', border: '1px solid #2d2b55', borderRadius: '12px' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Legend
                      iconType="circle"
                      formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <p className="text-slate-600 text-sm">Callbacks pending...</p>
                </div>
              )}
            </div>
          </div>

          {/* Communication Log Table */}
          <div>
            <h3 className="font-semibold text-white mb-3">Communication Log</h3>
            <div className="table-container max-h-96 overflow-y-auto">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>City</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Sent At</th>
                    <th>Delivered At</th>
                  </tr>
                </thead>
                <tbody>
                  {data.logs.map(log => (
                    <tr key={log._id}>
                      <td className="font-medium text-white">{log.customerId?.name || '—'}</td>
                      <td className="text-slate-400">{log.customerId?.city || '—'}</td>
                      <td className="capitalize text-slate-400">{log.channel}</td>
                      <td>
                        <span className={STATUS_BADGE[log.status] || 'badge-default'}>
                          {log.status}
                        </span>
                      </td>
                      <td className="text-slate-500 text-xs">
                        {log.timestamps?.sent
                          ? new Date(log.timestamps.sent).toLocaleTimeString('en-IN')
                          : '—'}
                      </td>
                      <td className="text-slate-500 text-xs">
                        {log.timestamps?.delivered
                          ? new Date(log.timestamps.delivered).toLocaleTimeString('en-IN')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
