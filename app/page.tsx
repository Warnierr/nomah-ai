import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { SignOutButton } from '../components/auth/sign-out-button'

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome {session.user?.name}</h1>
        <p className="mt-2 text-gray-600">{session.user?.email}</p>
        {session.user?.role && (
          <p className="mt-1 text-sm text-gray-500">Role: {session.user.role}</p>
        )}
        
        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </div>
  )
} 