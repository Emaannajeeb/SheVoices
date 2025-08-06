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
    const { action, postIds } = body

    if (!action || !postIds || !Array.isArray(postIds)) {
      return NextResponse.json({ error: "Action and postIds are required" }, { status: 400 })
    }

    let result

    switch (action) {
      case "publish":
        result = await prisma.blogPost.updateMany({
          where: { id: { in: postIds } },
          data: { published: true },
        })
        break

      case "unpublish":
        result = await prisma.blogPost.updateMany({
          where: { id: { in: postIds } },
          data: { published: false },
        })
        break

      case "delete":
        result = await prisma.blogPost.deleteMany({
          where: { id: { in: postIds } },
        })
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      message: `Successfully ${action}ed ${result.count} posts`,
      count: result.count,
    })
  } catch (error) {
    console.error("Error performing bulk action:", error)
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 })
  }
}
