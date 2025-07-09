'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">DevConnect</span>
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          {session?.user ? (
            <>
              <span>{session.user.name || session.user.email}</span>
              <button onClick={() => signOut()}>Log out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button>Log in</button>
              </Link>
              <Link href="/auth/register">
                <button>Sign up</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 