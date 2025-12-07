import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mealId = searchParams.get('mealId');

  if (!mealId) {
    return NextResponse.json({ error: 'mealId is required' }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // 권한 확인
  const meal = await prisma.meal.findUnique({
    where: { mealId, userId: user.id },
  });

  if (!meal) {
    return NextResponse.json(
      { error: 'Meal not found or unauthorized' },
      { status: 404 }
    );
  }

  // Meal 삭제 (cascade로 관련 MealItem, MealItemAnalysis도 삭제됨)
  await prisma.meal.delete({
    where: { mealId },
  });

  return NextResponse.json({ message: 'Meal deleted successfully' });
}
