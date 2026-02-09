const JobsListSkeleton = () => {
  return (
    <div className="bg-congress-blue-900 rounded-[calc(2rem+1rem)] p-4">
      <div className="space-y-4 w-full bg-background rounded-4xl px-6 py-4">
        {/* Skeleton filter bar */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-congress-blue-200 rounded animate-pulse" />
          <div className="h-8 w-24 bg-congress-blue-200 rounded animate-pulse" />
        </div>

        <div className="flex lg:flex-row lg:space-x-3 lg:max-h-[80dvh] w-full">
          {/* Skeleton job cards */}
          <div className="flex-1 min-w-0 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border-2 border-congress-blue-200 bg-congress-blue-200 rounded-2xl p-3 animate-pulse"
              >
                <div className="flex flex-col gap-3">
                  {/* Title */}
                  <div className="h-5 w-3/4 bg-congress-blue-300 rounded" />
                  {/* Meta row */}
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-28 bg-congress-blue-300 rounded" />
                    <div className="h-4 w-20 bg-congress-blue-300 rounded hidden lg:block" />
                  </div>
                  {/* Date row */}
                  <div className="h-3 w-48 bg-congress-blue-300 rounded" />
                  {/* Buttons row */}
                  <div className="flex gap-2 sm:justify-end">
                    <div className="h-8 w-24 bg-congress-blue-300 rounded" />
                    <div className="h-8 w-28 bg-congress-blue-300 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton description panel */}
          <div className="hidden lg:block p-4 border border-congress-blue-300 bg-congress-blue-300 rounded-2xl lg:w-[40%] lg:min-w-[430px] lg:max-w-[640px] lg:max-h-[80dvh] animate-pulse">
            <div className="h-6 w-40 bg-congress-blue-200 rounded mx-auto mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 bg-congress-blue-200 rounded"
                  style={{ width: `${60 + ((i * 17) % 40)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsListSkeleton;
