import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Follow from "@/lib/models/follow";
import User from "@/lib/models/user";

// Send follow request
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId } = await req.json();
    
    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-following
    if (session.user.id === targetUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check if follow relationship already exists
    const existingFollow = await Follow.findOne({
      follower: session.user.id,
      following: targetUserId,
    });

    if (existingFollow) {
      if (existingFollow.status === 'accepted') {
        return NextResponse.json({ error: "Already following this user" }, { status: 400 });
      } else if (existingFollow.status === 'pending') {
        return NextResponse.json({ error: "Follow request already sent" }, { status: 400 });
      } else if (existingFollow.status === 'rejected') {
        // Update rejected request to pending
        existingFollow.status = 'pending';
        await existingFollow.save();
        return NextResponse.json({ message: "Follow request sent", status: "pending" });
      }
    }

    // Create new follow request
    const followRequest = await Follow.create({
      follower: session.user.id,
      following: targetUserId,
      status: 'pending',
    });

    return NextResponse.json({ 
      message: "Follow request sent", 
      status: "pending",
      followId: followRequest._id 
    });

  } catch (error) {
    console.error("Error sending follow request:", error);
    return NextResponse.json({ error: "Failed to send follow request" }, { status: 500 });
  }
}

// Get follow relationships
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'followers', 'following', 'pending'
    const userId = searchParams.get('userId') || session.user.id;

    // Only allow users to view their own pending requests
    if (type === 'pending' && userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let follows;
    switch (type) {
      case 'followers':
        follows = await Follow.getFollowers(userId);
        break;
      case 'following':
        follows = await Follow.getFollowing(userId);
        break;
      case 'pending':
        follows = await Follow.getPendingRequests(userId);
        break;
      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }

    return NextResponse.json({ follows });

  } catch (error) {
    console.error("Error fetching follow relationships:", error);
    return NextResponse.json({ error: "Failed to fetch follow relationships" }, { status: 500 });
  }
} 