import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30" // days
    const type = searchParams.get("type") || "all"

    const days = Number.parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Generate date range for charts
    const dateRange = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dateRange.push(date.toISOString().split("T")[0])
    }

    // Get content creation over time
    const blogStats = await prisma.blogPost.groupBy({
      by: ["createdAt"],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    })

    const videoStats = await prisma.podcastVideo.groupBy({
      by: ["createdAt"],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    })

    const imageStats = await prisma.galleryImage.groupBy({
      by: ["createdAt"],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    })

    // Format data for charts
    const formatStatsForChart = (stats: any[], dateRange: string[]) => {
      const statsMap = new Map()
      stats.forEach((stat) => {
        const date = stat.createdAt.toISOString().split("T")[0]
        statsMap.set(date, stat._count.id)
      })

      return dateRange.map((date) => ({
        date,
        count: statsMap.get(date) || 0,
      }))
    }

    // Get top performing content
    const topBlogs = await prisma.blogPost.findMany({
      where: {
        published: true,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        tags: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    // Get category distribution
    const categoryStats = await prisma.galleryImage.groupBy({
      by: ["category"],
      _count: {
        category: true,
      },
      where: {
        isActive: true,
      },
    })

    // Get tag popularity
    const allPosts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { tags: true },
    })

    const tagCounts: Record<string, number> = {}
    allPosts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const analytics = {
      overview: {
        totalViews: Math.floor(Math.random() * 10000) + 5000, // Mock data
        totalEngagement: Math.floor(Math.random() * 1000) + 500, // Mock data
        avgSessionDuration: "2:34", // Mock data
        bounceRate: "45%", // Mock data
      },
      charts: {
        blogs: formatStatsForChart(blogStats, dateRange),
        videos: formatStatsForChart(videoStats, dateRange),
        images: formatStatsForChart(imageStats, dateRange),
      },
      topContent: {
        blogs: topBlogs,
      },
      categories: categoryStats.map((cat) => ({
        name: cat.category,
        count: cat._count.category,
      })),
      tags: topTags,
      traffic: {
        // Mock traffic data - in real app, this would come from Google Analytics or similar
        sources: [
          { source: "Direct", visitors: 1234, percentage: 35 },
          { source: "Social Media", visitors: 987, percentage: 28 },
          { source: "Search Engines", visitors: 765, percentage: 22 },
          { source: "Referrals", visitors: 543, percentage: 15 },
        ],
        devices: [
          { device: "Mobile", visitors: 1876, percentage: 53 },
          { device: "Desktop", visitors: 1234, percentage: 35 },
          { device: "Tablet", visitors: 419, percentage: 12 },
        ],
      },
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
