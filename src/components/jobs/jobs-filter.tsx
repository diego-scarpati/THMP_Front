'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

interface JobsFilterProps {
  onFiltersChange?: (params: Record<string, string>) => void
  onSearch?: () => void
}

export default function JobsFilter({ onFiltersChange, onSearch }: JobsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSearching, setIsSearching] = useState(false)

  // Local state for filters (before applying to URL)
  const [localFilters, setLocalFilters] = useState({
    post_date: searchParams?.get('post_date') || 'all',
    easy_apply: searchParams?.get('easy_apply') || 'all',
    approved_by_formula: searchParams?.get('approved_by_formula') || 'all',
    approved_by_gpt: searchParams?.get('approved_by_gpt') || 'all',
    job_descriptions: searchParams?.get('job_descriptions') === 'true',
  })

  const updateQueryParams = useCallback((filters: typeof localFilters) => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'jobDescriptions') {
        if (value === true) {
          params.set(key, 'true')
        }
      } else if (value && value !== 'all') {
        params.set(key, value as string)
      }
    })

    // Convert URLSearchParams to plain object for callback
    const paramsObject = Object.fromEntries(params.entries())
    onFiltersChange?.(paramsObject)

    // Update the URL
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(`${window.location.pathname}${newUrl}`, { scroll: false })
  }, [router, onFiltersChange])

  const handleLocalFilterChange = (key: string, value: string | boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSearch = async () => {
    setIsSearching(true)
    
    // Update URL with current local filters
    updateQueryParams(localFilters)
    
    // Trigger the search callback
    onSearch?.()
    
    // Reset searching state after a brief delay
    setTimeout(() => {
      setIsSearching(false)
    }, 500)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      post_date: 'all',
      easy_apply: 'all',
      approved_by_formula: 'all',
      approved_by_gpt: 'all',
      job_descriptions: false,
    }
    
    setLocalFilters(clearedFilters)
    router.push(window.location.pathname, { scroll: false })
    onFiltersChange?.({})
  }

  return (
    <div className="bg-background border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Jobs</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        
        {/* Post Date Sort */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Post Date
          </label>
          <select
            value={localFilters.post_date}
            onChange={(e) => handleLocalFilterChange('post_date', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All</option>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Easy Apply Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Easy Apply
          </label>
          <select
            value={localFilters.easy_apply}
            onChange={(e) => handleLocalFilterChange('easy_apply', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Approved by Formula Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Approved by Formula
          </label>
          <select
            value={localFilters.approved_by_formula}
            onChange={(e) => handleLocalFilterChange('approved_by_formula', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Approved by GPT Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Approved by GPT
          </label>
          <select
            value={localFilters.approved_by_gpt}
            onChange={(e) => handleLocalFilterChange('approved_by_gpt', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Job Descriptions Filter */}
        {/* <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Job Descriptions
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="jobDescriptions"
              checked={localFilters.job_descriptions}
              onChange={(e) => handleLocalFilterChange('job_descriptions', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="jobDescriptions" className="ml-2 text-sm text-gray-700">
              Has Job Descriptions
            </label>
          </div>
        </div> */}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={handleClearFilters}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-background hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear Filters
        </button>

        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </>
          ) : (
            <>
              <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Jobs
            </>
          )}
        </button>
      </div>
    </div>
  )
}