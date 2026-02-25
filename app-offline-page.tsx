export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-3xl font-bold mb-4">You're Offline</h1>
        <p className="text-gray-600 mb-6">
          No internet connection detected. Some features may be limited.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="mb-2">
            Don't worry! You can still:
          </p>
          <ul className="text-left space-y-1">
            <li>• View cached content</li>
            <li>• Draft new reports</li>
            <li>• Take photos</li>
          </ul>
          <p className="mt-3">
            Your report will be automatically submitted when you're back online.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
