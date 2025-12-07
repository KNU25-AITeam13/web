import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import MealPageLayout from './page.layout';
import { getImageUrl } from '@/lib/s3Client';

export default async function MealPage({
  params,
}: {
  params: Promise<{ mealDate: string }>;
}) {
  const { mealDate } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // proxy.ts가 인증 및 가입완료를 처리하므로 여기서는 세션과 유저가 항상 존재
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  const meals = await prisma.meal.findMany({
    where: { userId: user!.id, date: new Date(mealDate) },
    include: {
      mealItems: {
        include: {
          mealItemAnalysis: true,
        },
      },
    },
  });

  if (!meals.length) {
    return notFound();
  }

  const imageUrls: Record<string, string[]> = {};

  for (const meal of meals) {
    const mealImages = meal.mealItems.map((mealItem) => {
      return getImageUrl(mealItem.imageName);
    });

    imageUrls[meal.mealId] = mealImages;
  }

  return (
    <MealPageLayout
      user={user!}
      mealDate={mealDate}
      meals={meals}
      imageUrls={imageUrls}
    />
  );
}
