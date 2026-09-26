/*
 * SearchInput.tsx
 * Renders specialized search input with clear button and search icon.
 * Standardizes search inputs across navigation and filters.
 */

import React from 'react'
import { Search, X } from 'lucide-react'

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string
  /** Called when text value changes. Preferred over native onChange. */
  onValueChange?: (value: string) => void
  onClear?: () => void
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onValueChange,
  onClear,
  onChange,
  placeholder = 'Search...',
  className = '',
  ...props
}) => {
  const handleClear = () => {
    onValueChange?.('')
    onClear?.()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange?.(e.target.value)
    onChange?.(e)
  }

  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--focus-ring)] transition-colors"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-[var(--radius-sm)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
