import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [total, unread, read, replied, archived] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: "UNREAD" } }),
      prisma.contactMessage.count({ where: { status: "READ" } }),
      prisma.contactMessage.count({ where: { status: "REPLIED" } }),
      prisma.contactMessage.count({ where: { status: "ARCHIVED" } }),
    ])

    return NextResponse.json({
      total,
      unread,
      read,
      replied,
      archived,
    })
  } catch (error) {
    console.error("Error fetching contact message stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
