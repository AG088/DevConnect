import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const postId = params.id

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    // Get user from database
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user already liked the post
    const post = await db.collection("posts").findOne({
      _id: new ObjectId(postId),
      likes: user._id,
    })

    if (post) {
      // User already liked the post, remove the like
      await db.collection("posts").updateOne({ _id: new ObjectId(postId) }, { $pull: { likes: user._id } })
      return NextResponse.json({ liked: false })
    } else {
      // User hasn't liked the post, add the like
      await db.collection("posts").updateOne({ _id: new ObjectId(postId) }, { $addToSet: { likes: user._id } })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error liking post:", error)
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
  }
}

