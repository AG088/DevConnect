import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get posts with author information
    const posts = await db
      .collection("posts")
      .aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
        {
          $project: {
            _id: 1,
            content: 1,
            createdAt: 1,
            likes: 1,
            comments: 1,
            author: {
              _id: 1,
              name: 1,
              image: 1,
              title: 1,
            },
          },
        },
      ])
      .toArray()

    // Format posts for client
    const formattedPosts = posts.map((post) => ({
      id: post._id.toString(),
      content: post.content,
      createdAt: post.createdAt,
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0,
      author: {
        id: post.author._id.toString(),
        name: post.author.name,
        image: post.author.image,
        title: post.author.title,
      },
    }))

    return NextResponse.json(formattedPosts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await req.json()

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Get user from database
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create new post
    const newPost = {
      authorId: user._id,
      content,
      createdAt: new Date(),
      likes: [],
      comments: [],
    }

    const result = await db.collection("posts").insertOne(newPost)

    // Return the new post with author information
    return NextResponse.json({
      id: result.insertedId.toString(),
      content,
      createdAt: "Just now",
      likes: 0,
      comments: 0,
      author: {
        id: user._id.toString(),
        name: user.name,
        image: user.image,
        title: user.title,
      },
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}

