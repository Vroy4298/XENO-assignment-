export default function StatCard({ label, value, icon, sub, gradient }) {
  return (
    <div className={`stat-card transition-all duration-300 hover:border-brand-300 ${gradient ? 'border-brand-400' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.15em]">{label}</p>
          <p className="text-3xl font-serif font-light text-white mt-3 tracking-wide">{value ?? '—'}</p>
          {sub && <p className="text-[10px] uppercase tracking-wider text-slate-600 mt-2">{sub}</p>}
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${gradient ? 'bg-gradient-brand text-black font-semibold' : 'border border-surface-border text-brand-300'}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
