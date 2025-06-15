import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Page Not Found</h2>
      <p>Could not find requested resource</p>
      <Link
        href="/"
        className="text-blue-500 hover:text-blue-700 underline"
      >
        Return Home
      </Link>
    </div>
  )
} 