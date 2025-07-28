import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Project from "@/lib/models/project";
import { fetchRepositoryDetails } from "@/lib/github";

// POST /api/github/import
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { repoNames } = body; // Array of repository names to import

    if (!repoNames || !Array.isArray(repoNames) || repoNames.length === 0) {
      return NextResponse.json(
        { message: "Please provide repository names to import" },
        { status: 400 }
      );
    }

    await connectDB();

    const importedProjects = [];
    const errors = [];

    for (const repoName of repoNames) {
      try {
        // Check if project already exists
        const existingProject = await Project.findOne({
          owner: session.user.id,
          'repoUrl': { $regex: `/${repoName}$` }
        });

        if (existingProject) {
          errors.push(`${repoName}: Project already exists`);
          continue;
        }

        // Fetch repository details from GitHub
        const repoDetails = await fetchRepositoryDetails(repoName);

        // Create new project
        const project = await Project.create({
          name: repoDetails.name,
          description: repoDetails.description || `GitHub repository: ${repoDetails.name}`,
          language: repoDetails.language || 'Unknown',
          isGithub: true,
          repoUrl: repoDetails.html_url,
          githubRepoId: repoDetails.id,
          githubStars: repoDetails.stargazers_count,
          githubForks: repoDetails.forks_count,
          githubLastSynced: new Date(),
          technologies: repoDetails.topics || [],
          visibility: repoDetails.private ? 'private' : 'public',
          owner: session.user.id,
        });

        importedProjects.push(project);
      } catch (error: any) {
        console.error(`Error importing ${repoName}:`, error);
        errors.push(`${repoName}: ${error.message}`);
      }
    }

    return NextResponse.json({
      message: `Successfully imported ${importedProjects.length} repositories`,
      imported: importedProjects.length,
      errors: errors.length > 0 ? errors : undefined,
      projects: importedProjects
    });

  } catch (error: any) {
    console.error("Error importing GitHub repositories:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 