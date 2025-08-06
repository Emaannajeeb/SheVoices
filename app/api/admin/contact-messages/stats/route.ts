import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [total, unread, read, replied, archived] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: "unread" } }),
      prisma.contactMessage.count({ where: { status: "read" } }),
      prisma.contactMessage.count({ where: { status: "replied" } }),
      prisma.contactMessage.count({ where: { status: "archived" } }),
    ])

    const recentMessages = await prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      stats: {
        total,
        unread,
        read,
        replied,
        archived,
      },
      recentMessages,
    })
  } catch (error) {
    console.error("Error fetching contact message stats:", error)
    return NextResponse.json({ error: "Failed to fetch contact message stats" }, { status: 500 })
  }
}
