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

    const [totalBlogs, publishedBlogs, draftBlogs, totalVideos, activeVideos, totalImages, activeImages, recentBlogs] =
      await Promise.all([
        prisma.blogPost.count(),
        prisma.blogPost.count({ where: { published: true } }),
        prisma.blogPost.count({ where: { published: false } }),
        prisma.podcastVideo.count(),
        prisma.podcastVideo.count({ where: { isActive: true } }),
        prisma.galleryImage.count(),
        prisma.galleryImage.count({ where: { isActive: true } }),
        prisma.blogPost.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            published: true,
            createdAt: true,
            author: true,
          },
        }),
      ])

    const stats = {
      blogs: {
        total: totalBlogs,
        published: publishedBlogs,
        drafts: draftBlogs,
      },
      videos: {
        total: totalVideos,
        active: activeVideos,
      },
      images: {
        total: totalImages,
        active: activeImages,
      },
      recent: {
        blogs: recentBlogs,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
}
