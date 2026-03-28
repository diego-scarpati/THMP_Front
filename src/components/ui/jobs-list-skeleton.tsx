const JobsListSkeleton = () => {
  return (
    <div className="space-y-3 w-full">
      {/* Skeleton filter bar */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
        <div className="h-8 w-24 bg-neutral-200 rounded animate-pulse" />
      </div>

      <div className="flex lg:flex-row lg:space-x-3 lg:max-h-[80dvh] w-full">
        {/* Skeleton job cards */}
        <div className="flex-1 min-w-0 space-y-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="border border-neutral-200 bg-white rounded-xl p-3 sm:p-4 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="flex flex-col gap-4">
                  {/* Title */}
                  <div className="h-5 w-3/4 bg-neutral-200 rounded" />
                  {/* Meta row */}
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-28 bg-neutral-200 rounded" />
                    <div className="h-4 w-20 bg-neutral-200 rounded hidden lg:block" />
                  </div>
                  {/* Date row */}
                  <div className="h-3 w-48 bg-neutral-200 rounded" />
                </div>
                {/* Buttons row */}
                <div className="flex flex-col gap-2 sm:justify-end content-center">
                  <div className="h-8 w-24 bg-neutral-200 rounded" />
                  <div className="h-8 w-24 bg-neutral-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton description panel */}
        <div className="hidden lg:block border border-neutral-200 bg-white rounded-xl p-4 lg:w-[40%] lg:min-w-[430px] lg:max-h-[80dvh] animate-pulse">
          <div className="h-6 w-40 bg-neutral-200 rounded mx-auto mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-3 bg-neutral-200 rounded"
                style={{ width: `${60 + ((i * 17) % 40)}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsListSkeleton;
