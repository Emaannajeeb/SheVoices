import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id: params.id },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error fetching contact message:", error)
    return NextResponse.json({ error: "Failed to fetch contact message" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status, isRead, adminNotes } = body

    const updatedMessage = await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(typeof isRead === "boolean" && { isRead }),
        ...(adminNotes !== undefined && { adminNotes }),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error("Error updating contact message:", error)
    return NextResponse.json({ error: "Failed to update contact message" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.contactMessage.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Contact message deleted successfully" })
  } catch (error) {
    console.error("Error deleting contact message:", error)
    return NextResponse.json({ error: "Failed to delete contact message" }, { status: 500 })
  }
}
