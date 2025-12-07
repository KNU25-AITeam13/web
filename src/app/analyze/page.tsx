import AnalyzePageLayout from './page.layout';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // proxy.ts가 인증 및 가입완료를 처리하므로 여기서는 세션과 유저가 항상 존재
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  const { mealId } = await searchParams;

  if (!mealId) {
    return <div>mealId가 필요합니다.</div>;
  }

  const meal = await prisma.meal.findUnique({
    where: { mealId: mealId as string, userId: user!.id },
  });

  if (!meal) {
    return <div>meal을 찾을 수 없습니다.</div>;
  }

  const mealItems = await prisma.mealItem.findMany({
    where: { mealId: mealId as string },
  });

  return (
    <AnalyzePageLayout
      mealId={mealId as string}
      meal={meal}
      mealItems={mealItems}
    />
  );
}
