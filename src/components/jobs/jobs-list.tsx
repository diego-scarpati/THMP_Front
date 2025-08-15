'use client'

import { useJobs } from '@/hooks'
import type { Job } from '@/types/api'
import { useEffect } from 'react'

interface JobsListProps {
  params?: {
    page?: number
    limit?: number
    postDate?: string
    easyApply?: 'yes' | 'no' | 'pending'
    approvedByFormula?: 'yes' | 'no' | 'pending'
    approvedByGPT?: 'yes' | 'no' | 'pending'
    jobDescriptions?: boolean
    company?: string
    location?: string
    type?: string
  }
  onRefetch?: (refetchFn: () => void) => void
}

export default function JobsList({ params, onRefetch }: JobsListProps) {
  const { data, isLoading, error, isError, refetch, isFetching } = useJobs(params)

  // Expose refetch function to parent component
  useEffect(() => {
    if (onRefetch) {
      onRefetch(() => refetch())
    }
  }, [onRefetch, refetch])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading jobs...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <h3 className="text-red-800 font-semibold">Error loading jobs</h3>
        <p className="text-red-600 mt-1">
          {error?.message || 'Failed to fetch jobs. Please try again.'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-3 inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!data?.jobs || data.jobs.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <h3 className="text-lg font-medium">No jobs found</h3>
        <p className="mt-1">Try adjusting your search criteria.</p>
        <button
          onClick={() => refetch()}
          className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>
    )
  }

  const jobs = data.jobs

  return (
    <div className="space-y-4">
      {/* Loading overlay when refetching */}
      {isFetching && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <svg className="animate-spin h-4 w-4 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-blue-700">Updating results...</span>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {params && Object.keys(params).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(params).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {key}: {value.toString()}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Jobs ({jobs.length})
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Page {data.currentPage} of {data.totalPages} 
            ({data.total} total jobs)
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {jobs.map((job: Job) => (
          <div
            key={job.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            {/* Rest of the job card content remains the same */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {job.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="font-medium">{job.company}</span>
                  {job.location && (
                    <>
                      <span>•</span>
                      <span>{job.location}</span>
                    </>
                  )}
                  {job.type && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{job.type}</span>
                    </>
                  )}
                </div>
              </div>
              
              {job.easy_apply && job.easy_apply !== 'pending' && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    job.easy_apply === 'yes'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {job.easy_apply === 'yes' ? 'Easy Apply' : 'No Easy Apply'}
                </span>
              )}
            </div>

            {/* Job Details */}
            <div className="space-y-2 mb-4">
              {job.post_date && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Posted:</span> {new Date(job.post_date).toLocaleDateString()}
                </div>
              )}
              
              {job.posted_by && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Posted by:</span> {job.posted_by}
                </div>
              )}

              {job.benefits && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Benefits:</span> {job.benefits}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-50 transition-colors"
                  >
                    View Job
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-400">
                  ID: {job.id}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Info */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 text-sm text-gray-500">
          <span>
            Showing {((data.currentPage - 1) * data.limit) + 1} to{' '}
            {Math.min(data.currentPage * data.limit, data.total)} of{' '}
            {data.total} results
          </span>
        </div>
      )}
    </div>
  )
}