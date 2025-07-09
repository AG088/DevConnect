"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare, ThumbsUp, Share2, Code, Search, Bell, Loader2 } from "lucide-react"
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
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [retryDisabled, setRetryDisabled] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [likingPostId, setLikingPostId] = useState<string | null>(null)

  const POSTS_PER_PAGE = 10

  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true)
      setFetchError(null)
      const res = await fetch(`/api/posts?page=${pageNum}&limit=${POSTS_PER_PAGE}`)
      if (res.ok) {
        const data = await res.json()
        if (append) {
          setPosts(prev => [...prev, ...data])
        } else {
          setPosts(data)
        }
        setHasMore(data.length === POSTS_PER_PAGE)
      } else {
        setFetchError("Failed to fetch posts. Please try again.")
        setHasMore(false)
        console.error("Failed to fetch posts:", res.status)
      }
    } catch (error) {
      setFetchError("Failed to load posts. Please try again.")
      setHasMore(false)
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(1)
  }, [toast])

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
      } else {
        const error = await res.json()
        throw new Error(error.error || "Failed to create post")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      })
      return
    }

    // Store the current post to revert on error
    const currentPost = posts.find(post => post.id === postId)
    if (!currentPost) return

    const newLiked = !currentPost.liked

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          liked: newLiked,
          likes: post.likes + (newLiked ? 1 : -1),
        }
      }
      return post
    })

    setPosts(updatedPosts)
    setLikingPostId(postId)

    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Error liking post:", error)
      // Revert on error using the stored current post
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...currentPost }
          : post
      ))
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLikingPostId(null)
    }
  }

  const handleRetry = () => {
    setRetryDisabled(true)
    fetchPosts(page)
    setTimeout(() => setRetryDisabled(false), 2000)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage, true)
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

  // Show loading state while session is being determined
  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 md:gap-10">
              <Link href="/" className="flex items-center gap-2">
                <Code className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold hidden md:inline-block">DevConnect</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>
        <div className="container flex-1 items-center justify-center py-6">
          <div className="text-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 md:gap-10">
              <Link href="/" className="flex items-center gap-2">
                <Code className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold hidden md:inline-block">DevConnect</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          </div>
        </header>
        <div className="container flex-1 items-center justify-center py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to DevConnect</h1>
            <p className="text-muted-foreground mb-6">Sign in to see the latest posts from the developer community</p>
            <Link href="/auth/login">
              <Button>Sign In to Continue</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
                  <AvatarImage src={(session.user as any)?.image || "/placeholder.svg?height=40&width=40"} alt={session.user?.name || "User"} />
                  <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
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

            {loading ? (
                fetchError ? (
                  <div className="space-y-4 text-center">
                    <p className="text-red-500 mb-4">{fetchError}</p>
                    <Button onClick={handleRetry} disabled={retryDisabled}>Retry</Button>
                  </div>
                ) : (
                  <div className="flex justify-center items-center min-h-[200px]">
                    <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                  </div>
                )
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No posts yet. Be the first to share something!</p>
                  <p className="text-sm text-muted-foreground">Create a post above to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {posts.map((post) => (
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
                        <div className="text-sm text-muted-foreground">{post.author.title || "Developer"}</div>
                        <div className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p>{post.content}</p>
                    </CardContent>
                    <CardFooter className="border-t p-2 flex justify-between">
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleLike(post.id)}
                        disabled={likingPostId === post.id}>
                        {likingPostId === post.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ThumbsUp className={`h-4 w-4 ${post.liked ? "fill-primary text-primary" : ""}`} />
                        )}
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
                {hasMore && (
                  <div className="flex justify-center mt-4">
                    <Button onClick={handleLoadMore} disabled={loading}>Load More</Button>
                  </div>
                )}
              </>
            )}
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

