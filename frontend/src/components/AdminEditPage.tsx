import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MDXRenderer } from './MDXRenderer'
import { Save, X, ArrowLeft } from 'lucide-react'

interface ContentItem {
  id: number
  slug: string
  title: string
  description: string
  content_mdx: string
  difficulty: string
  tags: string
  status: string
  created_at: string
  updated_at: string
}

export const AdminEditPage: React.FC = () => {
  const { token, logout } = useAuth()
  const { contentType, itemId } = useParams<{ contentType: string; itemId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [item, setItem] = useState<ContentItem | null>(null)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const contentTypeSingular = contentType?.slice(0, -1) || ''
  const apiEndpoint = `/api/${contentType}`

  useEffect(() => {
    if (itemId && contentType) {
      fetchItem()
    }
  }, [itemId, contentType])

  // Prevent body scroll when component mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const fetchItem = async () => {
    try {
      const response = await fetch(`${apiEndpoint}/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setItem(data)
        setEditing({ ...data })
        setError(null)
      } else if (response.status === 401) {
        setError('Authentication failed. Please log in again.')
        logout()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to fetch item')
      }
    } catch (error) {
      console.error('Error fetching item:', error)
      setError('Failed to fetch item')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async () => {
    if (!editing) return

    setSaving(true)
    try {
      const response = await fetch(`${apiEndpoint}/${editing.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editing)
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setItem(updatedItem)
        setEditing(updatedItem)
        setError(null)
        // Show success message or redirect
        navigate('/admin')
      } else if (response.status === 401) {
        setError('Authentication failed. Please log in again.')
        logout()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to update item')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      setError('Failed to update item')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = () => {
    updateItem()
  }

  const handleCancel = () => {
    navigate('/admin')
  }

  const getStatusColor = (status: string) => {
    return status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!item || !editing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Item not found</p>
          <button
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="btn btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Admin Panel
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-semibold text-gray-900">Edit {contentTypeSingular}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Left side - Editing Form */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                  <input
                    type="text"
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={editing.difficulty}
                    onChange={(e) => setEditing({ ...editing, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  value={editing.tags}
                  onChange={(e) => setEditing({ ...editing, tags: e.target.value })}
                  placeholder="comma, separated, tags"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content (MDX)</label>
                <textarea
                  value={editing.content_mdx}
                  onChange={(e) => setEditing({ ...editing, content_mdx: e.target.value })}
                  rows={25}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                  style={{ minHeight: '600px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Live Preview */}
        <div className="w-1/2 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="prose prose-lg max-w-none">
                <h1>{editing.title}</h1>
                <p className="text-gray-600">{editing.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(editing.status)}`}>
                    {editing.status}
                  </span>
                  <span className="text-xs text-gray-500">{editing.difficulty}</span>
                  {editing.tags && (
                    <span className="text-xs text-gray-500">Tags: {editing.tags}</span>
                  )}
                </div>
                <MDXRenderer mdx={editing.content_mdx} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
