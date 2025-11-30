import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { memberPostSchema } from './schema'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const parse = memberPostSchema.safeParse(body)

  if (!parse.success) {
    return NextResponse.json({ error: parse.error }, { status: 400 })
  }

  const { data } = parse

  // Better Auth + Prisma 어댑터가 이미 유저를 생성하므로,
  // 추가 프로필 정보만 업데이트합니다.
  const user = await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      name: data.name,
      birthDate: new Date(data.birthDate),
      gender: data.gender,
      height: data.height,
      weight: data.weight,
    },
  })

  return NextResponse.json(user)
}
