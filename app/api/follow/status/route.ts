import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Follow from "@/lib/models/follow";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('targetUserId');

    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 });
    }

    // Check if current user is following target user
    const followingTarget = await Follow.findOne({
      follower: session.user.id,
      following: targetUserId,
    });

    // Check if target user is following current user
    const followedByTarget = await Follow.findOne({
      follower: targetUserId,
      following: session.user.id,
    });

    return NextResponse.json({
      isFollowing: followingTarget?.status === 'accepted',
      isFollowedBy: followedByTarget?.status === 'accepted',
      followRequestStatus: followingTarget?.status,
      followId: followingTarget?._id,
    });

  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json({ error: "Failed to check follow status" }, { status: 500 });
  }
} 