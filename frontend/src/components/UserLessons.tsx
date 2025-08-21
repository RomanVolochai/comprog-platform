import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { MDXRenderer } from './MDXRenderer'
import { BookOpen, Code, Target, Settings, ArrowLeft, Search } from 'lucide-react'
import { Link, useParams, useNavigate } from 'react-router-dom'

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
  type?: 'concepts' | 'implementations' | 'problems'
}

export default function UserLessons(): JSX.Element {
  const { token, user, logout } = useAuth()
  const { contentType, slug } = useParams<{ contentType?: string; slug?: string }>()
  const navigate = useNavigate()
  const [concepts, setConcepts] = useState<ContentItem[]>([])
  const [implementations, setImplementations] = useState<ContentItem[]>([])
  const [problems, setProblems] = useState<ContentItem[]>([])
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchAllContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle URL-based navigation
  useEffect(() => {
    if (contentType && slug && !loading) {
      const allItems = getAllItems()
      const item = allItems.find(item => 
        item.type === contentType && item.slug === slug
      )
      if (item) {
        setSelectedItem(item)
      } else {
        // Item not found, redirect to main page
        navigate('/', { replace: true })
      }
    } else if (!contentType && !slug && selectedItem) {
      // URL changed to main page, clear selection
      setSelectedItem(null)
    }
  }, [contentType, slug, loading, navigate])

  const fetchAllContent = async () => {
    setLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const [conceptsRes, implementationsRes, problemsRes] = await Promise.all([
        fetch('/api/concepts/', { headers }),
        fetch('/api/implementations/', { headers }),
        fetch('/api/problems/', { headers })
      ])

              if (conceptsRes.ok) {
          const conceptsData = await conceptsRes.json()
          // Show all content to admins, only published to regular users
          const filteredConcepts = user?.is_admin 
            ? conceptsData 
            : conceptsData.filter((item: ContentItem) => item.status === 'published')
          setConcepts(filteredConcepts)
        }

        if (implementationsRes.ok) {
          const implementationsData = await implementationsRes.json()
          // Show all content to admins, only published to regular users
          const filteredImplementations = user?.is_admin 
            ? implementationsData 
            : implementationsData.filter((item: ContentItem) => item.status === 'published')
          setImplementations(filteredImplementations)
        }

        if (problemsRes.ok) {
          const problemsData = await problemsRes.json()
          // Show all content to admins, only published to regular users
          const filteredProblems = user?.is_admin 
            ? problemsData 
            : problemsData.filter((item: ContentItem) => item.status === 'published')
          setProblems(filteredProblems)
        }

      setError(null)
    } catch (err) {
      console.error('Error fetching content:', err)
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'concepts': return <BookOpen className="w-5 h-5" />
      case 'implementations': return <Code className="w-5 h-5" />
      case 'problems': return <Target className="w-5 h-5" />
      default: return <BookOpen className="w-5 h-5" />
    }
  }

  // Elegant, muted card background (soft tints) per type — full card background now tinted (not only icon)
  const getCardTint = (type: string, isDraft: boolean = false) => {
    const opacity = isDraft ? 0.6 : 1 // Make drafts darker
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'concepts': return 'Concept'
      case 'implementations': return 'Implementation'
      case 'problems': return 'Problem'
      default: return 'Content'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAllItems = () => {
    const allItems = [
      ...concepts.map(item => ({ ...item, type: 'concepts' as const })),
      ...implementations.map(item => ({ ...item, type: 'implementations' as const })),
      ...problems.map(item => ({ ...item, type: 'problems' as const }))
    ]

    return allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const handleItemClick = (item: ContentItem) => {
    setSelectedItem(item)
    navigate(`/${item.type}/${item.slug}`)
  }

  const handleContentLinkClick = (contentType: string, slug: string) => {
    const allItems = getAllItems()
    const item = allItems.find(item => 
      item.type === contentType && item.slug === slug
    )
    if (item) {
      handleItemClick(item)
    }
  }

  const handleBackClick = () => {
    setSelectedItem(null)
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (selectedItem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackClick}
                className="btn btn-secondary flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Content
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {user?.is_admin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              <span className="text-sm text-gray-500">Welcome, {user?.username}!</span>
              <button onClick={logout} className="btn btn-secondary">Logout</button>
            </div>
          </div>
        </header>

                 <div className="px-6 py-8 flex justify-center">
           <div className="max-w-4xl bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="p-4 rounded-lg" style={{ background: getCardTint(selectedItem.type || '').accent }}>
                  {getIcon(selectedItem.type || '')}
                </div>
                <div>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{getTypeLabel(selectedItem.type || '')}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedItem.difficulty)}`}>{selectedItem.difficulty}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{selectedItem.title}</h1>
                  <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto">{selectedItem.description}</p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <span>By {selectedItem.author?.username || 'Unknown'}</span>
                    {selectedItem.tags && (
                      <><span>•</span><span>Tags: {selectedItem.tags}</span></>
                    )}
                  </div>
                </div>
              </div>
                       </div>
         </div>
       </div>

       <div className="px-6 pb-8 flex justify-center">
         <div className="max-w-4xl bg-white rounded-xl shadow-lg p-8">
            <div className="prose prose-lg max-w-none mx-auto">
              <MDXRenderer 
                mdx={selectedItem.content_mdx} 
                onContentLinkClick={handleContentLinkClick}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const allItems = getAllItems()
  const filtered = allItems.filter(it => it.title.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
             <header className="bg-gray-100 shadow-sm border-b border-gray-200 sticky top-0 z-30">
         <div className="flex justify-between items-center h-16 px-6">
           <div className="flex items-center gap-4">
             <h1 className="text-2xl font-bold text-gray-900">Comprog Platform</h1>
           </div>

           <div className="flex items-center space-x-4">
             {user?.is_admin && (
               <Link to="/admin" className="flex items-center gap-2 text-sm text-black hover:text-gray-700 transition-colors">
                 <Settings className="w-4 h-4" />
                 Admin Panel
               </Link>
             )}
             <span className="text-sm text-black">Welcome, {user?.username}!</span>
             <button onClick={logout} className="btn btn-secondary">Logout</button>
           </div>
         </div>
       </header>

      <div className="container mx-auto px-6 py-12">
                 <div className="text-center mb-8">
           <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">All Learning Content</h2>
         </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex p-6 rounded-full bg-gray-100 mb-4">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No content available</h3>
            <p className="text-gray-500">Try adjusting your search or check back later.</p>
          </div>
        ) : (
                     // responsive grid that adapts to screen size
           <div className="mx-auto grid gap-6 max-w-7xl w-full" style={{ 
             gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))'
           }}>
             {filtered.map((item) => {
               const tint = getCardTint(item.type || '', item.status === 'draft')
              return (
                                <div
                  key={`${item.type}-${item.id}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if ((e as React.KeyboardEvent).key === 'Enter') handleItemClick(item) }}
                  onClick={() => handleItemClick(item)}
                  className="aspect-square rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col border border-gray-100"
                  aria-label={`${getTypeLabel(item.type || '')}: ${item.title}`}
                  style={{ background: tint.background }}
                >
                                     <div className="p-4 flex flex-col h-full">
                     {/* Icon and title section at top */}
                     <div className="flex items-start gap-3 mb-4">
                       <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-lg">
                         <div className="text-white">
                           {getIcon(item.type || '')}
                         </div>
                       </div>
                       <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg flex-1 h-16">
                         <div className="flex flex-col items-center justify-center h-full">
                           <h3 className="text-sm font-bold leading-tight line-clamp-2 text-center mb-1" style={{ color: 'black' }}>{item.title}</h3>
                           {item.status === 'draft' && (
                             <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 backdrop-blur-sm" style={{ color: 'black' }}>Draft</span>
                           )}
                         </div>
                       </div>
                     </div>

                     {/* Spacer to push author to bottom */}
                     <div className="flex-1"></div>

                     {/* Author at the bottom */}
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
        )}
      </div>
    </div>
  )
}
