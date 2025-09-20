import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import User from "@/lib/models/user";
import Follow from "@/lib/models/follow";
import Project from "@/lib/models/project";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    const userId = params.id;

    // Get user profile
    const user = await User.findById(userId).select('-password -githubAccessToken');
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get follower counts
    const followersCount = await Follow.countDocuments({
      following: userId,
      status: 'accepted'
    });

    const followingCount = await Follow.countDocuments({
      follower: userId,
      status: 'accepted'
    });

    // Get projects count
    const projectsCount = await Project.countDocuments({
      owner: userId
    });

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        title: user.title,
        githubUsername: user.githubUsername,
        githubAvatarUrl: user.githubAvatarUrl,
        createdAt: user.createdAt,
        followersCount,
        followingCount,
        projectsCount,
      }
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
} 