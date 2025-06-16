import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { NotificationSystem } from '@/components/admin/notification-system'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingBag, 
  BarChart3, 
  Settings,
  LogOut 
} from 'lucide-react'

const adminNavItems = [
  { 
    href: '/admin', 
    label: 'Dashboard', 
    icon: LayoutDashboard 
  },
  { 
    href: '/admin/products', 
    label: 'Products', 
    icon: Package 
  },
  { 
    href: '/admin/orders', 
    label: 'Orders', 
    icon: ShoppingBag 
  },
  { 
    href: '/admin/users', 
    label: 'Users', 
    icon: Users 
  },
  { 
    href: '/admin/analytics', 
    label: 'Analytics', 
    icon: BarChart3 
  },
  { 
    href: '/admin/settings', 
    label: 'Settings', 
    icon: Settings 
  },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
          <p className="text-sm text-gray-600">Welcome, {session.user?.name}</p>
        </div>
        
        <nav className="mt-6">
          {adminNavItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-6 left-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <LogOut className="h-4 w-4 mr-2" />
              Back to Site
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between p-6 bg-white border-b">
          <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
          <NotificationSystem />
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
} 