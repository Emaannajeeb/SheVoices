import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const videos = await prisma.podcastVideo.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error fetching podcast videos:", error)
    return NextResponse.json({ error: "Failed to fetch podcast videos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, videoUrl, thumbnailUrl, duration } = body

    if (!title || !videoUrl) {
      return NextResponse.json({ error: "Title and video URL are required" }, { status: 400 })
    }

    const video = await prisma.podcastVideo.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration,
        isActive: true,
      },
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error("Error creating podcast video:", error)
    return NextResponse.json({ error: "Failed to create podcast video" }, { status: 500 })
  }
}
