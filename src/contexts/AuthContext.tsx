'use client'

interface Props {
  children: React.ReactNode
}

export default function AuthContext({ children }: Props) {
  return <>{children}</>
}
