import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, videoIds } = body

    if (!action || !videoIds || !Array.isArray(videoIds)) {
      return NextResponse.json({ error: "Action and videoIds are required" }, { status: 400 })
    }

    let result

    switch (action) {
      case "activate":
        result = await prisma.podcastVideo.updateMany({
          where: { id: { in: videoIds } },
          data: { isActive: true },
        })
        break

      case "deactivate":
        result = await prisma.podcastVideo.updateMany({
          where: { id: { in: videoIds } },
          data: { isActive: false },
        })
        break

      case "delete":
        result = await prisma.podcastVideo.deleteMany({
          where: { id: { in: videoIds } },
        })
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      message: `Successfully ${action}d ${result.count} videos`,
      count: result.count,
    })
  } catch (error) {
    console.error("Error performing bulk action:", error)
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 })
  }
}
