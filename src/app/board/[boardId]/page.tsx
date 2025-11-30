import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import BoardDetailPageLayout from './page.layout'
import prisma from '@/lib/prisma'
import { storage } from '@/lib/firebaseClient'
import { getDownloadURL, ref } from 'firebase/storage'

export default async function BoardDetailPage({
  params,
}: {
  params: { boardId: string }
}) {
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

  const meal = await prisma.meal.findUnique({
    where: {
      mealId: params.boardId,
      isPublic: true,
    },
    include: {
      mealItems: {
        include: {
          mealItemAnalysis: true,
        },
      },
    },
  })

  if (!meal) {
    return notFound()
  }

  const imageUrls = await Promise.all(
    meal.mealItems.map((mealItem) => {
      const mealImageRef = ref(storage, `images/${mealItem.imageName}`)
      return getDownloadURL(mealImageRef)
    })
  )

  return <BoardDetailPageLayout user={user} meal={meal} imageUrls={imageUrls} />
}
