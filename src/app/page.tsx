import DashboardPage from './dashboard.page';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { IntroPage } from './intro.page';

export default async function MainPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <IntroPage />;
  }

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  if (!user || !user.isRegistered) {
    return <IntroPage />;
  }

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
