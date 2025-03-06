"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare, Plus } from "lucide-react"
import { CodeEditor } from "@/components/code-editor"

type CodeReview = {
  id: string
  title: string
  description: string
  language: string
  code: string
  author: {
    name: string
    image?: string
  }
  comments: number
  createdAt: string
  status: "open" | "closed" | "in-progress"
}

export default function CodeReviewPage() {
  const [activeTab, setActiveTab] = useState("browse")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [language, setLanguage] = useState("typescript")
  const [code, setCode] = useState("// Add your code here\n\nfunction example() {\n  console.log('Hello world');\n}\n")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!title.trim() || !description.trim() || !code.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Submit code review request
    toast({
      title: "Code review requested",
      description: "Your code has been submitted for review",
    })

    // Reset form and switch to browse tab
    setTitle("")
    setDescription("")
    setCode("// Add your code here\n\nfunction example() {\n  console.log('Hello world');\n}\n")
    setActiveTab("browse")
  }

  // Mock data for demonstration
  const mockReviews: CodeReview[] = [
    {
      id: "1",
      title: "React useEffect cleanup function",
      description: "I'm having trouble with my useEffect cleanup. Can someone review this code?",
      language: "typescript",
      code: "useEffect(() => {\n  const subscription = subscribeToEvent();\n  \n  return () => {\n    subscription.unsubscribe();\n  };\n}, []);\n",
      author: {
        name: "Alex Chen",
        image: "/placeholder.svg?height=40&width=40",
      },
      comments: 3,
      createdAt: "2 hours ago",
      status: "in-progress",
    },
    {
      id: "2",
      title: "API authentication middleware",
      description: "Need feedback on my Express authentication middleware",
      language: "javascript",
      code: "const authMiddleware = (req, res, next) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  \n  if (!token) {\n    return res.status(401).json({ message: 'Unauthorized' });\n  }\n  \n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded;\n    next();\n  } catch (error) {\n    return res.status(401).json({ message: 'Invalid token' });\n  }\n};\n",
      author: {
        name: "Maria Lopez",
        image: "/placeholder.svg?height=40&width=40",
      },
      comments: 5,
      createdAt: "1 day ago",
      status: "open",
    },
    {
      id: "3",
      title: "MongoDB aggregation pipeline",
      description: "Is this aggregation pipeline efficient for large datasets?",
      language: "javascript",
      code: "db.collection.aggregate([\n  { $match: { status: 'active' } },\n  { $group: { _id: '$category', count: { $sum: 1 } } },\n  { $sort: { count: -1 } },\n  { $limit: 10 }\n]);\n",
      author: {
        name: "John Smith",
        image: "/placeholder.svg?height=40&width=40",
      },
      comments: 2,
      createdAt: "3 days ago",
      status: "closed",
    },
  ]

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Code Reviews</h1>
          <p className="text-muted-foreground">Get feedback on your code from the community</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Browse Reviews</TabsTrigger>
          <TabsTrigger value="request">Request Review</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{review.title}</CardTitle>
                    <div
                      className={`px-2 py-1 text-xs rounded-full ${
                        review.status === "open"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : review.status === "in-progress"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {review.status === "open" ? "Open" : review.status === "in-progress" ? "In Progress" : "Closed"}
                    </div>
                  </div>
                  <CardDescription>{review.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="bg-muted rounded-md p-3 text-sm overflow-hidden text-ellipsis max-h-32">
                    <pre className="whitespace-pre-wrap">
                      <code>{review.code.substring(0, 150)}...</code>
                    </pre>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{review.comments} comments</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="request" className="space-y-6">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Request a Code Review</CardTitle>
                <CardDescription>Share your code and get feedback from experienced developers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="E.g., React Authentication Logic"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you're trying to achieve and any specific feedback you're looking for"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="csharp">C#</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <div className="min-h-[300px] border rounded-md">
                    <CodeEditor value={code} onChange={setCode} language={language} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Submit for Review
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

