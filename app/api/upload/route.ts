import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v2 as cloudinary } from 'cloudinary'

export const dynamic = "force-dynamic"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const tags = formData.get("tags") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!type || !["image", "video", "blog"].includes(type)) {
      return NextResponse.json({ error: "Invalid type. Must be image, video, or blog" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine folder and resource type
    let folder = "shevoices"
    let resourceType: "image" | "video" | "auto" = "auto"

    if (type === "image") {
      folder = "shevoices/gallery"
      resourceType = "image"
    } else if (type === "video") {
      folder = "shevoices/podcast"
      resourceType = "video"
    } else if (type === "blog") {
      folder = "shevoices/blog"
      resourceType = "image"
    }

    // Create context string in correct format (pipe-separated)
    const contextParts = []
    if (title) contextParts.push(`title=${title}`)
    if (description) contextParts.push(`description=${description}`)
    if (category) contextParts.push(`category=${category}`)
    contextParts.push(`isActive=true`)
    if (tags) contextParts.push(`tags=${tags}`)
    
    const contextString = contextParts.join('|')

    console.log("Uploading to Cloudinary:", { folder, resourceType, context: contextString })

    // Upload to Cloudinary using Promise wrapper
    const result = await new Promise<any>((resolve, reject) => {
  cloudinary.uploader.upload_stream(
    {
      folder,
      resource_type: resourceType,
      context: contextString,
      quality: 'auto',
      format: 'auto',
      use_filename: true,
      unique_filename: true,
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error)
        reject(error)
      } else {
        resolve(result)
      }
    }
  ).end(buffer)
})

    console.log("Upload successful:", result)

    return NextResponse.json({
      message: "File uploaded successfully",
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      duration: result.duration,
      resourceType: result.resource_type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ 
      error: "Upload failed", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
