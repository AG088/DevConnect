import { NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"

export async function GET() {
  try {
    await connectDB()
    return NextResponse.json(
      { message: "✅ MongoDB connection successful" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Connection test error:", error)
    return NextResponse.json(
      { message: "❌ MongoDB connection failed", error: String(error) },
      { status: 500 }
    )
  }
} 