import DashboardPage from './dashboard.page';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function MainPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // proxy.ts가 인증 및 가입완료를 처리하므로 여기서는 세션과 유저가 항상 존재
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  const meals = await prisma.meal.findMany({
    where: { userId: user!.id },
    include: {
      mealItems: {
        include: {
          mealItemAnalysis: true,
        },
      },
    },
  });

  return <DashboardPage session={session!} user={user!} meals={meals} />;
}
