import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Message from "@/lib/models/message";
import Conversation from "@/lib/models/conversation";
import Follow from "@/lib/models/follow";

// Send a message
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, content, messageType = 'text' } = await req.json();

    if (!recipientId || !content) {
      return NextResponse.json({ error: "Recipient ID and content are required" }, { status: 400 });
    }

    // Check if users are following each other (for messaging)
    const isFollowing = await Follow.isFollowing(session.user.id, recipientId);
    const isFollowedBy = await Follow.isFollowing(recipientId, session.user.id);

    if (!isFollowing && !isFollowedBy) {
      return NextResponse.json({ error: "You can only message users you follow or who follow you" }, { status: 403 });
    }

    // Create or get conversation
    let conversation = await Conversation.getConversation(session.user.id, recipientId);
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [session.user.id, recipientId],
        unreadCount: { [recipientId]: 0 }
      });
    }

    // Create message
    const message = await Message.create({
      sender: session.user.id,
      recipient: recipientId,
      content,
      messageType,
    });

    // Update conversation
    await Conversation.updateLastMessage(conversation._id, message._id, content, session.user.id);
    await Conversation.incrementUnreadCount(conversation._id, recipientId);

    // Populate sender info for response
    await message.populate('sender', 'name image githubUsername');

    return NextResponse.json({
      message: {
        id: message._id,
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt,
        sender: message.sender,
        read: message.read,
      }
    });

  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

// Get user conversations
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await Conversation.getUserConversations(session.user.id);

    return NextResponse.json({ conversations });

  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
} 