import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, User, Shield } from 'lucide-react'

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>View and manage your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Name</p>
              <p className="text-sm text-muted-foreground">{session.user?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Mail className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Email</p>
              <p className="text-sm text-muted-foreground">{session.user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Shield className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Role</p>
              <p className="text-sm text-muted-foreground">{session.user?.role}</p>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 