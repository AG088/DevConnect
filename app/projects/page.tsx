"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, ExternalLink, Github, Plus, Star } from "lucide-react"
import { useSession } from "next-auth/react"

type Project = {
  id: string
  name: string
  description: string
  language: string
  technologies: string[]
  visibility: string
  isGithub?: boolean
  repoUrl?: string
  createdAt: string
  owner: {
    id: string
    name: string
  }
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { data: session } = useSession()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/projects")
      
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }
      
      const data = await response.json()
      // The API returns { projects, total, page, totalPages }
      // We need to extract the projects array
      setProjects(data.projects || [])
    } catch (err) {
      setError("Failed to load projects")
      console.error("Error fetching projects:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = (projects || []).filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase())),
  )

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
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">Showcase your work and connect with GitHub repositories</p>
          </div>
          <Link href="/projects/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchProjects}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Showcase your work and connect with GitHub repositories</p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="github">GitHub Repos</TabsTrigger>
          <TabsTrigger value="custom">Custom Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {(filteredProjects || []).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No projects found.</p>
              <Link href="/projects/new">
                <Button>Create Your First Project</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} formatTimeAgo={formatTimeAgo} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="github" className="space-y-6">
          {(filteredProjects || []).filter((p) => p.isGithub).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No GitHub projects found.</p>
              <Link href="/projects/new">
                <Button>Add a GitHub Project</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects
                .filter((p) => p.isGithub)
                .map((project) => (
                  <ProjectCard key={project.id} project={project} formatTimeAgo={formatTimeAgo} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          {(filteredProjects || []).filter((p) => !p.isGithub).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No custom projects found.</p>
              <Link href="/projects/new">
                <Button>Add a Custom Project</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects
                .filter((p) => !p.isGithub)
                .map((project) => (
                  <ProjectCard key={project.id} project={project} formatTimeAgo={formatTimeAgo} />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProjectCard({ project, formatTimeAgo }: { project: Project; formatTimeAgo: (date: string) => string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {project.isGithub ? (
              <Github className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Code className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle className="text-xl">{project.name}</CardTitle>
          </div>
          {project.repoUrl && (
            <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span>{project.language}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {project.visibility}
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {project.technologies.slice(0, 3).map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                +{project.technologies.length - 3} more
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Created {formatTimeAgo(project.createdAt)}
        </div>
        <Link href={`/projects/${project.id}`}>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

