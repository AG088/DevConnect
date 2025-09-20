import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Follow from "@/lib/models/follow";

// Handle follow request actions (accept/reject) and unfollow
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();
    const followId = params.id;

    if (!action || !['accept', 'reject', 'unfollow'].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be 'accept', 'reject', or 'unfollow'" }, { status: 400 });
    }

    // Find the follow relationship
    const follow = await Follow.findById(followId);
    if (!follow) {
      return NextResponse.json({ error: "Follow relationship not found" }, { status: 404 });
    }

    // For accept/reject, user must be the one being followed
    if (['accept', 'reject'].includes(action)) {
      if (follow.following.toString() !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // For unfollow, user must be the follower
    if (action === 'unfollow') {
      if (follow.follower.toString() !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Update the follow relationship
    switch (action) {
      case 'accept':
        follow.status = 'accepted';
        break;
      case 'reject':
        follow.status = 'rejected';
        break;
      case 'unfollow':
        // Delete the follow relationship
        await Follow.findByIdAndDelete(followId);
        return NextResponse.json({ message: "Unfollowed successfully" });
    }

    await follow.save();

    return NextResponse.json({ 
      message: `Follow request ${action}ed successfully`,
      status: follow.status 
    });

  } catch (error) {
    console.error("Error handling follow action:", error);
    return NextResponse.json({ error: "Failed to handle follow action" }, { status: 500 });
  }
}

// Delete follow relationship (unfollow)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const followId = params.id;
    const follow = await Follow.findById(followId);

    if (!follow) {
      return NextResponse.json({ error: "Follow relationship not found" }, { status: 404 });
    }

    // Only the follower can unfollow
    if (follow.follower.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Follow.findByIdAndDelete(followId);
    return NextResponse.json({ message: "Unfollowed successfully" });

  } catch (error) {
    console.error("Error unfollowing:", error);
    return NextResponse.json({ error: "Failed to unfollow" }, { status: 500 });
  }
} 