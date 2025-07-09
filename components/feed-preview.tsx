"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface Post {
  id: string
  content: string
  createdAt: string
  likes: number
  comments: number
  author: {
    id: string
    name: string
    image: string
    title: string
  }
}

export function FeedPreview() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/posts")
      
      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }
      
      const data = await response.json()
      setPosts(data)
    } catch (err) {
      setError("Failed to load posts")
      console.error("Error fetching posts:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!session) return

    // Store the new liked status to avoid race conditions
    const newLiked = !likedPosts[postId]

    // Optimistic update
    setLikedPosts(prev => ({
      ...prev,
      [postId]: newLiked
    }))

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + (newLiked ? 1 : -1) }
        : post
    ))

    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
    } catch (err) {
      // Revert optimistic update on error
      setLikedPosts(prev => ({ ...prev, [postId]: !newLiked }))
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes - (newLiked ? 1 : -1) }
          : post
      ))
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-start gap-4 p-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchPosts} className="mt-4">Try Again</Button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No posts yet. Be the first to share something!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader className="flex flex-row items-start gap-4 p-4">
            <Avatar>
              <AvatarImage src={post.author.image || "/placeholder.svg?height=40&width=40"} alt={post.author.name} />
              <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{post.author.name}</div>
              <div className="text-sm text-muted-foreground">{post.author.title || "Developer"}</div>
              <div className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p>{post.content}</p>
          </CardContent>
          <CardFooter className="border-t p-2 flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1" 
              onClick={() => handleLike(post.id)}
              disabled={!session}
            >
              <ThumbsUp className={`h-4 w-4 ${likedPosts[post.id] ? "fill-primary text-primary" : ""}`} />
              <span>{post.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments}</span>
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

