import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/',           label: 'Dashboard',  icon: '✦' },
  { to: '/customers',  label: 'Customers',  icon: '✧' },
  { to: '/segments',   label: 'Segment Builder', icon: '✦' },
  { to: '/campaigns',  label: 'Campaigns',  icon: '✧' },
  { to: '/analytics',  label: 'Live Analytics',  icon: '✦' },
]

export default function Navbar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-surface-border flex flex-col z-50">
      {/* Logo */}
      <div className="px-8 py-8 border-b border-surface-border">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-normal tracking-[0.2em] text-white uppercase">
            Drape
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-sans">
            Marketing Suite
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-8 space-y-2 font-sans">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-widest transition-all duration-300 group ${
                isActive
                  ? 'text-brand-300 border-l border-brand-300 bg-surface-muted/20 font-semibold pl-5'
                  : 'text-slate-400 hover:text-white pl-4 hover:bg-surface-muted/10'
              }`
            }
          >
            <span className="text-[10px] text-brand-300/80 group-hover:text-brand-300 transition-colors">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-surface-border font-sans">
        <p className="text-[9px] text-slate-600 uppercase tracking-widest text-center">Drape CRM</p>
        <p className="text-[9px] text-slate-500 uppercase tracking-[0.1em] text-center mt-1">AI-Native Portal</p>
      </div>
    </aside>
  )
}
