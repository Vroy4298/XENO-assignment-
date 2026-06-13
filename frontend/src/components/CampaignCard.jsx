const STATUS_STYLES = {
  draft:   'badge-default',
  sending: 'badge-warning',
  sent:    'badge-success',
}

const CHANNEL_LABELS = {
  whatsapp: 'WhatsApp',
  sms:      'SMS',
  email:    'Email',
}

export default function CampaignCard({ campaign, onClick }) {
  const { name, channel, status, stats, segmentId, createdAt } = campaign

  return (
    <div
      onClick={onClick}
      className="card-gradient border-surface-border hover:border-brand-300 cursor-pointer transition-all duration-300 hover:glow-brand animate-fade-in flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg font-normal text-white truncate leading-tight tracking-wide">{name}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
              {segmentId?.name || 'Unknown segment'} · {new Date(createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
              {CHANNEL_LABELS[channel] || '📡'}
            </span>
            <span className={STATUS_STYLES[status] || 'badge-default'}>{status}</span>
          </div>
        </div>
      </div>

      {status !== 'draft' && (
        <div className="grid grid-cols-5 gap-2 mt-6 pt-4 border-t border-surface-border/40">
          {[
            { label: 'Sent',       value: stats.sent,      color: 'text-slate-200' },
            { label: 'Delivered',  value: stats.delivered, color: 'text-emerald-400' },
            { label: 'Failed',     value: stats.failed,    color: 'text-red-400' },
            { label: 'Opened',     value: stats.opened,    color: 'text-brand-300' },
            { label: 'Clicked',    value: stats.clicked,   color: 'text-gold-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={`text-base font-sans font-light ${color}`}>{value}</p>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
