export default function LoadingSpinner({ size = 'md', text }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6'
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizeClass} border-2 border-brand-600 border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  )
}
