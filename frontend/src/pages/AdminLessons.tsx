import React from 'react'

type Lesson = {
  id: number
  slug: string
  title: string
  status: string
  concept_mdx: string
  implementation_mdx: string
  problem_mdx: string
  created_at: string
  updated_at: string
}

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h2>Something went wrong.</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      )
    }

    return this.props.children
  }
}

export const AdminLessons: React.FC = () => {
  const [lessons, setLessons] = React.useState<Lesson[]>([])
  const [selected, setSelected] = React.useState<Lesson | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    console.log('AdminLessons: useEffect running')
    fetch('/api/lessons/')
      .then((r) => {
        console.log('AdminLessons: fetch response status:', r.status)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        console.log('AdminLessons: lessons data:', data)
        setLessons(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('AdminLessons: fetch error:', err)
        setError(err.message)
        setLessons([])
        setLoading(false)
      })
  }, [])

  const createDraft = async () => {
    try {
      const slug = prompt('Slug for new lesson? (e.g., arrays-basics)')
      if (!slug) return
      
      console.log('Creating lesson with slug:', slug)
      const res = await fetch('/api/lessons/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title: slug.replace(/-/g, ' '), status: 'draft' }),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || `HTTP ${res.status}`)
      }
      
      const lesson = await res.json()
      console.log('Created lesson:', lesson)
      setLessons((l) => [lesson, ...l])
      setSelected(lesson)
    } catch (err) {
      console.error('Error creating lesson:', err)
      alert(`Error creating lesson: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Loading lessons...</div>
  }

  if (error) {
    return <div style={{ padding: 20, color: 'red' }}>Error loading lessons: {error}</div>
  }

  return (
    <ErrorBoundary>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100svh' }}>
        <aside style={{ borderRight: '1px solid #111827', padding: 16, background: '#0b1220', color: 'white' }}>
          <h2 style={{ marginTop: 0 }}>Lessons</h2>
          <button onClick={createDraft} style={{ marginBottom: 12 }}>+ New lesson</button>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {lessons.map((l) => (
              <li key={l.id}>
                <button 
                  onClick={() => {
                    console.log('Selecting lesson:', l)
                    setSelected(l)
                  }} 
                  style={{ width: '100%', textAlign: 'left' }}
                >
                  {l.title} <span style={{ opacity: 0.6 }}>({l.status})</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main style={{ padding: 16 }}>
          {selected ? (
            <ErrorBoundary>
              <LessonEditor lesson={selected} onChange={setSelected} />
            </ErrorBoundary>
          ) : (
            <div>Select a lesson</div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}

const LessonEditor: React.FC<{ lesson: Lesson; onChange: (l: Lesson) => void }> = ({ lesson, onChange }) => {
  const [title, setTitle] = React.useState(lesson.title)
  const [slug, setSlug] = React.useState(lesson.slug)
  const [concept, setConcept] = React.useState(lesson.concept_mdx || '# Concept')
  const [impl, setImpl] = React.useState(lesson.implementation_mdx || '# Implementation')
  const [problem, setProblem] = React.useState(lesson.problem_mdx || '# Problem')
  const [saving, setSaving] = React.useState(false)

  const save = async () => {
    try {
      setSaving(true)
      console.log('Saving lesson:', lesson.id)
      
      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, concept_mdx: concept, implementation_mdx: impl, problem_mdx: problem }),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || `HTTP ${res.status}`)
      }
      
      const updated = await res.json()
      console.log('Lesson saved:', updated)
      onChange(updated)
    } catch (err) {
      console.error('Error saving lesson:', err)
      alert(`Error saving lesson: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <section>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <button onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap: 8, height: '70vh' }}>
          <textarea value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Concept MDX" />
          <textarea value={impl} onChange={(e) => setImpl(e.target.value)} placeholder="Implementation MDX" />
          <textarea value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Problem MDX" />
        </div>
      </section>
      <section style={{ overflow: 'auto', padding: 12, background: '#0b1220', color: 'white', borderRadius: 8 }}>
        <div>
          <h3 style={{ color: '#fbbf24' }}>Concept</h3>
          <Preview mdx={concept} />
        </div>
        <hr />
        <div>
          <h3 style={{ color: '#3b82f6' }}>Implementation</h3>
          <Preview mdx={impl} />
        </div>
        <hr />
        <div>
          <h3 style={{ color: '#ef4444' }}>Problem</h3>
          <Preview mdx={problem} />
        </div>
      </section>
    </div>
  )
}

// Simple markdown-like preview
const Preview: React.FC<{ mdx: string }> = ({ mdx }) => {
  try {
    const html = mdx
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; margin: 16px 0; color: white;">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; margin: 16px 0; color: white;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 18px; margin: 16px 0; color: white;">$1</h3>')
      .replace(/`([^`]+)`/g, '<code style="padding: 2px 6px; background: #111827; color: #f9fafb; border-radius: 4px;">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n$/g, '')
      .replace(/\n\n/g, '<br/><br/>')
    return <div dangerouslySetInnerHTML={{ __html: html }} />
  } catch (err) {
    console.error('Error rendering preview:', err)
    return <div style={{ color: 'red' }}>Error rendering preview</div>
  }
}


