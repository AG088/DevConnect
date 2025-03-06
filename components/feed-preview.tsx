"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react"
import { useState } from "react"

export function FeedPreview() {
  const [likes, setLikes] = useState({
    post1: 24,
    post2: 8,
  })

  const [liked, setLiked] = useState({
    post1: false,
    post2: false,
  })

  const handleLike = (postId: string) => {
    setLiked((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))

    setLikes((prev) => ({
      ...prev,
      [postId]: prev[postId] + (liked[postId as keyof typeof liked] ? -1 : 1),
    }))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start gap-4 p-4">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Sarah Chen" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">Sarah Chen</div>
            <div className="text-sm text-muted-foreground">Senior Frontend Developer at TechCorp</div>
            <div className="text-xs text-muted-foreground">2 hours ago</div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p>
            Just released a new React hooks library for handling complex form state. Check it out on GitHub! #React
            #OpenSource
          </p>
        </CardContent>
        <CardFooter className="border-t p-2 flex justify-between">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleLike("post1")}>
            <ThumbsUp className={`h-4 w-4 ${liked.post1 ? "fill-primary text-primary" : ""}`} />
            <span>{likes.post1}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>8</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start gap-4 p-4">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Alex Rodriguez" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">Alex Rodriguez</div>
            <div className="text-sm text-muted-foreground">Backend Developer at DataSystems</div>
            <div className="text-xs text-muted-foreground">5 hours ago</div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p>
            Looking for feedback on my new API design. Anyone interested in doing a code review? #Backend #API
            #CodeReview
          </p>
        </CardContent>
        <CardFooter className="border-t p-2 flex justify-between">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleLike("post2")}>
            <ThumbsUp className={`h-4 w-4 ${liked.post2 ? "fill-primary text-primary" : ""}`} />
            <span>{likes.post2}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>3</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

