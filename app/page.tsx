import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Github, Globe, MessageSquare, Users } from "lucide-react"
import Link from "next/link"
import { FeedPreview } from "@/components/feed-preview"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DevConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main>
        <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
          <div className="container grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Connect, Collaborate, and Grow with Fellow Developers
              </h1>
              <p className="text-xl text-muted-foreground">
                DevConnect is the professional network built specifically for developers. Showcase your projects, get
                code reviews, and connect with peers.
              </p>
              <div className="flex gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="gap-2">
                    Join Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <FeedPreview />
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why DevConnect?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built by developers, for developers. A platform focused on what matters most to your career.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Github className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Showcase Projects</h3>
                <p className="text-muted-foreground">
                  Connect your GitHub repositories and showcase your best work to potential employers and collaborators.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Code className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Code Reviews</h3>
                <p className="text-muted-foreground">
                  Get feedback on your code from experienced developers using our integrated code editor.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Developer Network</h3>
                <p className="text-muted-foreground">
                  Build meaningful connections with other developers, mentors, and potential employers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8 mt-auto">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <span className="font-semibold">DevConnect</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DevConnect. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Globe className="h-5 w-5" />
              <span className="sr-only">Website</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <MessageSquare className="h-5 w-5" />
              <span className="sr-only">Discord</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

