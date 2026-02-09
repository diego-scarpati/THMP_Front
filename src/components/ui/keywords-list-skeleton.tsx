const KeywordsListSkeleton = () => {
  return (
    <div className="flex flex-wrap gap-3 mb-2 mt-3 p-1 rounded-lg items-center px-4">
      <div className="h-5 w-32 bg-congress-blue-200 rounded animate-pulse" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-7 bg-congress-blue-200 rounded-full animate-pulse"
          style={{ width: `${50 + ((i * 13) % 50)}px` }}
        />
      ))}
    </div>
  );
};

export default KeywordsListSkeleton;
