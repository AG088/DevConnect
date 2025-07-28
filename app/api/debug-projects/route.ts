import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongoose"
import Project from "@/lib/models/project"
import User from "@/lib/models/user"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    // Get current user info
    const currentUser = await User.findOne({ email: session.user.email })
    
    // Get all projects in the database
    const allProjects = await Project.find({}).populate('owner', 'name email')
    
    // Get projects owned by current user
    const userProjects = await Project.find({ owner: currentUser?._id }).populate('owner', 'name email')

    return NextResponse.json({
      currentUser: {
        id: currentUser?._id,
        name: currentUser?.name,
        email: currentUser?.email,
        sessionUserId: session.user.id
      },
      totalProjectsInDB: allProjects.length,
      userProjectsCount: userProjects.length,
      allProjects: allProjects.map(p => ({
        id: p._id,
        name: p.name,
        owner: p.owner,
        createdAt: p.createdAt
      })),
      userProjects: userProjects.map(p => ({
        id: p._id,
        name: p.name,
        owner: p.owner,
        createdAt: p.createdAt
      }))
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      { message: "Debug error", error: String(error) },
      { status: 500 }
    )
  }
} 