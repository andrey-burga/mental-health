function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse space-y-4 w-full max-w-xl px-6">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  );
}

export default PageLoader;
