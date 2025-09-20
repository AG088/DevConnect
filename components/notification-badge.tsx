"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"

export function NotificationBadge() {
  const { data: session } = useSession()
  const [pendingRequests, setPendingRequests] = useState(0)

  useEffect(() => {
    if (session?.user?.id) {
      fetchPendingRequests()
    }
  }, [session])

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch("/api/follow?type=pending")
      if (response.ok) {
        const data = await response.json()
        setPendingRequests(data.follows?.length || 0)
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    }
  }

  if (!session || pendingRequests === 0) {
    return null
  }

  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
    >
      {pendingRequests > 9 ? "9+" : pendingRequests}
    </Badge>
  )
} 