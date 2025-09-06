import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { X, Plus, BookOpen } from 'lucide-react'

interface ConceptTagInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const ConceptTagInput: React.FC<ConceptTagInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Add concept tags..." 
}) => {
  const { token } = useAuth()
  const [conceptSlugs, setConceptSlugs] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Parse current tags from value
  const currentTags = value ? value.split(',').map(tag => tag.trim()).filter(tag => tag) : []

  // Fetch concept slugs on component mount
  useEffect(() => {
    fetchConceptSlugs()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Use a small delay to allow click events to process first
      setTimeout(() => {
        if (
          suggestionsRef.current && 
          !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setShowSuggestions(false)
        }
      }, 100)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchConceptSlugs = async () => {
    try {
      const response = await fetch('/api/concepts/all/slugs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setConceptSlugs(data.slugs || [])
      } else {
        console.error('Failed to fetch concept slugs:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching concept slugs:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Filter concept slugs based on input
    if (newValue.trim()) {
      const filtered = conceptSlugs.filter(slug => 
        slug.toLowerCase().includes(newValue.toLowerCase()) &&
        !currentTags.includes(slug)
      )
      setSuggestions(filtered.slice(0, 10)) // Limit to 10 suggestions
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return

    // Only allow concept slugs
    if (!conceptSlugs.includes(trimmedTag)) {
      alert(`"${trimmedTag}" is not a valid concept slug. Please select from existing concepts.`)
      return
    }

    // Don't add if already exists
    if (currentTags.includes(trimmedTag)) {
      return
    }

    const newTags = [...currentTags, trimmedTag]
    onChange(newTags.join(', '))
    setInputValue('')
    setShowSuggestions(false)
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove)
    onChange(newTags.join(', '))
  }

  const selectSuggestion = (suggestion: string) => {
    // Prevent blur from interfering
    setShowSuggestions(false)
    addTag(suggestion)
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Don't blur if clicking on a suggestion
    if (suggestionsRef.current && suggestionsRef.current.contains(e.relatedTarget as Node)) {
      return
    }
    
    // Add the current input as a tag if it's a valid concept slug
    if (inputValue.trim()) {
      addTag(inputValue)
    }
  }

  return (
    <div className="relative">
      {/* Current Tags */}
      {currentTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {currentTags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              <BookOpen className="w-3 h-3" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => {
          if (inputValue.trim() && suggestions.length > 0) {
            setShowSuggestions(true)
          }
        }}
        placeholder={currentTags.length === 0 ? placeholder : "Add more concept tags..."}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault() // Prevent input blur
                selectSuggestion(suggestion)
              }}
              onClick={(e) => {
                e.preventDefault()
                selectSuggestion(suggestion)
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm flex items-center gap-2"
            >
              <BookOpen className="w-3 h-3 text-gray-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-1">
        Only published concept slugs can be used as tags
      </p>
    </div>
  )
}
