import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AdminContent } from './AdminContent'
import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export const AdminPanel: React.FC = () => {
  const { user, logout } = useAuth()
  const [selectedContentType, setSelectedContentType] = useState<'concepts' | 'implementations' | 'problems'>('concepts')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-4 h-4" />
                View Site
              </Link>
              <span className="text-sm text-gray-500">
                Welcome, {user?.username}!
              </span>
              <button
                onClick={logout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content Type Selector */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Content Type:</label>
            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value as 'concepts' | 'implementations' | 'problems')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="concepts">Concepts</option>
              <option value="implementations">Implementations</option>
              <option value="problems">Problems</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto">
        <AdminContent contentType={selectedContentType} />
      </main>
    </div>
  )
}
