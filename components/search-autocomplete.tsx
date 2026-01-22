"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { searchCoursesAutocomplete } from "@/lib/actions/search"
import { Search, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface SearchAutocompleteProps {
  placeholder?: string
  universityId?: string
}

export function SearchAutocomplete({ placeholder = "Search courses...", universityId }: SearchAutocompleteProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true)
        try {
          const courses = await searchCoursesAutocomplete(query, universityId)
          setResults(courses)
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, universityId])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="pl-10"
        />
        {isLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border bg-popover shadow-md">
          {results.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="flex gap-3 border-b px-4 py-3 last:border-0 hover:bg-muted"
              onClick={() => {
                setShowResults(false)
                setQuery("")
              }}
            >
              {course.thumbnail_url && (
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                  <Image
                    src={course.thumbnail_url || "/placeholder.svg"}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{course.title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
