import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const results: any = {
      blogs: [],
      videos: [],
      images: [],
    }

    if (type === "all" || type === "blogs") {
      results.blogs = await prisma.blogPost.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { tags: { hasSome: [query] } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          author: true,
          createdAt: true,
          featuredImage: true,
          tags: true,
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      })
    }

    if (type === "all" || type === "videos") {
      results.videos = await prisma.podcastVideo.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      })
    }

    if (type === "all" || type === "images") {
      results.images = await prisma.galleryImage.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { altText: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      })
    }

    const totalResults = results.blogs.length + results.videos.length + results.images.length

    return NextResponse.json({
      query,
      totalResults,
      results,
    })
  } catch (error) {
    console.error("Error performing search:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
