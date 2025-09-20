"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, UserPlus, UserCheck, UserX, MessageSquare } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  image?: string
  title?: string
  githubUsername?: string
  followersCount: number
  followingCount: number
  projectsCount: number
}

interface FollowRelationship {
  _id: string
  follower: User
  following: User
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

export default function NetworkPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [followers, setFollowers] = useState<FollowRelationship[]>([])
  const [following, setFollowing] = useState<FollowRelationship[]>([])
  const [pendingRequests, setPendingRequests] = useState<FollowRelationship[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchNetworkData()
    }
  }, [session])

  const fetchNetworkData = async () => {
    try {
      setLoading(true)
      
      // Fetch all users
      const usersResponse = await fetch("/api/users")
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.filter((user: User) => user.id !== session?.user?.id))
      }

      // Fetch follow relationships
      const [followersResponse, followingResponse, pendingResponse] = await Promise.all([
        fetch("/api/follow?type=followers"),
        fetch("/api/follow?type=following"),
        fetch("/api/follow?type=pending")
      ])

      if (followersResponse.ok) {
        const followersData = await followersResponse.json()
        setFollowers(followersData.follows || [])
      }

      if (followingResponse.ok) {
        const followingData = await followingResponse.json()
        setFollowing(followingData.follows || [])
      }

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        setPendingRequests(pendingData.follows || [])
      }
    } catch (error) {
      console.error("Error fetching network data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (userId: string) => {
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId })
      })

      if (response.ok) {
        fetchNetworkData()
      } else {
        const errorData = await response.json()
        console.error("Follow error:", errorData.error)
      }
    } catch (error) {
      console.error("Error following user:", error)
    }
  }

  const handleUnfollow = async (followId: string) => {
    try {
      const response = await fetch(`/api/follow/${followId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'unfollow' })
      })

      if (response.ok) {
        fetchNetworkData()
      }
    } catch (error) {
      console.error("Error unfollowing user:", error)
    }
  }

  const handleFollowRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/follow/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        fetchNetworkData()
      }
    } catch (error) {
      console.error("Error handling follow request:", error)
    }
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.githubUsername?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!session) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">My Network</h1>
          <p className="text-muted-foreground mb-6">Sign in to view your network</p>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Network</h1>
        <p className="text-muted-foreground">Connect with other developers and grow your network</p>
      </div>

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList>
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Followers ({followers.length})
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Following ({following.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Badge variant="secondary">{pendingRequests.length}</Badge>
            Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search developers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user) => {
                const followRelationship = following.find(f => f.following.id === user.id)
                const isFollowing = !!followRelationship
                const isFollower = followers.some(f => f.follower.id === user.id)
                
                return (
                  <Card key={user.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.image} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold truncate">{user.name}</h3>
                              <p className="text-sm text-muted-foreground">{user.title}</p>
                            </div>
                            <div className="flex gap-2">
                              {isFollowing ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUnfollow(followRelationship!.id)}
                                >
                                  Unfollow
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleFollow(user.id)}
                                >
                                  Follow
                                </Button>
                              )}
                              {isFollower && (
                                <Link href={`/messages/${user.id}`}>
                                  <Button size="sm" variant="ghost">
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{user.followersCount} followers</span>
                            <span>{user.projectsCount} projects</span>
                          </div>
                          {user.githubUsername && (
                            <p className="text-sm text-muted-foreground mt-1">
                              @{user.githubUsername}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="followers" className="space-y-4">
          {followers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No followers yet. Start sharing your work to get noticed!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {followers.map((follow) => (
                <Card key={follow._id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={follow.follower.image} />
                        <AvatarFallback>{follow.follower.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold truncate">{follow.follower.name}</h3>
                            <p className="text-sm text-muted-foreground">{follow.follower.title}</p>
                          </div>
                          <Link href={`/messages/${follow.follower.id}`}>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </Link>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{follow.follower.followersCount} followers</span>
                          <span>{follow.follower.projectsCount} projects</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="following" className="space-y-4">
          {following.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You're not following anyone yet. Discover developers to follow!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {following.map((follow) => (
                <Card key={follow._id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={follow.following.image} />
                        <AvatarFallback>{follow.following.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold truncate">{follow.following.name}</h3>
                            <p className="text-sm text-muted-foreground">{follow.following.title}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUnfollow(follow._id)}
                            >
                              Unfollow
                            </Button>
                            <Link href={`/messages/${follow.following.id}`}>
                              <Button size="sm" variant="ghost">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{follow.following.followersCount} followers</span>
                          <span>{follow.following.projectsCount} projects</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending follow requests
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request._id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.follower.image} />
                          <AvatarFallback>{request.follower.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{request.follower.name}</h3>
                          <p className="text-sm text-muted-foreground">{request.follower.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleFollowRequest(request._id, 'accept')}
                        >
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleFollowRequest(request._id, 'reject')}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 