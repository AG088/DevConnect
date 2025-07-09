import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongoose"
import User from "@/lib/models/user"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
      return NextResponse.json(
        { message: "Please provide a valid email" },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    // Return success response without password
    return NextResponse.json(
      { 
        message: "User created successfully", 
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email,
          createdAt: user.createdAt
        } 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      )
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { message: messages.join(', ') },
        { status: 400 }
      )
    }

    // Return detailed error message for debugging
    return NextResponse.json(
      { 
        message: "Internal server error",
        error: error.message || "Unknown error occurred"
      },
      { status: 500 }
    )
  }
} 