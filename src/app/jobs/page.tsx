'use client'

import { Suspense, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import JobsList from '@/components/jobs/jobs-list'
import JobsFilter from '@/components/jobs/jobs-filter'

function JobsPageContent() {
  const searchParams = useSearchParams()
  const refetchJobsRef = useRef<(() => void) | null>(null)
  
  // Convert URLSearchParams to the format expected by useJobs with null safety
  const queryParams = {
    postDate: searchParams?.get('postDate') || undefined,
    easyApply: (searchParams?.get('easyApply') as 'yes' | 'no' | 'pending') || undefined,
    approvedByFormula: (searchParams?.get('approvedByFormula') as 'yes' | 'no' | 'pending') || undefined,
    approvedByGPT: (searchParams?.get('approvedByGPT') as 'yes' | 'no' | 'pending') || undefined,
    jobDescriptions: searchParams?.get('jobDescriptions') === 'true' ? true : undefined,
    page: searchParams?.get('page') ? parseInt(searchParams.get('page')!) : undefined,
    limit: searchParams?.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
  }

  // Remove undefined values
  const cleanParams = Object.fromEntries(
    Object.entries(queryParams).filter(([_, value]) => value !== undefined)
  )

  const handleSearch = useCallback(() => {
    // Trigger refetch of jobs with current parameters
    if (refetchJobsRef.current) {
      refetchJobsRef.current()
    }
  }, [])

  const handleRefetchCallback = useCallback((refetchFn: () => void) => {
    refetchJobsRef.current = refetchFn
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs</h1>
        <p className="text-gray-600">Find and filter through available job opportunities</p>
      </div>
      
      <JobsFilter onSearch={handleSearch} />
      <JobsList 
        params={cleanParams} 
        onRefetch={handleRefetchCallback}
      />
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  )
}