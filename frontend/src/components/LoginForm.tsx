import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react'

export const LoginForm: React.FC = () => {
  const { login, register, authError, clearAuthError } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Clear auth error when component mounts or when switching modes
  React.useEffect(() => {
    if (authError) {
      setError(authError)
      clearAuthError()
    }
  }, [authError, clearAuthError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('LoginForm: Form submitted')
    console.log('LoginForm: Username =', username)
    console.log('LoginForm: Password =', password ? '***' : 'empty')
    console.log('LoginForm: Is login mode =', isLogin)
    
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        console.log('LoginForm: Calling login function')
        await login(username, password)
        console.log('LoginForm: Login function completed')
      } else {
        console.log('LoginForm: Calling register function')
        await register(username, email, password)
        console.log('LoginForm: Register function completed')
      }
    } catch (err) {
      console.error('LoginForm: Error occurred:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      console.log('LoginForm: Setting loading to false')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Comprog Platform</h1>
            <p className="text-slate-300">Welcome to competitive programming learning</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input pl-10"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-300 hover:text-white transition-colors bg-transparent border-none outline-none p-0"
                  style={{ background: 'transparent', border: 'none', outline: 'none' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setUsername('')
                  setEmail('')
                  setPassword('')
                }}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                {isLogin ? 'Register here' : 'Login here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
