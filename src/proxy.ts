import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const config = {
  matcher: [
    '/my',
    '/board',
    '/board/:path*',
    '/meals/:path*',
    '/analyze',
    '/upload',
  ],
};

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // 세션이 없으면 로그인 페이지로 리다이렉트
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // DB에서 유저 조회하여 isRegistered 확인
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isRegistered: true },
  });

  // 유저가 없거나 가입 미완료 상태면 회원가입 페이지로 리다이렉트
  if (!user || !user.isRegistered) {
    return NextResponse.redirect(new URL('/register', request.url));
  }

  // 인증 및 가입 완료 상태면 요청 계속 진행
  return NextResponse.next();
}
