import { useState } from 'react'

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkHealth = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/health`
      )
      const data = await res.json()
      setHealth(data)
    } catch {
      setHealth({ status: 'error', message: 'Backend unreachable' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 flex flex-col items-center justify-center p-6 font-sans">
      {/* Hero Card */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-10 max-w-2xl w-full text-center">
        {/* Logo Mark */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-4xl">🌾</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          FarmIntel
        </h1>
        <p className="text-green-300 text-lg mb-8">
          AI-powered subsidy management platform
        </p>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-white font-semibold text-sm">Frontend</div>
            <div className="text-green-400 text-xs mt-1">React + Vite + Tailwind</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-2xl mb-1">🚀</div>
            <div className="text-white font-semibold text-sm">Backend</div>
            <div className="text-green-400 text-xs mt-1">FastAPI + PostgreSQL</div>
          </div>
        </div>

        {/* Health Check Button */}
        <button
          onClick={checkHealth}
          disabled={loading}
          className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Checking...' : '🔍 Check Backend Health'}
        </button>

        {/* Health Result */}
        {health && (
          <div className={`mt-4 p-4 rounded-xl text-sm font-mono ${
            health.status === 'ok'
              ? 'bg-green-500/20 border border-green-500/40 text-green-300'
              : 'bg-red-500/20 border border-red-500/40 text-red-300'
          }`}>
            {JSON.stringify(health, null, 2)}
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-white/30 text-xs">
          Module 1 – Project Setup Complete ✓
        </p>
      </div>

      {/* Tech Pills */}
      <div className="flex flex-wrap gap-2 mt-6 justify-center">
        {['FastAPI', 'SQLAlchemy', 'Alembic', 'React 18', 'Vite', 'Tailwind CSS', 'PostgreSQL 14', 'JWT', 'Docker'].map(tech => (
          <span key={tech} className="px-3 py-1 bg-white/10 border border-white/20 text-white/70 text-xs rounded-full backdrop-blur-sm">
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}

export default App

