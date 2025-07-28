import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchUserRepositories } from "@/lib/github";

// GET /api/github/repos
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has GitHub connected
    if (!session.user.githubUsername) {
      return NextResponse.json(
        { message: "GitHub account not connected" },
        { status: 400 }
      );
    }

    const repos = await fetchUserRepositories();
    
    return NextResponse.json({
      repos,
      total: repos.length
    });
  } catch (error: any) {
    console.error("Error fetching GitHub repositories:", error);
    
    if (error.message.includes('No GitHub access token')) {
      return NextResponse.json(
        { message: "GitHub access token not found. Please reconnect your GitHub account." },
        { status: 401 }
      );
    }
    
    if (error.message.includes('GitHub API error')) {
      return NextResponse.json(
        { message: "Failed to fetch repositories from GitHub. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 