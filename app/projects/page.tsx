"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, ExternalLink, Github, Plus, Star } from "lucide-react"

type Project = {
  id: string
  name: string
  description: string
  language: string
  stars: number
  forks: number
  lastUpdated: string
  isGithub?: boolean
  repoUrl?: string
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for demonstration
  const mockProjects: Project[] = [
    {
      id: "1",
      name: "react-state-manager",
      description: "A lightweight state management library for React applications",
      language: "TypeScript",
      stars: 245,
      forks: 32,
      lastUpdated: "2 days ago",
      isGithub: true,
      repoUrl: "https://github.com/username/react-state-manager",
    },
    {
      id: "2",
      name: "node-api-starter",
      description: "A starter template for building Node.js APIs with Express and MongoDB",
      language: "JavaScript",
      stars: 128,
      forks: 24,
      lastUpdated: "1 week ago",
      isGithub: true,
      repoUrl: "https://github.com/username/node-api-starter",
    },
    {
      id: "3",
      name: "portfolio-website",
      description: "My personal portfolio website built with Next.js and Tailwind CSS",
      language: "TypeScript",
      stars: 56,
      forks: 12,
      lastUpdated: "3 weeks ago",
      isGithub: false,
    },
  ]

  const filteredProjects = mockProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="github" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects
              .filter((p) => p.isGithub)
              .map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects
              .filter((p) => !p.isGithub)
              .map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
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
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span>{project.language}</span>
          </div>
          {project.isGithub && (
            <>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span>{project.stars}</span>
              </div>
              <div className="flex items-center gap-1">
                <Code className="h-4 w-4 text-muted-foreground" />
                <span>{project.forks}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">Updated {project.lastUpdated}</div>
        <Link href={`/projects/${project.id}`}>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

