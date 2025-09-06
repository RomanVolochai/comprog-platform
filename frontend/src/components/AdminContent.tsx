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
  author: {
    username: string
  }
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

  const getCardTint = (type: string, isDraft: boolean = false) => {
    const opacity = isDraft ? 0.6 : 1
    switch (type) {
      case 'concepts': return { 
        background: `linear-gradient(135deg, rgba(254, 243, 199, ${opacity}) 0%, rgba(253, 230, 138, ${opacity}) 50%, rgba(245, 158, 11, ${opacity}) 100%)`, 
        accent: '#d97706' 
      }
      case 'implementations': return { 
        background: `linear-gradient(135deg, rgba(219, 234, 254, ${opacity}) 0%, rgba(147, 197, 253, ${opacity}) 50%, rgba(59, 130, 246, ${opacity}) 100%)`, 
        accent: '#1d4ed8' 
      }
      case 'problems': return { 
        background: `linear-gradient(135deg, rgba(254, 202, 202, ${opacity}) 0%, rgba(248, 113, 113, ${opacity}) 50%, rgba(239, 68, 68, ${opacity}) 100%)`, 
        accent: '#dc2626' 
      }
      default: return { background: 'linear-gradient(180deg,#fff #f7f7f7)', accent: '#cbd5e1' }
    }
  }

  useEffect(() => {
    console.log('AdminContent: useEffect triggered, contentType:', contentType)
    fetchItems()
    // Clear selection when content type changes
    setSelected(null)
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
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl text-white shadow-lg" style={{ backgroundColor: getCardTint(contentType).accent }}>
              {getIcon()}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{title} Management</h1>
          </div>
          <p className="text-sm text-gray-500 mb-6">{items.length} items</p>
          
          <button
            onClick={createItem}
            className="w-full btn btn-primary flex items-center justify-center gap-2 py-3 text-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            New {contentTypeSingular}
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Items List - Beautiful Block Style */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-4">
            {items.map(item => {
              const tint = getCardTint(contentType, item.status === 'draft')
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col border border-gray-100 cursor-pointer ${
                    selected?.id === item.id ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
                  }`}
                  style={{ background: tint.background }}
                  onClick={() => setSelected(item)}
                >
                  <div className="p-4 flex flex-col h-full">
                    {/* Icon and title section */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-lg">
                        <div className="text-white">
                          {getIcon()}
                        </div>
                      </div>
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg flex-1 h-16">
                        <div className="flex flex-col items-center justify-center h-full">
                          <h3 className="text-sm font-bold leading-tight line-clamp-2 text-center mb-1" style={{ color: 'black' }}>{item.title}</h3>
                          {item.status === 'draft' && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-200 backdrop-blur-sm" style={{ color: 'black' }}>Draft</span>
                          )}
                          {item.status === 'archived' && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 backdrop-blur-sm" style={{ color: 'black' }}>Archived</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {item.tags && (
                      <div className="mb-3">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                          <div className="text-xs text-center" style={{ color: 'black' }}>
                            Tags: {item.tags}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1"></div>

                    {/* Author and Date at bottom */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg w-full">
                      <div className="flex items-center justify-between text-xs" style={{ color: 'black' }}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium" style={{ color: 'black' }}>By {item.author?.username || 'Unknown'}</span>
                        </div>
                        <div style={{ color: 'black' }}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="bg-white shadow-sm border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl text-white shadow-lg" style={{ backgroundColor: getCardTint(contentType).accent }}>
                    {getIcon()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selected.title}</h2>
                    <p className="text-gray-600 mt-1">{selected.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    By {selected.author?.username || 'Unknown'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selected.status === 'published' ? 'bg-green-100 text-green-800' :
                    selected.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    selected.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selected.status}
                  </span>
                  {selected.tags && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      Tags: {selected.tags}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-6">
                {selected.status === 'draft' && (
                  <button
                    onClick={() => publishItem(selected.id)}
                    className="btn btn-success flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Publish
                  </button>
                )}
                <button
                  onClick={() => handleEdit(selected)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => deleteItem(selected.id)}
                  className="btn btn-danger flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
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
              <div className="inline-flex p-6 rounded-full mb-6">
                {getIcon()}
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">No {contentTypeSingular} selected</h3>
              <p className="text-gray-500 text-lg">Select a {contentTypeSingular} from the sidebar to view its content and manage it</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
