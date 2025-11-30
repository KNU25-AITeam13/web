import UserGuard from '@/components/common/UserGuard'
import AnalyzePageLayout from './page.layout'

import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return <div>로그인이 필요합니다.</div>
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return <div>사용자를 찾을 수 없습니다.</div>
  }

  const { mealId } = searchParams

  if (!mealId) {
    return <div>mealId가 필요합니다.</div>
  }

  const meal = await prisma.meal.findUnique({
    where: { mealId: mealId as string, userId: user.id },
  })

  if (!meal) {
    return <div>meal을 찾을 수 없습니다.</div>
  }

  const mealItems = await prisma.mealItem.findMany({
    where: { mealId: mealId as string },
  })

  return (
    <AnalyzePageLayout
      mealId={mealId as string}
      meal={meal}
      mealItems={mealItems}
    />
  )
}
