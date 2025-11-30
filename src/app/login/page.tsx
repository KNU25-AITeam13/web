import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import LoginPageLayout from './page.layout'
import prisma from '@/lib/prisma'

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session?.user) {
    let user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!user) {
      return redirect('/register')
    }

    return redirect('/')
  }

  return <LoginPageLayout />
}
