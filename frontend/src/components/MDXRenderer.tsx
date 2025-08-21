import React from 'react'

interface MDXRendererProps {
  mdx: string
  onContentLinkClick?: (contentType: string, slug: string) => void
}

export const MDXRenderer: React.FC<MDXRendererProps> = ({ mdx, onContentLinkClick }) => {
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

  const renderMDX = (content: string) => {
    let html = content
      // LaTeX inline math: $...$ (placeholder for now)
      .replace(/\$([^\$]+)\$/g, '<span class="math-inline">$1</span>')
      // LaTeX block math: $$...$$ (placeholder for now)
      .replace(/\$\$([^\$]+)\$\$/g, '<div class="math-block">$1</div>')
      
      // Concept links: [[concept:slug|title]]
      .replace(/\[\[concept:([^|]+)\|([^\]]+)\]\]/g, 
        `<div class="content-link concept-link text-center mx-auto max-w-md cursor-pointer hover:scale-105 transition-transform" data-content-type="concepts" data-slug="$1" onclick="window.handleContentLinkClick('concepts', '$1')"><div class="content-link-header"><div class="content-link-icon bg-yellow-500"></div><span class="content-link-type">Concept</span></div><div class="content-link-content"><h4>$2</h4><p class="content-link-slug">concept/$1</p></div></div>`)
      
      // Implementation links: [[implementation:slug|title]]
      .replace(/\[\[implementation:([^|]+)\|([^\]]+)\]\]/g, 
        `<div class="content-link implementation-link text-center mx-auto max-w-md cursor-pointer hover:scale-105 transition-transform" data-content-type="implementations" data-slug="$1" onclick="window.handleContentLinkClick('implementations', '$1')"><div class="content-link-header"><div class="content-link-icon bg-blue-500"></div><span class="content-link-type">Implementation</span></div><div class="content-link-content"><h4>$2</h4><p class="content-link-slug">implementation/$1</p></div></div>`)
      
      // Problem links: [[problem:slug|title]]
      .replace(/\[\[problem:([^|]+)\|([^\]]+)\]\]/g, 
        `<div class="content-link problem-link text-center mx-auto max-w-md cursor-pointer hover:scale-105 transition-transform" data-content-type="problems" data-slug="$1" onclick="window.handleContentLinkClick('problems', '$1')"><div class="content-link-header"><div class="content-link-icon bg-red-500"></div><span class="content-link-type">Problem</span></div><div class="content-link-content"><h4>$2</h4><p class="content-link-slug">problem/$1</p></div></div>`)
      
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-6">$1</h1>')
      
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

  return (
    <div
      className="markdown prose max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMDX(mdx) }}
    />
  )
}
