export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center justify-center w-full min-h-[200px]">
          <div className="relative size-10">
            <div className="absolute top-0 size-10 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute top-0 size-10 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
