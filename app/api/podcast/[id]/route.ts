import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { deleteFromCloudinary, updateCloudinaryMetadata, getVideoThumbnail } from "@/lib/cloudinary"
import cloudinary from "@/lib/cloudinary"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get video details from Cloudinary
    const result = await cloudinary.api.resource(id, {
      resource_type: "video",
      context: true,
    })

    const video = {
      id: result.public_id,
      title: result.context?.custom?.title || result.filename || "Untitled Video",
      description: result.context?.custom?.description || "",
      videoUrl: result.secure_url,
      thumbnailUrl: getVideoThumbnail(result.public_id, { width: 640, height: 360 }),
      duration: result.duration || 0,
      isActive: result.context?.custom?.isActive !== "false",
      createdAt: result.created_at,
      updatedAt: result.created_at,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      category: result.context?.custom?.category || "podcast",
      tags: result.context?.custom?.tags ? result.context.custom.tags.split(",") : [],
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error("Error fetching video:", error)
    return NextResponse.json({ error: "Video not found" }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { title, description, isActive, tags } = body

    // Update video metadata in Cloudinary
    await updateCloudinaryMetadata(id, {
      title: title || "",
      description: description || "",
      isActive: isActive.toString(),
      tags: Array.isArray(tags) ? tags.join(",") : tags || "",
      category: "podcast",
    })

    // Get updated video details
    const result = await cloudinary.api.resource(id, {
      resource_type: "video",
      context: true,
    })

    const updatedVideo = {
      id: result.public_id,
      title: result.context?.custom?.title || result.filename || "Untitled Video",
      description: result.context?.custom?.description || "",
      videoUrl: result.secure_url,
      thumbnailUrl: getVideoThumbnail(result.public_id, { width: 640, height: 360 }),
      duration: result.duration || 0,
      isActive: result.context?.custom?.isActive !== "false",
      createdAt: result.created_at,
      updatedAt: result.created_at,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      category: result.context?.custom?.category || "podcast",
      tags: result.context?.custom?.tags ? result.context.custom.tags.split(",") : [],
    }

    return NextResponse.json(updatedVideo)
  } catch (error) {
    console.error("Error updating video:", error)
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Delete video from Cloudinary
    await deleteFromCloudinary(id, "video")

    return NextResponse.json({ message: "Video deleted successfully" })
  } catch (error) {
    console.error("Error deleting video:", error)
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
  }
}
