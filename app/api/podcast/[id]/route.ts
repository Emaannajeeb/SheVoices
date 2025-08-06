import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const video = await prisma.podcastVideo.findUnique({
      where: { id },
    })

    if (!video) {
      return NextResponse.json({ error: "Podcast video not found" }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error("Error fetching podcast video:", error)
    return NextResponse.json({ error: "Failed to fetch podcast video" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, videoUrl, thumbnailUrl, duration, isActive } = body

    const video = await prisma.podcastVideo.findUnique({ where: { id } })
    if (!video) {
      return NextResponse.json({ error: "Podcast video not found" }, { status: 404 })
    }

    const updatedVideo = await prisma.podcastVideo.update({
      where: { id },
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration,
        isActive,
      },
    })

    return NextResponse.json(updatedVideo)
  } catch (error) {
    console.error("Error updating podcast video:", error)
    return NextResponse.json({ error: "Failed to update podcast video" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const video = await prisma.podcastVideo.findUnique({ where: { id } })
    if (!video) {
      return NextResponse.json({ error: "Podcast video not found" }, { status: 404 })
    }

    await prisma.podcastVideo.delete({ where: { id } })

    return NextResponse.json({ message: "Podcast video deleted successfully" })
  } catch (error) {
    console.error("Error deleting podcast video:", error)
    return NextResponse.json({ error: "Failed to delete podcast video" }, { status: 500 })
  }
}
