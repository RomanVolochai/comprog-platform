import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { LoginForm } from './components/LoginForm'
import { AdminPanel } from './components/AdminPanel'
import { AdminEditPage } from './components/AdminEditPage'
import UserLessons from './components/UserLessons'
import { ErrorBoundary } from './components/ErrorBoundary'

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !user.is_admin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

const AppContent: React.FC = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          user ? <Navigate to="/" replace /> : <LoginForm />
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPanel />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/:contentType/edit/:itemId" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminEditPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <UserLessons />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/:contentType/:slug" 
        element={
          <ProtectedRoute>
            <UserLessons />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}

export default App
