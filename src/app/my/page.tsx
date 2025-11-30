import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import MyPageLayout from './page.layout'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function MyPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  })

  if (!user) {
    return redirect('/login')
  }

  const meals = await prisma.meal.findMany({
    where: {
      userId: user.id,
    },
    include: {
      mealItems: true,
    },
  })

  return <MyPageLayout session={session} user={user} meals={meals} />
}
