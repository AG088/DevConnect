"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function GitHubTestPage() {
  const { data: session } = useSession()
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<any>(null)

  const fetchRepos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/github/repos')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch repositories')
      }
      
      setRepos(data.repos || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const importRepos = async (repoNames: string[]) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/github/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoNames }),
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to import repositories')
      }
      
      setImportResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>GitHub API Test</CardTitle>
            <CardDescription>Please sign in to test GitHub APIs</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>GitHub API Test</CardTitle>
          <CardDescription>
            Test GitHub repository fetching and importing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={fetchRepos} 
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Fetch Repositories'}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {importResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-semibold text-green-800">Import Result:</h3>
              <p className="text-green-700">
                Successfully imported {importResult.imported} repositories
              </p>
              {importResult.errors && (
                <div className="mt-2">
                  <p className="text-red-700 font-semibold">Errors:</p>
                  <ul className="list-disc list-inside text-red-600">
                    {importResult.errors.map((err: string, index: number) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {repos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Your GitHub Repositories ({repos.length})
              </h3>
              <div className="grid gap-4">
                {repos.map((repo) => (
                  <Card key={repo.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{repo.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {repo.description || 'No description'}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {repo.language && (
                              <Badge variant="secondary">{repo.language}</Badge>
                            )}
                            <Badge variant="outline">
                              ⭐ {repo.stargazers_count}
                            </Badge>
                            <Badge variant="outline">
                              🍴 {repo.forks_count}
                            </Badge>
                            {repo.private && (
                              <Badge variant="destructive">Private</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => importRepos([repo.name])}
                          disabled={loading}
                        >
                          Import
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 