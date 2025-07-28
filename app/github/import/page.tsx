"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, GitBranch, Star, GitFork, Lock, Globe, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  private: boolean
  created_at: string
  updated_at: string
  topics: string[]
}

export default function GitHubImportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([])
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [languageFilter, setLanguageFilter] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  // Filter repositories based on search and language
  useEffect(() => {
    let filtered = repos

    if (searchTerm) {
      filtered = filtered.filter(repo =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (languageFilter) {
      filtered = filtered.filter(repo => repo.language === languageFilter)
    }

    setFilteredRepos(filtered)
  }, [repos, searchTerm, languageFilter])

  const fetchRepositories = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/github/repos')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch repositories')
      }
      
      setRepos(data.repos || [])
      toast.success(`Found ${data.repos?.length || 0} repositories`)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const importSelectedRepos = async () => {
    if (selectedRepos.size === 0) {
      toast.error("Please select at least one repository to import")
      return
    }

    setImporting(true)
    try {
      const response = await fetch('/api/github/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          repoNames: Array.from(selectedRepos) 
        }),
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to import repositories')
      }
      
      toast.success(`Successfully imported ${data.imported} repositories!`)
      
      // Clear selection and redirect to projects
      setSelectedRepos(new Set())
      router.push('/projects')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setImporting(false)
    }
  }

  const toggleRepoSelection = (repoName: string) => {
    const newSelected = new Set(selectedRepos)
    if (newSelected.has(repoName)) {
      newSelected.delete(repoName)
    } else {
      newSelected.add(repoName)
    }
    setSelectedRepos(newSelected)
  }

  const selectAll = () => {
    setSelectedRepos(new Set(filteredRepos.map(repo => repo.name)))
  }

  const deselectAll = () => {
    setSelectedRepos(new Set())
  }

  const getLanguages = () => {
    const languages = new Set(repos.map(repo => repo.language).filter((lang): lang is string => Boolean(lang)))
    return Array.from(languages).sort()
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Import from GitHub</h1>
          <p className="text-muted-foreground mt-2">
            Select repositories to import as projects in DevConnect
          </p>
        </div>
        <Button 
          onClick={() => router.push('/projects')}
          variant="outline"
        >
          Back to Projects
        </Button>
      </div>

      {/* GitHub Connection Status */}
      {!session.user.githubUsername ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div>
                <h3 className="font-semibold text-yellow-800">GitHub Not Connected</h3>
                <p className="text-yellow-700 text-sm">
                  Please connect your GitHub account to import repositories.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your GitHub Repositories</CardTitle>
                  <CardDescription>
                    Connected as @{session.user.githubUsername}
                  </CardDescription>
                </div>
                <Button 
                  onClick={fetchRepositories} 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <GitBranch className="mr-2 h-4 w-4" />
                      Refresh Repositories
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search repositories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                                 <select
                   value={languageFilter || ""}
                   onChange={(e) => setLanguageFilter(e.target.value)}
                   className="px-3 py-2 border rounded-md"
                 >
                  <option value="">All Languages</option>
                  {getLanguages().map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Selection Controls */}
              {filteredRepos.length > 0 && (
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                  >
                    Select All ({filteredRepos.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAll}
                  >
                    Deselect All
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedRepos.size} selected
                  </span>
                </div>
              )}

              {/* Import Button */}
              {selectedRepos.size > 0 && (
                <div className="flex items-center gap-4">
                  <Button
                    onClick={importSelectedRepos}
                    disabled={importing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        Import {selectedRepos.size} Repository{selectedRepos.size !== 1 ? 'ies' : ''}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Repositories List */}
          {filteredRepos.length > 0 ? (
            <div className="grid gap-4">
              {filteredRepos.map((repo) => (
                <Card key={repo.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedRepos.has(repo.name)}
                        onCheckedChange={() => toggleRepoSelection(repo.name)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{repo.name}</h3>
                          {repo.private ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">
                          {repo.description || 'No description available'}
                        </p>
                        <div className="flex items-center gap-4">
                          {repo.language && (
                            <Badge variant="secondary">{repo.language}</Badge>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4" />
                            <span>{repo.stargazers_count}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <GitFork className="h-4 w-4" />
                            <span>{repo.forks_count}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {repo.topics.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {repo.topics.slice(0, 3).map(topic => (
                              <Badge key={topic} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {repo.topics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{repo.topics.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : repos.length > 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No repositories match your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No repositories loaded</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Refresh Repositories" to load your GitHub repositories.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
} 