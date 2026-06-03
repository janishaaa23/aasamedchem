import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/login')
  }

  if (session.user.role === 'admin') {
    redirect('/admin')
  } else if (session.user.role === 'seller') {
    redirect('/seller')
  } else {
    redirect('/buyer')
  }
}
