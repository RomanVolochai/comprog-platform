import React from 'react'
import 'katex/dist/katex.min.css'
import katex from 'katex'

interface MDXRendererProps {
  mdx: string
  onContentLinkClick?: (contentType: string, slug: string) => void
}

// Custom components for content links
const ContentLink: React.FC<{
  type: 'concept' | 'implementation' | 'problem'
  slug: string
  title: string
  onClick?: (contentType: string, slug: string) => void
}> = ({ type, slug, title, onClick }) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'concept': return { color: 'bg-yellow-500', label: 'Concept' }
      case 'implementation': return { color: 'bg-blue-500', label: 'Implementation' }
      case 'problem': return { color: 'bg-red-500', label: 'Problem' }
      default: return { color: 'bg-gray-500', label: 'Content' }
    }
  }

  const config = getTypeConfig(type)
  const contentType = type === 'concept' ? 'concepts' : type === 'implementation' ? 'implementations' : 'problems'

  return (
    <div 
      className="content-link text-center mx-auto max-w-md cursor-pointer hover:scale-105 transition-transform"
      onClick={() => onClick?.(contentType, slug)}
    >
      <div className="content-link-header">
        <div className={`content-link-icon ${config.color}`}></div>
        <span className="content-link-type">{config.label}</span>
      </div>
      <div className="content-link-content">
        <h4>{title}</h4>
        <p className="content-link-slug">{type}/{slug}</p>
      </div>
    </div>
  )
}

export const MDXRenderer: React.FC<MDXRendererProps> = ({ mdx, onContentLinkClick }) => {
  // Custom components for MDX
  const components = {
    // Custom content link components
    ConceptLink: ({ slug, title }: { slug: string; title: string }) => (
      <ContentLink type="concept" slug={slug} title={title} onClick={onContentLinkClick} />
    ),
    ImplementationLink: ({ slug, title }: { slug: string; title: string }) => (
      <ContentLink type="implementation" slug={slug} title={title} onClick={onContentLinkClick} />
    ),
    ProblemLink: ({ slug, title }: { slug: string; title: string }) => (
      <ContentLink type="problem" slug={slug} title={title} onClick={onContentLinkClick} />
    ),
    
    // Enhanced styling for other elements
    h1: (props: any) => <h1 className="text-3xl font-bold mt-8 mb-6" {...props} />,
    h2: (props: any) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
    h3: (props: any) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
    p: (props: any) => <p className="mb-4" {...props} />,
    strong: (props: any) => <strong className="font-bold" {...props} />,
    em: (props: any) => <em className="italic" {...props} />,
    code: (props: any) => (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
    ),
    pre: (props: any) => (
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />
    ),
    a: (props: any) => (
      <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
    ),
    ul: (props: any) => <ul className="list-disc ml-6 mb-4" {...props} />,
    ol: (props: any) => <ol className="list-decimal ml-6 mb-4" {...props} />,
    li: (props: any) => <li className="ml-4" {...props} />,
  }

  // Process the MDX string to convert our custom syntax to proper MDX components
  const processMDX = (content: string) => {
    return content
      // Convert our custom syntax to proper MDX components
      .replace(/\[\[concept:([^|]+)\|([^\]]+)\]\]/g, '<ConceptLink slug="$1" title="$2" />')
      .replace(/\[\[implementation:([^|]+)\|([^\]]+)\]\]/g, '<ImplementationLink slug="$1" title="$2" />')
      .replace(/\[\[problem:([^|]+)\|([^\]]+)\]\]/g, '<ProblemLink slug="$1" title="$2" />')
  }

  const processedMDX = processMDX(mdx)
  
  // For now, we'll use a simple approach since dynamic MDX compilation is complex
  // We'll fall back to our custom renderer but with better LaTeX support
  const renderMDX = (content: string) => {
    let html = content
      
      // Headers (process these first to avoid conflicts with LaTeX)
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-6">$1</h1>')
      
      // LaTeX block math: $$...$$ (process before inline to avoid conflicts)
      .replace(/\$\$([^\$]+)\$\$/g, (match, tex) => {
        try {
          return katex.renderToString(tex, { displayMode: true })
        } catch (e) {
          console.warn('KaTeX rendering error:', e)
          return `<div class="math-block">${tex}</div>`
        }
      })
      
      // LaTeX inline math: $...$ (process after block math)
      .replace(/\$([^\$]+)\$/g, (match, tex) => {
        try {
          return katex.renderToString(tex, { displayMode: false })
        } catch (e) {
          console.warn('KaTeX rendering error:', e)
          return `<span class="math-inline">${tex}</span>`
        }
      })
      
      // Concept links: [[concept:slug|title]]
      .replace(/\[\[concept:([^|]+)\|([^\]]+)\]\]/g, 
        `<div class="content-link concept-link text-center mx-auto max-w-md cursor-pointer hover:scale-105 transition-transform" data-content-type="concepts" data-slug="$1" onclick="window.handleContentLinkClick('concepts', '$1')"><div class="content-link-header"><div class="content-link-icon bg-yellow-500"></div><span class="content-link-type">Concept</span></div><div class="content-link-content"><h4>$2</h4><p class="content-link-slug">concept/$1</p></div></div>`)
      
      // Implementation links: [[implementation:slug|title]]
      .replace(/\[\[implementation:([^|]+)\|([^\]]+)\]\]/g, 
        `<div class="content-link implementation-link text-center mx-auto max-w-md cursor-pointer hover:scale-105 transition-transform" data-content-type="implementations" data-slug="$1" onclick="window.handleContentLinkClick('implementations', '$1')"><div class="content-link-header"><div class="content-link-icon bg-blue-500"></div><span class="content-link-type">Implementation</span></div><div class="content-link-content"><h4>$2</h4><p class="content-link-slug">implementation/$1</p></div></div>`)
      
      // Problem links: [[problem:slug|title]]
      .replace(/\[\[problem:([^|]+)\|([^\]]+)\]\]/g, 
        `<div class="content-link problem-link text-center mx-auto max-w-md cursor-pointer hover:scale-105 transition-transform" data-content-type="problems" data-slug="$1" onclick="window.handleContentLinkClick('problems', '$1')"><div class="content-link-header"><div class="content-link-icon bg-red-500"></div><span class="content-link-type">Problem</span></div><div class="content-link-content"><h4>$2</h4><p class="content-link-slug">problem/$1</p></div></div>`)
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="language-$1">$2</code></pre>')
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
      
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$2</li>')
      
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4">')
      
      // Line breaks
      .replace(/\n/g, '<br>')

    // Wrap in paragraph tags
    html = `<p class="mb-4">${html}</p>`
    
    // Fix list formatting
    html = html.replace(/<li class="ml-4">(.*?)<\/li>/g, '<ul class="list-disc ml-6 mb-4"><li class="ml-4">$1</li></ul>')
    
    return html
  }

  // Set up global click handler for content links
  React.useEffect(() => {
    if (onContentLinkClick) {
      // @ts-ignore
      window.handleContentLinkClick = onContentLinkClick
    }
    
    return () => {
      // @ts-ignore
      delete window.handleContentLinkClick
    }
  }, [onContentLinkClick])

  return (
    <div
      className="markdown prose max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMDX(mdx) }}
    />
  )
}
