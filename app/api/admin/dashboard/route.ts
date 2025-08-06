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

    // Get current date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))

    // Fetch all statistics
    const [
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      blogsThisMonth,
      blogsLastMonth,
      totalVideos,
      activeVideos,
      videosThisMonth,
      totalImages,
      activeImages,
      imagesThisMonth,
      totalUsers,
      usersThisMonth,
      recentBlogs,
      recentVideos,
      recentImages,
      topCategories,
    ] = await Promise.all([
      // Blog statistics
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.blogPost.count({ where: { published: false } }),
      prisma.blogPost.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.blogPost.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),

      // Video statistics
      prisma.podcastVideo.count(),
      prisma.podcastVideo.count({ where: { isActive: true } }),
      prisma.podcastVideo.count({
        where: { createdAt: { gte: startOfMonth } },
      }),

      // Image statistics
      prisma.galleryImage.count(),
      prisma.galleryImage.count({ where: { isActive: true } }),
      prisma.galleryImage.count({
        where: { createdAt: { gte: startOfMonth } },
      }),

      // User statistics
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: startOfMonth } },
      }),

      // Recent content
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

      prisma.podcastVideo.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          isActive: true,
          createdAt: true,
        },
      }),

      prisma.galleryImage.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          category: true,
          isActive: true,
          createdAt: true,
        },
      }),

      // Top categories
      prisma.galleryImage.groupBy({
        by: ["category"],
        _count: {
          category: true,
        },
        orderBy: {
          _count: {
            category: "desc",
          },
        },
        take: 5,
      }),
    ])

    // Calculate growth percentages
    const blogGrowth = blogsLastMonth > 0 ? ((blogsThisMonth - blogsLastMonth) / blogsLastMonth) * 100 : 0

    const stats = {
      overview: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalVideos,
        activeVideos,
        totalImages,
        activeImages,
        totalUsers,
      },
      thisMonth: {
        blogs: blogsThisMonth,
        videos: videosThisMonth,
        images: imagesThisMonth,
        users: usersThisMonth,
      },
      growth: {
        blogs: Math.round(blogGrowth),
      },
      recent: {
        blogs: recentBlogs,
        videos: recentVideos,
        images: recentImages,
      },
      categories: topCategories.map((cat) => ({
        name: cat.category,
        count: cat._count.category,
      })),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
