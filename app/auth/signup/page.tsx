import { SignUpForm } from '@/components/auth/signup-form'

export const dynamic = 'force-dynamic'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUpForm />
    </div>
  )
} 