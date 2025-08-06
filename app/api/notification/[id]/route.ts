import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface RouteParams {
  params: Promise<{ id: string }>
}

// This would typically be stored in a database
// For demo purposes, we're using the same mock data from the main notifications route
const notifications: any[] = []

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { read } = body

    // Find and update notification
    const notificationIndex = notifications.findIndex((n) => n.id === id)
    if (notificationIndex === -1) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    notifications[notificationIndex].read = read

    return NextResponse.json(notifications[notificationIndex])
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const notificationIndex = notifications.findIndex((n) => n.id === id)
    if (notificationIndex === -1) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    notifications.splice(notificationIndex, 1)

    return NextResponse.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}
