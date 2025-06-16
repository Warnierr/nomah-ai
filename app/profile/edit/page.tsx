import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { EditProfileForm } from '@/components/profile/edit-profile-form'

export default async function EditProfilePage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your personal information and preferences
          </p>
        </div>
        <EditProfileForm user={session.user} />
      </div>
    </div>
  )
} 