import { useEffect, useState } from 'react'

const MESSAGES = [
  'Connecting to backend...',
  'Waking up Render server (this can take ~60s on free tier)...',
  'Still loading — almost there...',
  'Hang tight, server is warming up...',
]

export default function LoadingSpinner({ size = 'md', text, longWait = false }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6'
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    if (!longWait) return
    const id = setInterval(() => setMsgIndex(i => (i + 1) % MESSAGES.length), 10000)
    return () => clearInterval(id)
  }, [longWait])

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 min-h-[50vh]">
      <div className={`${sizeClass} border-2 border-brand-600 border-t-transparent rounded-full animate-spin`} />
      {longWait ? (
        <div className="text-center space-y-1">
          <p className="text-sm text-slate-400 animate-pulse">{MESSAGES[msgIndex]}</p>
          <p className="text-[11px] text-slate-600 tracking-wider uppercase">Free tier · First load only</p>
        </div>
      ) : (
        text && <p className="text-sm text-slate-500">{text}</p>
      )}
    </div>
  )
}
