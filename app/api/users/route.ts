import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongoose"
import User from "@/lib/models/user"
import Follow from "@/lib/models/follow"
import Project from "@/lib/models/project"

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)

    // Get all users with follower counts using mongoose
    const users = await User.find().select('name email image title githubUsername githubAvatarUrl')

    // Get follower/following counts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const followersCount = await Follow.countDocuments({
          following: user._id,
          status: 'accepted'
        })

        const followingCount = await Follow.countDocuments({
          follower: user._id,
          status: 'accepted'
        })

        const projectsCount = await Project.countDocuments({
          owner: user._id
        })

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          githubAvatarUrl: user.githubAvatarUrl,
          title: user.title,
          githubUsername: user.githubUsername,
          followersCount,
          followingCount,
          projectsCount,
        }
      })
    )

    // Sort by name
    usersWithCounts.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json(usersWithCounts)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
} 