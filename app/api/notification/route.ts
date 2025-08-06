import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Mock notification system - in production, you'd use a proper notification service
let notifications: any[] = [
  {
    id: "1",
    type: "info",
    title: "New blog post published",
    message: "Your blog post 'Empowering Women in Tech' has been published successfully.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
  },
  {
    id: "2",
    type: "success",
    title: "Video uploaded",
    message: "Your podcast video has been uploaded and is now live.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
  },
  {
    id: "3",
    type: "warning",
    title: "Storage limit warning",
    message: "You're approaching your storage limit. Consider upgrading your plan.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    let filteredNotifications = notifications
    if (unreadOnly) {
      filteredNotifications = notifications.filter((n) => !n.read)
    }

    return NextResponse.json({
      notifications: filteredNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      unreadCount: notifications.filter((n) => !n.read).length,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, message } = body

    const notification = {
      id: Date.now().toString(),
      type: type || "info",
      title,
      message,
      createdAt: new Date(),
      read: false,
    }

    notifications.unshift(notification)

    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications = notifications.slice(0, 50)
    }

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
