import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Message from "@/lib/models/message";
import Conversation from "@/lib/models/conversation";

// Get messages in a conversation
export async function GET(req: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Get conversation to verify user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (!conversation.participants.includes(session.user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the other participant
    const otherParticipant = conversation.participants.find(
      (p: any) => p.toString() !== session.user.id
    );

    if (!otherParticipant) {
      return NextResponse.json({ error: "Invalid conversation" }, { status: 400 });
    }

    // Get messages
    const messages = await Message.getConversation(
      session.user.id,
      otherParticipant.toString(),
      limit,
      skip
    );

    // Mark messages as read
    await Message.markConversationAsRead(session.user.id, otherParticipant.toString());
    await Conversation.resetUnreadCount(conversationId, session.user.id);

    return NextResponse.json({ messages });

  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// Mark conversation as read
export async function PATCH(req: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = params;

    // Get conversation to verify user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (!conversation.participants.includes(session.user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the other participant
    const otherParticipant = conversation.participants.find(
      (p: any) => p.toString() !== session.user.id
    );

    if (!otherParticipant) {
      return NextResponse.json({ error: "Invalid conversation" }, { status: 400 });
    }

    // Mark messages as read
    await Message.markConversationAsRead(session.user.id, otherParticipant.toString());
    await Conversation.resetUnreadCount(conversationId, session.user.id);

    return NextResponse.json({ message: "Conversation marked as read" });

  } catch (error) {
    console.error("Error marking conversation as read:", error);
    return NextResponse.json({ error: "Failed to mark conversation as read" }, { status: 500 });
  }
} 