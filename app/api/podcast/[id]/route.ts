import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"

export const dynamic = "force-dynamic"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get video from Cloudinary
    const resource = await cloudinary.api.resource(id, {
      resource_type: "video",
    })

    if (!resource) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Generate URLs
    const thumbnailUrl = cloudinary.url(resource.public_id, {
      resource_type: "video",
      format: "jpg",
      transformation: [{ width: 640, height: 360, crop: "fill" }, { quality: "auto" }],
    })

    const videoUrl = cloudinary.url(resource.public_id, {
      resource_type: "video",
      format: resource.format,
      transformation: [{ quality: "auto" }],
    })

    const video = {
      id: resource.public_id,
      title: resource.context?.custom?.title || resource.display_name || resource.public_id,
      description: resource.context?.custom?.description || "",
      videoUrl,
      thumbnailUrl,
      duration: resource.duration || 0,
      isActive: resource.context?.custom?.isActive !== "false",
      createdAt: resource.created_at,
      publicId: resource.public_id,
      format: resource.format,
      bytes: resource.bytes,
      width: resource.width,
      height: resource.height,
      category: resource.context?.custom?.category || "general",
      tags: resource.tags || [],
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error("Error fetching podcast video:", error)
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { title, description, isActive, category, tags } = body

    // Update context in Cloudinary
    await cloudinary.api.update(id, {
      resource_type: "video",
      context: {
        title,
        description,
        isActive: isActive.toString(),
        category,
      },
      tags: tags || [],
    })

    // Get updated resource
    const resource = await cloudinary.api.resource(id, {
      resource_type: "video",
    })

    const video = {
      id: resource.public_id,
      title: resource.context?.custom?.title || title,
      description: resource.context?.custom?.description || description,
      isActive: resource.context?.custom?.isActive !== "false",
      category: resource.context?.custom?.category || category,
      tags: resource.tags || tags,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error("Error updating podcast video:", error)
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Delete from Cloudinary
    await cloudinary.api.delete_resources([id], {
      resource_type: "video",
    })

    return NextResponse.json({ message: "Video deleted successfully" })
  } catch (error) {
    console.error("Error deleting podcast video:", error)
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
  }
}
