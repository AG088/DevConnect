import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongoose"
import Project from "@/lib/models/project"
import User from "@/lib/models/user"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email })
    
    if (!currentUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    let fixedCount = 0
    let errors = []

    // Method 1: Find projects with string owners (Google OAuth sub)
    const projectsWithStringOwner = await Project.find({
      owner: { $type: "string" }
    })

    for (const project of projectsWithStringOwner) {
      try {
        await Project.findByIdAndUpdate(project._id, {
          owner: currentUser._id
        })
        fixedCount++
      } catch (error) {
        errors.push(`Failed to fix project ${project._id}: ${error}`)
      }
    }

    // Method 2: Find projects with no owner
    const projectsWithNoOwner = await Project.find({
      owner: { $exists: false }
    })

    for (const project of projectsWithNoOwner) {
      try {
        await Project.findByIdAndUpdate(project._id, {
          owner: currentUser._id
        })
        fixedCount++
      } catch (error) {
        errors.push(`Failed to fix project ${project._id}: ${error}`)
      }
    }

    // Method 3: Find projects with null owner
    const projectsWithNullOwner = await Project.find({
      owner: null
    })

    for (const project of projectsWithNullOwner) {
      try {
        await Project.findByIdAndUpdate(project._id, {
          owner: currentUser._id
        })
        fixedCount++
      } catch (error) {
        errors.push(`Failed to fix project ${project._id}: ${error}`)
      }
    }

    // Check for orphaned projects (projects with invalid ObjectId owners)
    const allProjects = await Project.find({}).populate('owner')
    const orphanedCount = allProjects.filter(p => !p.owner || !p.owner._id).length

    return NextResponse.json({
      message: "User projects fix completed",
      currentUser: {
        id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email
      },
      projectsFixed: fixedCount,
      orphanedProjects: orphanedCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error("Fix error:", error)
    return NextResponse.json(
      { message: "Fix error", error: String(error) },
      { status: 500 }
    )
  }
} 