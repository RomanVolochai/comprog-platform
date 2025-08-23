import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  register: (username: string, email: string, password: string) => Promise<void>
  loading: boolean
  authError: string | null
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('token')
    // Only use the token if it's not null, undefined, or empty string
    return storedToken && storedToken !== 'null' && storedToken !== 'undefined' ? storedToken : null
  })
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [tokenFailures, setTokenFailures] = useState(0)

  const fetchUser = useCallback(async () => {
    try {
      console.log('AuthProvider: Fetching user with token =', token ? 'present' : 'missing')
      console.log('AuthProvider: Token value =', token)
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      console.log('AuthProvider: /api/auth/me response status =', response.status)
      if (response.ok) {
        const userData = await response.json()
        console.log('AuthProvider: User data received =', userData.username)
        setUser(userData)
        setAuthError(null) // Clear any previous errors
        setTokenFailures(0) // Reset failure count on success
        console.log('AuthProvider: User set successfully')
      } else if (response.status === 401) {
        console.log('AuthProvider: Token invalid, incrementing failure count')
        setTokenFailures(prev => prev + 1)
        
        // Only clear token after multiple failures to prevent race conditions
        if (tokenFailures >= 2) {
          console.log('AuthProvider: Multiple token failures, clearing token')
          setAuthError('Your session has expired. Please log in again.')
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
          setTokenFailures(0)
        } else {
          console.log('AuthProvider: First token failure, keeping token for retry')
        }
      } else {
        console.log('AuthProvider: Unexpected error, keeping token')
        setAuthError('Failed to verify your session. Please try again.')
        // Don't clear token for other errors
      }
    } catch (error) {
      console.error('AuthProvider: Error fetching user:', error)
      setAuthError('Network error. Please check your connection.')
      // Don't clear token for network errors
    } finally {
      setLoading(false)
      console.log('AuthProvider: fetchUser completed, loading set to false')
    }
  }, [token, tokenFailures])

  useEffect(() => {
    console.log('AuthProvider: Initial token =', token ? 'present' : 'missing')
    console.log('AuthProvider: Token value =', token)
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token, fetchUser])

  const login = async (username: string, password: string) => {
    console.log('AuthProvider: Attempting login for user =', username)
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    const response = await fetch('/api/auth/token', {
      method: 'POST',
      body: formData
    })

    console.log('AuthProvider: Login response status =', response.status)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Login failed')
    }

    const data = await response.json()
    console.log('AuthProvider: Login successful, token received')
    console.log('AuthProvider: Token value =', data.access_token)
    console.log('AuthProvider: Token length =', data.access_token?.length)
    
    // Only store valid tokens
    if (data.access_token && data.access_token !== 'null' && data.access_token !== 'undefined') {
      localStorage.setItem('token', data.access_token)
      setToken(data.access_token)
      console.log('AuthProvider: Token set, calling fetchUser...')
      await fetchUser()
      console.log('AuthProvider: fetchUser completed')
    } else {
      console.error('AuthProvider: Invalid token received from server')
      throw new Error('Invalid token received from server')
    }
  }

  const register = async (username: string, email: string, password: string) => {
    console.log('AuthProvider: Attempting registration for user =', username)
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    })

    console.log('AuthProvider: Registration response status =', response.status)
    if (!response.ok) {
      const errorData = await response.json()
      // Handle validation errors
      if (response.status === 422 && errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          const errors = errorData.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join(', ')
          throw new Error(errors)
        } else {
          throw new Error(errorData.detail)
        }
      }
      throw new Error(errorData.detail || 'Registration failed')
    }

    console.log('AuthProvider: Registration successful, auto-login')
    // Auto-login after registration
    await login(username, password)
  }

  const logout = () => {
    console.log('AuthProvider: Logging out')
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const clearAuthError = () => {
    setAuthError(null)
  }

  const value = {
    user,
    token,
    login,
    logout,
    register,
    loading,
    authError,
    clearAuthError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
