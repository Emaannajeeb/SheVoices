import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCloudinaryResources, updateCloudinaryMetadata, getVideoThumbnail } from "@/lib/cloudinary"

export async function GET() {
  try {
    console.log("Fetching podcast videos from Cloudinary...")

    // Fetch videos from Cloudinary podcast folder
    const resources = await getCloudinaryResources("shevoices/podcast", "video", 50)

    console.log(`Found ${resources.length} resources in Cloudinary`)

    const videos = resources.map((resource) => {
      const isActive = resource.context?.custom?.isActive
      const shouldShow = isActive === undefined || isActive === "true"

      console.log(`Processing video: ${resource.public_id}, isActive: ${isActive}, shouldShow: ${shouldShow}`)

      return {
        id: resource.public_id,
        title: resource.context?.custom?.title || resource.filename || "Untitled Video",
        description: resource.context?.custom?.description || "",
        videoUrl: resource.secure_url,
        thumbnailUrl: getVideoThumbnail(resource.public_id, { width: 640, height: 360 }),
        duration: resource.duration || 0,
        isActive: resource.context?.custom?.isActive !== "false",
        createdAt: resource.created_at,
        updatedAt: resource.created_at,
        publicId: resource.public_id,
        format: resource.format,
        bytes: resource.bytes,
        width: resource.width,
        height: resource.height,
        category: resource.context?.custom?.category || "podcast",
        tags: resource.context?.custom?.tags ? resource.context.custom.tags.split(",") : [],
      }
    })

    console.log(`Returning ${videos.length} videos`)
    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error fetching podcast videos from Cloudinary:", error)
    return NextResponse.json({ error: "Failed to fetch podcast videos", details: (error as any).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { publicId, title, description, isActive = true, tags = [] } = body

    if (!publicId || !title) {
      return NextResponse.json({ error: "Public ID and title are required" }, { status: 400 })
    }

    console.log("Updating video metadata:", { publicId, title, description, isActive, tags })

    // Update video metadata in Cloudinary
    await updateCloudinaryMetadata(publicId, {
      title,
      description: description || "",
      isActive: isActive.toString(),
      tags: Array.isArray(tags) ? tags.join(",") : tags,
      category: "podcast",
    })

    return NextResponse.json(
      {
        message: "Podcast video metadata updated successfully",
        publicId,
        title,
        description,
        isActive,
        tags,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating podcast video metadata:", error)
    return NextResponse.json({ error: "Failed to update podcast video", details: (error as any).message }, { status: 500 })
  }
}
