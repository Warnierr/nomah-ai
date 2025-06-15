import { SignInForm } from '../../../components/auth/signin-form'

export const dynamic = 'force-dynamic'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm />
    </div>
  )
} 