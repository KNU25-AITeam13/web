import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import BoardPageLayout from './page.layout';
import { storage } from '@/lib/firebaseClient';
import { getDownloadURL, ref } from 'firebase/storage';

export default async function BoardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // proxy.ts가 인증 및 가입완료를 처리하므로 여기서는 세션과 유저가 항상 존재
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  const meals = await prisma.meal.findMany({
    where: {
      userId: user!.id,
      isPublic: true,
    },
    include: {
      mealItems: true,
      user: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  const imageUrls: Record<string, string> = {};

  for (const meal of meals) {
    const mealImageRef = ref(storage, `images/${meal.mealItems[0].imageName}`);
    const mealImageUrl = await getDownloadURL(mealImageRef);
    imageUrls[meal.mealId] = mealImageUrl;
  }

  return <BoardPageLayout meals={meals} imageUrls={imageUrls} />;
}
