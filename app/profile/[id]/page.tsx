"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Github, 
  Calendar, 
  MapPin, 
  Mail, 
  Users, 
  UserPlus, 
  UserCheck, 
  Clock,
  Code,
  Star,
  GitFork
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface UserProfile {
  id: string
  name: string
  email: string
  image?: string
  title?: string
  githubUsername?: string
  githubAvatarUrl?: string
  createdAt: string
  followersCount: number
  followingCount: number
  projectsCount: number
}

interface Project {
  id: string
  name: string
  description: string
  language: string
  technologies: string[]
  isGithub: boolean
  repoUrl?: string
  githubStars?: number
  githubForks?: number
  createdAt: string
}

interface FollowStatus {
  isFollowing: boolean
  isFollowedBy: boolean
  followRequestStatus?: 'pending' | 'accepted' | 'rejected'
  followId?: string
}

export default function UserProfilePage() {
  const { data: session } = useSession()
  const params = useParams()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [followStatus, setFollowStatus] = useState<FollowStatus>({
    isFollowing: false,
    isFollowedBy: false
  })
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)

  const userId = params.id as string

  useEffect(() => {
    if (userId) {
      fetchProfile()
      fetchProjects()
      checkFollowStatus()
    }
  }, [userId])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch(`/api/projects?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const checkFollowStatus = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/follow/status?targetUserId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setFollowStatus(data)
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive",
      })
      return
    }

    setFollowLoading(true)
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId })
      })

      if (response.ok) {
        const data = await response.json()
        setFollowStatus(prev => ({
          ...prev,
          followRequestStatus: data.status,
          followId: data.followId
        }))
        
        toast({
          title: "Follow request sent",
          description: "Your follow request has been sent",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to send follow request",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error sending follow request:', error)
      toast({
        title: "Error",
        description: "Failed to send follow request",
        variant: "destructive",
      })
    } finally {
      setFollowLoading(false)
    }
  }

  const handleUnfollow = async () => {
    if (!followStatus.followId) return

    setFollowLoading(true)
    try {
      const response = await fetch(`/api/follow/${followStatus.followId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unfollow' })
      })

      if (response.ok) {
        setFollowStatus(prev => ({
          ...prev,
          isFollowing: false,
          followRequestStatus: undefined,
          followId: undefined
        }))
        
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this user",
        })
      }
    } catch (error) {
      console.error('Error unfollowing:', error)
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      })
    } finally {
      setFollowLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = session?.user?.id === userId

  return (
    <div className="container py-10">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.image || profile.githubAvatarUrl} />
              <AvatarFallback className="text-2xl">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <p className="text-xl text-muted-foreground">{profile.title}</p>
                </div>
                
                {!isOwnProfile && (
                  <div className="flex gap-2">
                    {followStatus.isFollowing ? (
                      <Button 
                        variant="outline" 
                        onClick={handleUnfollow}
                        disabled={followLoading}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
                      </Button>
                    ) : followStatus.followRequestStatus === 'pending' ? (
                      <Button variant="outline" disabled>
                        <Clock className="h-4 w-4 mr-2" />
                        Request Sent
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleFollow}
                        disabled={followLoading}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {profile.followersCount} followers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {profile.followingCount} following
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {profile.projectsCount} projects
                  </span>
                </div>
              </div>

              {profile.githubUsername && (
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    @{profile.githubUsername}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Joined {formatDate(profile.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile 
                    ? "Start by creating your first project!" 
                    : "This user hasn't shared any projects yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {project.isGithub ? (
                          <Github className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Code className="h-5 w-5 text-muted-foreground" />
                        )}
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <span>{project.language}</span>
                      </div>
                      {project.isGithub && project.githubStars !== undefined && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Star className="h-3 w-3" />
                          <span>{project.githubStars}</span>
                        </div>
                      )}
                      {project.isGithub && project.githubForks !== undefined && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <GitFork className="h-3 w-3" />
                          <span>{project.githubForks}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.technologies.slice(0, 3).map((tech, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.technologies.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="followers" className="space-y-6">
          <FollowersList userId={userId} />
        </TabsContent>

        <TabsContent value="following" className="space-y-6">
          <FollowingList userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Followers List Component
function FollowersList({ userId }: { userId: string }) {
  const [followers, setFollowers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFollowers()
  }, [userId])

  const fetchFollowers = async () => {
    try {
      const response = await fetch(`/api/follow?type=followers&userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setFollowers(data.follows || [])
      }
    } catch (error) {
      console.error('Error fetching followers:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading followers...</div>
  }

  return (
    <div className="grid gap-4">
      {followers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No followers yet</h3>
            <p className="text-muted-foreground">When people follow this user, they'll appear here.</p>
          </CardContent>
        </Card>
      ) : (
        followers.map((follow) => (
          <Card key={follow._id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={follow.follower.image} />
                  <AvatarFallback>
                    {follow.follower.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{follow.follower.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {follow.follower.title || "Developer"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

// Following List Component
function FollowingList({ userId }: { userId: string }) {
  const [following, setFollowing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFollowing()
  }, [userId])

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`/api/follow?type=following&userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setFollowing(data.follows || [])
      }
    } catch (error) {
      console.error('Error fetching following:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading following...</div>
  }

  return (
    <div className="grid gap-4">
      {following.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Not following anyone yet</h3>
            <p className="text-muted-foreground">When this user follows people, they'll appear here.</p>
          </CardContent>
        </Card>
      ) : (
        following.map((follow) => (
          <Card key={follow._id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={follow.following.image} />
                  <AvatarFallback>
                    {follow.following.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{follow.following.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {follow.following.title || "Developer"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
} 