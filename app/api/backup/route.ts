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
    const { type } = body // 'full', 'blogs', 'media', etc.

    let backupData: any = {}

    switch (type) {
      case "full":
        backupData = {
          users: await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          }),
          blogPosts: await prisma.blogPost.findMany(),
          podcastVideos: await prisma.podcastVideo.findMany(),
          galleryImages: await prisma.galleryImage.findMany(),
          contactInfo: await prisma.contactInfo.findMany(),
          socialUpdates: await prisma.socialUpdate.findMany(),
        }
        break

      case "blogs":
        backupData = {
          blogPosts: await prisma.blogPost.findMany(),
        }
        break

      case "media":
        backupData = {
          podcastVideos: await prisma.podcastVideo.findMany(),
          galleryImages: await prisma.galleryImage.findMany(),
        }
        break

      default:
        return NextResponse.json({ error: "Invalid backup type" }, { status: 400 })
    }

    // Add metadata
    const backup = {
      metadata: {
        type,
        createdAt: new Date().toISOString(),
        version: "1.0",
        createdBy: session.user?.email,
      },
      data: backupData,
    }

    // In a real application, you would save this to cloud storage
    // For now, we'll return it as JSON for download
    return NextResponse.json(backup, {
      headers: {
        "Content-Disposition": `attachment; filename="shevoices-backup-${type}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Error creating backup:", error)
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 })
  }
}
