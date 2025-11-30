import { IntroPage } from './intro.page'
import DashboardPage from './dashboard.page'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function MainPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  console.log(session?.user?.image)

  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) return <IntroPage />

    const meals = await prisma.meal.findMany({
      where: { userId: user.id },
      include: {
        mealItems: {
          include: {
            mealItemAnalysis: true,
          },
        },
      },
    })

    return <DashboardPage session={session} user={user} meals={meals} />
  }

  return <IntroPage />
}
