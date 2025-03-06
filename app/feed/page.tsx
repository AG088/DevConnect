"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare, ThumbsUp, Share2, Code, Search, Bell } from "lucide-react"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"

type Post = {
  id: string
  content: string
  author: {
    id: string
    name: string
    image?: string
    title?: string
  }
  likes: number
  comments: number
  createdAt: string
  liked?: boolean
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts")
        if (res.ok) {
          const data = await res.json()
          setPosts(data)
        }
      } catch (error) {
        console.error("Error fetching posts:", error)
      }
    }

    fetchPosts()
  }, [])

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newPost }),
      })

      if (res.ok) {
        const post = await res.json()
        setPosts((prev) => [post, ...prev])
        setNewPost("")
        toast({
          title: "Post created",
          description: "Your post has been published to your network",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const liked = !post.liked
        return {
          ...post,
          liked,
          likes: post.likes + (liked ? 1 : -1),
        }
      }
      return post
    })

    setPosts(updatedPosts)

    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Error liking post:", error)
      // Revert on error
      setPosts(posts)
    }
  }

  // Mock data for demonstration
  const mockPosts: Post[] = [
    {
      id: "1",
      content:
        "Just launched a new open-source library for handling complex state management in React. Check it out on GitHub! #React #OpenSource",
      author: {
        id: "user1",
        name: "Sarah Chen",
        title: "Senior Frontend Developer at TechCorp",
        image: "/placeholder.svg?height=40&width=40",
      },
      likes: 24,
      comments: 8,
      createdAt: "2 hours ago",
    },
    {
      id: "2",
      content:
        "Looking for feedback on my new API design. Anyone interested in doing a code review? #Backend #API #CodeReview",
      author: {
        id: "user2",
        name: "Alex Rodriguez",
        title: "Backend Developer at DataSystems",
        image: "/placeholder.svg?height=40&width=40",
      },
      likes: 8,
      comments: 3,
      createdAt: "5 hours ago",
    },
    {
      id: "3",
      content:
        "Just completed the Advanced TypeScript certification! The generics section was challenging but worth it. #TypeScript #Learning",
      author: {
        id: "user3",
        name: "Jamie Wilson",
        title: "Full Stack Developer",
        image: "/placeholder.svg?height=40&width=40",
      },
      likes: 42,
      comments: 5,
      createdAt: "1 day ago",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-10">
            <Link href="/" className="flex items-center gap-2">
              <Code className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold hidden md:inline-block">DevConnect</span>
            </Link>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-full bg-muted pl-8 md:w-[300px] lg:w-[400px]"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            <UserNav />
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr_300px] md:gap-6 lg:gap-10 py-6">
        <aside className="fixed top-20 z-30 -ml-2 hidden h-[calc(100vh-5rem)] w-full shrink-0 md:sticky md:block">
          <MainNav />
        </aside>
        <main className="relative mx-auto w-full min-w-0 max-w-2xl lg:max-w-none">
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar>
                  <AvatarImage src={user?.image || "/placeholder.svg?height=40&width=40"} alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="font-semibold">What's on your mind?</div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <form onSubmit={handleCreatePost}>
                  <Textarea
                    placeholder="Share an update, link or code snippet..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="mb-2 min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading || !newPost.trim()}>
                      {isLoading ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {(posts.length > 0 ? posts : mockPosts).map((post) => (
              <Card key={post.id}>
                <CardHeader className="flex flex-row items-start gap-4 p-4">
                  <Avatar>
                    <AvatarImage
                      src={post.author.image || "/placeholder.svg?height=40&width=40"}
                      alt={post.author.name}
                    />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{post.author.name}</div>
                    <div className="text-sm text-muted-foreground">{post.author.title}</div>
                    <div className="text-xs text-muted-foreground">{post.createdAt}</div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p>{post.content}</p>
                </CardContent>
                <CardFooter className="border-t p-2 flex justify-between">
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleLike(post.id)}>
                    <ThumbsUp className={`h-4 w-4 ${post.liked ? "fill-primary text-primary" : ""}`} />
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
        </main>
        <aside className="fixed top-20 z-30 hidden w-[300px] shrink-0 lg:sticky lg:block">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Trending Topics</h3>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div>
                  <div className="font-medium">#TypeScript</div>
                  <div className="text-sm text-muted-foreground">1,245 posts</div>
                </div>
                <div>
                  <div className="font-medium">#React</div>
                  <div className="text-sm text-muted-foreground">982 posts</div>
                </div>
                <div>
                  <div className="font-medium">#WebDev</div>
                  <div className="text-sm text-muted-foreground">879 posts</div>
                </div>
                <div>
                  <div className="font-medium">#AI</div>
                  <div className="text-sm text-muted-foreground">654 posts</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">People to Follow</h3>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${i}`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">Developer {i}</div>
                      <div className="text-xs text-muted-foreground">Senior Engineer at Tech Co.</div>
                    </div>
                    <Button size="sm" variant="outline">
                      Follow
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}

