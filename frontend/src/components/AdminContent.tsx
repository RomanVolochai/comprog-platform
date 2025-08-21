import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { MDXRenderer } from './MDXRenderer'
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen, Code, Target } from 'lucide-react'

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

interface AdminContentProps {
  contentType: 'concepts' | 'implementations' | 'problems'
}

export const AdminContent: React.FC<AdminContentProps> = ({ contentType }) => {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<ContentItem[]>([])
  const [selected, setSelected] = useState<ContentItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const contentTypeSingular = contentType.slice(0, -1) // Remove 's'
  const apiEndpoint = `/api/${contentType}`
  const title = contentType.charAt(0).toUpperCase() + contentType.slice(1)

  const getIcon = () => {
    switch (contentType) {
      case 'concepts': return <BookOpen className="w-5 h-5" />
      case 'implementations': return <Code className="w-5 h-5" />
      case 'problems': return <Target className="w-5 h-5" />
      default: return <BookOpen className="w-5 h-5" />
    }
  }

  const getColorClass = () => {
    switch (contentType) {
      case 'concepts': return 'bg-yellow-500'
      case 'implementations': return 'bg-blue-500'
      case 'problems': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  useEffect(() => {
    console.log('AdminContent: useEffect triggered, contentType:', contentType)
    fetchItems()
  }, [contentType])

  useEffect(() => {
    console.log('AdminContent: items state changed, count:', items.length, 'items:', items.map((item: any) => ({ id: item.id, title: item.title, status: item.status })))
  }, [items])

  const fetchItems = async () => {
    try {
      console.log('AdminContent: Fetching items from:', `${apiEndpoint}/`)
      const response = await fetch(`${apiEndpoint}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('AdminContent: Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('AdminContent: Received items:', data.length, 'items')
        console.log('AdminContent: Items statuses:', data.map((item: any) => ({ id: item.id, title: item.title, status: item.status })))
        console.log('AdminContent: Setting items state with:', data)
        setItems(data)
        setError(null)
      } else if (response.status === 401) {
        setError('Authentication failed. Please log in again.')
        logout()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to fetch items')
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      setError('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  const createItem = async () => {
    const newSlug = prompt(`Slug for new ${contentTypeSingular}? (e.g., ${contentTypeSingular}-basics)`)
    if (!newSlug) return

    try {
      const response = await fetch(`${apiEndpoint}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slug: newSlug,
          title: newSlug.replace(/-/g, ' '),
          description: '',
          content_mdx: `# ${newSlug.replace(/-/g, ' ')}\n\nWrite your ${contentTypeSingular} content here...`,
          difficulty: 'beginner',
          tags: '',
          status: 'draft'
        })
      })

      if (response.ok) {
        const item = await response.json()
        setItems(prev => [item, ...prev])
        setSelected(item)
        setError(null)
      } else if (response.status === 401) {
        setError('Authentication failed. Please log in again.')
        logout()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to create item')
      }
    } catch (error) {
      console.error('Error creating item:', error)
      setError('Failed to create item')
    }
  }

  const deleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`${apiEndpoint}/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setItems(prev => prev.filter(i => i.id !== itemId))
        if (selected?.id === itemId) {
          setSelected(null)
        }
        setError(null)
      } else if (response.status === 401) {
        setError('Authentication failed. Please log in again.')
        logout()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      setError('Failed to delete item')
    }
  }

  const publishItem = async (itemId: number) => {
    try {
      const response = await fetch(`${apiEndpoint}/${itemId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setItems(prev => prev.map(i => i.id === itemId ? updatedItem : i))
        if (selected?.id === itemId) {
          setSelected(updatedItem)
        }
        setError(null)
      } else if (response.status === 401) {
        setError('Authentication failed. Please log in again.')
        logout()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to publish item')
      }
    } catch (error) {
      console.error('Error publishing item:', error)
      setError('Failed to publish item')
    }
  }

  const handleEdit = (item: ContentItem) => {
    navigate(`/admin/${contentType}/edit/${item.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className={`p-2 rounded-lg ${getColorClass()} text-white`}>
              {getIcon()}
            </div>
            <h1 className="text-xl font-bold text-gray-800">{title} Management</h1>
          </div>
          
          <button
            onClick={createItem}
            className="w-full btn btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New {contentTypeSingular}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto">
          {items.map(item => (
            <div
              key={item.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selected?.id === item.id ? 'bg-blue-50 border-l-4 border-blue-400' : ''
              }`}
              onClick={() => setSelected(item)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{item.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      item.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.difficulty}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'published' ? 'bg-green-100 text-green-800' :
                      item.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(item)
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteItem(item.id)
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="bg-white shadow-sm border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selected.title}</h2>
                  <p className="text-gray-600">{selected.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selected.status === 'draft' && (
                    <button
                      onClick={() => publishItem(selected.id)}
                      className="btn btn-primary"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(selected)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose max-w-none">
                <MDXRenderer mdx={selected.content_mdx} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className={`inline-flex p-4 rounded-full ${getColorClass()} bg-opacity-10 mb-4`}>
                {getIcon()}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {contentTypeSingular} selected</h3>
              <p className="text-gray-500">Select a {contentTypeSingular} from the sidebar to view its content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
