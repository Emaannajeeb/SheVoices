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

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching podcast videos from Cloudinary root directory...')
    
    // FIXED: Search in root directory instead of specific folder
    const result = await cloudinary.search
      .expression("resource_type:video") // Removed folder restriction
      .sort_by("created_at", "desc")
      .max_results(50)
      .execute()

    console.log(`Found ${result.resources.length} videos`)

    const videos = result.resources.map((resource: any) => ({
      id: resource.public_id,
      title: resource.context?.title || resource.display_name || "Untitled Video",
      description: resource.context?.description || "",
      videoUrl: resource.secure_url,
      thumbnailUrl: cloudinary.url(resource.public_id, {
        resource_type: "video",
        format: "jpg",
        transformation: [{ width: 640, height: 360, crop: "fill", quality: "auto" }],
      }),
      duration: resource.duration || 0,
      isActive: resource.context?.isActive !== "false",
      createdAt: resource.created_at,
      updatedAt: resource.created_at,
      publicId: resource.public_id,
      format: resource.format,
      bytes: resource.bytes,
      width: resource.width,
      height: resource.height,
      category: resource.context?.category || "general",
      tags: resource.tags || [],
    }))

    console.log(`Returning ${videos.length} podcast videos`)
    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error fetching podcast videos from Cloudinary:", error)
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
    let { title, description, videoUrl, publicId, isActive = true, category, tags } = body

    // Extract publicId from videoUrl if not provided
    if (!publicId && videoUrl) {
      const urlParts = videoUrl.split("/")
      const filename = urlParts[urlParts.length - 1]
      publicId = filename.split(".")[0]
    }

    if (!title || !publicId) {
      return NextResponse.json({ error: "Title and public ID are required" }, { status: 400 })
    }

    // Update video context using pipe-separated string format
    const contextParts = []
    if (title) contextParts.push(`title=${encodeURIComponent(title)}`)
    if (description) contextParts.push(`description=${encodeURIComponent(description)}`)
    if (category) contextParts.push(`category=${encodeURIComponent(category)}`)
    contextParts.push(`isActive=${isActive.toString()}`)
    
    const contextString = contextParts.join('|')

    await cloudinary.api.update(publicId, {
      resource_type: "video",
      context: contextString,
      tags: tags || [],
    })

    return NextResponse.json({
      id: publicId,
      title,
      description,
      videoUrl: videoUrl || cloudinary.url(publicId, { resource_type: "video" }),
      isActive,
      category,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating podcast video:", error)
    return NextResponse.json({ error: "Failed to create podcast video" }, { status: 500 })
  }
}
