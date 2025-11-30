import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginPageLayout from './page.layout';
import prisma from '@/lib/prisma';

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isRegistered: true },
    });

    // 가입 미완료 상태면 회원가입 페이지로
    if (!user || !user.isRegistered) {
      return redirect('/register');
    }

    // 가입 완료 상태면 메인 페이지로
    return redirect('/');
  }

  return <LoginPageLayout />;
}
