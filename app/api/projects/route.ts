import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongoose"
import Project from "@/lib/models/project"

// GET /api/projects
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Validate that user.id is a valid MongoDB ObjectId
    if (!session.user.id || !/^[0-9a-fA-F]{24}$/.test(session.user.id)) {
      return NextResponse.json(
        { message: "Invalid user session" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all'
    const language = searchParams.get('language')

    await connectDB()

    // Build query - ALWAYS filter by current user for privacy
    const query: any = {
      owner: session.user.id // Only show current user's projects
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    if (filter === 'github') {
      query.isGithub = true
    } else if (filter === 'custom') {
      query.isGithub = false
    }

    if (language) {
      query.language = language
    }

    // Get total count
    const total = await Project.countDocuments(query)

    // Get paginated results
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('owner', 'name email')

    return NextResponse.json({
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/projects
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, description, language, isGithub, repoUrl, technologies, visibility } = body

    // Validate required fields
    if (!name || !description || !language || typeof isGithub !== 'boolean') {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }  
    

    // Validate GitHub URL if it's a GitHub project
    if (isGithub && !repoUrl) {
      return NextResponse.json(
        { message: "GitHub URL is required for GitHub projects" },
        { status: 400 }
      )
    }

    await connectDB()

    const project = await Project.create({
      name,
      description,
      language,
      isGithub,
      repoUrl, 
      technologies,
      visibility,
      owner: session.user.id
    })

    return NextResponse.json(
      { message: "Project created successfully", project },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating project:", error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 