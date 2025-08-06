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
    const { action, imageIds, category } = body

    if (!action || !imageIds || !Array.isArray(imageIds)) {
      return NextResponse.json({ error: "Action and imageIds are required" }, { status: 400 })
    }

    let result

    switch (action) {
      case "activate":
        result = await prisma.galleryImage.updateMany({
          where: { id: { in: imageIds } },
          data: { isActive: true },
        })
        break

      case "deactivate":
        result = await prisma.galleryImage.updateMany({
          where: { id: { in: imageIds } },
          data: { isActive: false },
        })
        break

      case "changeCategory":
        if (!category) {
          return NextResponse.json({ error: "Category is required for changeCategory action" }, { status: 400 })
        }
        result = await prisma.galleryImage.updateMany({
          where: { id: { in: imageIds } },
          data: { category },
        })
        break

      case "delete":
        result = await prisma.galleryImage.deleteMany({
          where: { id: { in: imageIds } },
        })
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      message: `Successfully ${action}d ${result.count} images`,
      count: result.count,
    })
  } catch (error) {
    console.error("Error performing bulk action:", error)
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 })
  }
}
