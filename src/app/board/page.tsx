import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import BoardPageLayout from './page.layout'
import { storage } from '@/lib/firebaseClient'
import { getDownloadURL, ref } from 'firebase/storage'

export default async function BoardPage() {
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
      isPublic: true,
    },
    include: {
      mealItems: true,
      user: true,
    },
    orderBy: {
      date: 'desc',
    },
  })

  const imageUrls: Record<string, string> = {}

  for (const meal of meals) {
    const mealImageRef = ref(storage, `images/${meal.mealItems[0].imageName}`)
    const mealImageUrl = await getDownloadURL(mealImageRef)
    imageUrls[meal.mealId] = mealImageUrl
  }

  return <BoardPageLayout meals={meals} imageUrls={imageUrls} />
}
