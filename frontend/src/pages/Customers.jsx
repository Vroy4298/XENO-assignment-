import { useEffect, useState } from 'react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

const CITY_COLORS = {
  Mumbai:    'badge-info',
  Delhi:     'badge-purple',
  Bengaluru: 'badge-success',
  Hyderabad: 'badge-warning',
  Chennai:   'badge-danger',
  Pune:      'badge-default',
}

const TAG_COLORS = {
  'high-value':   'badge-warning',
  'repeat-buyer': 'badge-success',
  'new-customer': 'badge-info',
  'lapsed':       'badge-danger',
  'sale-shopper': 'badge-purple',
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [city, setCity]           = useState('')
  const [selected, setSelected]   = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const [loadingDetail, setLoadingDetail]   = useState(false)

  const fetchCustomers = () => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (city)   params.city   = city
    api.get('/api/customers', { params })
      .then(r => setCustomers(r.data.customers))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCustomers() }, [city])

  const openDetail = async (c) => {
    setSelected(c)
    setLoadingDetail(true)
    try {
      const r = await api.get(`/api/customers/${c._id}`)
      setCustomerOrders(r.data.orders)
    } catch { setCustomerOrders([]) }
    finally { setLoadingDetail(false) }
  }

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Customers</h1>
        <p className="text-slate-500 mt-1">50 Drape shoppers — manage and explore your customer base</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          className="input max-w-xs"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchCustomers()}
          id="customer-search"
        />
        <select className="select max-w-[180px]" value={city} onChange={e => setCity(e.target.value)} id="city-filter">
          <option value="">All Cities</option>
          {['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button onClick={fetchCustomers} className="btn-primary">Search</button>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner text="Loading customers..." /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>City</th>
                <th>Total Spend</th>
                <th>Last Order</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr
                  key={c._id}
                  onClick={() => openDetail(c)}
                  className="cursor-pointer"
                >
                  <td className="font-medium text-white">{c.name}</td>
                  <td className="text-slate-400">{c.email}</td>
                  <td>
                    <span className={CITY_COLORS[c.city] || 'badge-default'}>{c.city}</span>
                  </td>
                  <td className="font-semibold text-gold-400">₹{c.totalSpend.toLocaleString('en-IN')}</td>
                  <td className="text-slate-400 text-xs">
                    {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {c.tags.slice(0, 2).map(t => (
                        <span key={t} className={TAG_COLORS[t] || 'badge-default'}>{t}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={() => setSelected(null)}>
          <div className="card w-full max-w-xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                <p className="text-slate-500 text-sm">{selected.email} · {selected.phone}</p>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost text-xl">×</button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="stat-card text-center">
                <p className="text-2xl font-bold text-gold-400">₹{selected.totalSpend.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-500 mt-1">Total Spend</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-2xl font-bold text-white">{selected.city}</p>
                <p className="text-xs text-slate-500 mt-1">City</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-2xl font-bold text-brand-400">{customerOrders.length}</p>
                <p className="text-xs text-slate-500 mt-1">Orders</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-5">
              {selected.tags.map(t => (
                <span key={t} className={TAG_COLORS[t] || 'badge-default'}>{t}</span>
              ))}
            </div>

            <h3 className="font-semibold text-white mb-3">Order History</h3>
            {loadingDetail ? <LoadingSpinner size="sm" /> : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {customerOrders.map(o => (
                  <div key={o._id} className="bg-surface-muted rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white">
                        {new Date(o.date).toLocaleDateString('en-IN')}
                      </span>
                      <span className="font-bold text-gold-400">₹{o.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {o.items.map((item, i) => (
                        <span key={i} className="text-xs text-slate-400 bg-surface-card px-2 py-0.5 rounded">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
