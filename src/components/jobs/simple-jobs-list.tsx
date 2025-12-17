'use client'

import { useJobs } from '@/hooks'
import type { Job } from '@/types/api'

export default function SimpleJobsList() {
  const { data, isLoading, error, isError } = useJobs()

  if (isLoading) return <div>Loading jobs...</div>
  if (isError) return <div>Error: {error?.message}</div>
  if (!data?.jobs) return <div>No jobs found</div>

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Jobs List</h2>
      <div className="space-y-4">
        {data.jobs.map((job: Job) => (
          <div key={job.id} className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-gray-600">{job.company}</p>
            {job.location && <p className="text-sm text-gray-500">{job.location}</p>}
            {job.url && (
              <a 
                href={job.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View Job →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}