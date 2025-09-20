"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Code, Home, Users, Briefcase, MessageSquare, Bell, Settings, HelpCircle } from "lucide-react"
import { NotificationBadge } from "@/components/notification-badge"

export function MainNav() {
  const pathname = usePathname()

  return (
    <ScrollArea className="h-full py-2">
      <div className="space-y-1 px-2">
        <Link href="/feed">
          <Button
            variant={pathname === "/feed" ? "secondary" : "ghost"}
            size="lg"
            className="w-full justify-start gap-2"
          >
            <Home className="h-5 w-5" />
            Home
          </Button>
        </Link>
        <Link href="/network">
          <Button
            variant={pathname === "/network" ? "secondary" : "ghost"}
            size="lg"
            className="w-full justify-start gap-2 relative"
          >
            <Users className="h-5 w-5" />
            My Network
            <NotificationBadge />
          </Button>
        </Link>
        <Link href="/projects">
          <Button
            variant={pathname === "/projects" ? "secondary" : "ghost"}
            size="lg"
            className="w-full justify-start gap-2"
          >
            <Code className="h-5 w-5" />
            Projects
          </Button>
        </Link>
        <Link href="/jobs">
          <Button
            variant={pathname === "/jobs" ? "secondary" : "ghost"}
            size="lg"
            className="w-full justify-start gap-2"
          >
            <Briefcase className="h-5 w-5" />
            Jobs
          </Button>
        </Link>
        <Link href="/messages">
          <Button
            variant={pathname === "/messages" ? "secondary" : "ghost"}
            size="lg"
            className="w-full justify-start gap-2"
          >
            <MessageSquare className="h-5 w-5" />
            Messaging
          </Button>
        </Link>
        <Link href="/notifications">
          <Button
            variant={pathname === "/notifications" ? "secondary" : "ghost"}
            size="lg"
            className="w-full justify-start gap-2"
          >
            <Bell className="h-5 w-5" />
            Notifications
          </Button>
        </Link>
      </div>
      <div className="mt-6 space-y-1 px-2">
        <div className="px-3 text-xs font-semibold text-muted-foreground">Support</div>
        <Link href="/settings">
          <Button
            variant={pathname === "/settings" ? "secondary" : "ghost"}
            size="lg"
            className="w-full justify-start gap-2"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Button>
        </Link>
        <Link href="/help">
          <Button
            variant={pathname === "/help" ? "secondary" : "ghost"}
            size="lg"
            className="w-full justify-start gap-2"
          >
            <HelpCircle className="h-5 w-5" />
            Help Center
          </Button>
        </Link>
      </div>
    </ScrollArea>
  )
}

