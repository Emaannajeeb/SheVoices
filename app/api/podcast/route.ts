import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching podcast videos from database...')
    
    const videos = await prisma.podcastVideo.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log(`Found ${videos.length} videos`)

    const formattedVideos = videos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description || "",
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || "",
      duration: video.duration || 0,
      isActive: video.isActive,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      publicId: video.id,
      format: "youtube",
      bytes: 0,
      width: 0,
      height: 0,
      category: "podcast",
      tags: [],
    }))

    console.log(`Returning ${formattedVideos.length} podcast videos`)
    return NextResponse.json(formattedVideos)
  } catch (error) {
    console.error("Error fetching podcast videos from database:", error)
    return NextResponse.json({ error: "Failed to fetch podcast videos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, videoUrl, thumbnailUrl, isActive = true, tags = [] } = body

    if (!title || !videoUrl) {
      return NextResponse.json({ error: "Title and video URL are required" }, { status: 400 })
    }

    // Validate YouTube URL format - accept embed URLs (what we send from frontend) or regular YouTube URLs
    const isEmbedUrl = videoUrl.includes("youtube.com/embed/")
    const isRegularUrl = videoUrl.includes("youtube.com/watch") || videoUrl.includes("youtu.be/")
    
    if (!isEmbedUrl && !isRegularUrl) {
      return NextResponse.json({ error: "Invalid YouTube URL format. Please provide a valid YouTube URL." }, { status: 400 })
    }

    const video = await prisma.podcastVideo.create({
      data: {
        title,
        description: description || null,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        isActive,
      },
    })

    return NextResponse.json({
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      isActive: video.isActive,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating podcast video:", error)
    return NextResponse.json({ error: "Failed to create podcast video" }, { status: 500 })
  }
}
