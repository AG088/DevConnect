import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongoose"
import Project from "@/lib/models/project"

// GET /api/projects/:id
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    await connectDB()

    const project = await Project.findById(params.id)
      .populate('owner', 'name email')

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      )
    }

    // Check if user is the owner of the project
    if (project.owner._id.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized to view this project" },
        { status: 403 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/projects/:id
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    await connectDB()

    const project = await Project.findById(params.id)

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      )
    }

    // Check if user is the owner
    if (project.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized to update this project" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, description, language, isGithub, repoUrl, technologies, visibility } = body

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      {
        name,
        description,
        language,
        isGithub,
        repoUrl,
        technologies,
        visibility,
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      message: "Project updated successfully",
      project: updatedProject
    })
  } catch (error: any) {
    console.error("Error updating project:", error)
    
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

// DELETE /api/projects/:id
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    await connectDB()

    const project = await Project.findById(params.id)

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      )
    }

    // Check if user is the owner
    if (project.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized to delete this project" },
        { status: 403 }
      )
    }

    await Project.findByIdAndDelete(params.id)

    return NextResponse.json({
      message: "Project deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 