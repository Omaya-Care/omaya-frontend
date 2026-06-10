// Fallback shown while the lazy-loaded Scalar API reference chunk downloads.
// Kept in its own tiny module so it does NOT pull the heavy Docs chunk eagerly.
export default function DocsLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
      Loading API documentation…
    </div>
  );
}
