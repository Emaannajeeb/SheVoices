import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message, subject } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" }, 
        { status: 400 }
      )
    }

    // Save the contact message to database
    // Note: Use lowercase 'contactMessage' - this is the generated client method
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
        subject: subject || `Message from ${name}`,
        status: "unread",
        isRead: false,
      },
    })

    return NextResponse.json({
      message: "Contact form submitted successfully",
      data: { id: contactMessage.id, name, email, subject },
    })
  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json({ error: "Failed to process contact form" }, { status: 500 })
  }
}

// GET method to fetch contact messages (for admin)
export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching contact messages:", error)
    return NextResponse.json({ error: "Failed to fetch contact messages" }, { status: 500 })
  }
}