const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">
          🍽️
        </div>
      </div>
      <p className="mt-4 text-gray-600 font-medium text-lg animate-pulse">
        Finding perfect matches for you...
      </p>
    </div>
  );
};
export default LoadingSpinner;