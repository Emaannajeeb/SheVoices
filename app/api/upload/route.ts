import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

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

    // Determine folder and resource type based on type
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

    // Prepare context metadata
    const context = {
      title: title || file.name,
      description: description || "",
      category: category || type,
      isActive: "true",
      tags: tags || "",
    }

    console.log("Uploading to Cloudinary:", { folder, resourceType, context })

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, {
      folder,
      resource_type: resourceType,
      context,
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
    return NextResponse.json({ error: "Upload failed", details: (error as any).message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get("publicId")
    const resourceType = searchParams.get("resourceType") || "image"

    if (!publicId) {
      return NextResponse.json({ error: "Public ID is required" }, { status: 400 })
    }

    console.log("Deleting from Cloudinary:", { publicId, resourceType })

    // Delete from Cloudinary
    await deleteFromCloudinary(publicId, resourceType as "image" | "video")

    return NextResponse.json({ message: "File deleted successfully" })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed", details: (error as any).message }, { status: 500 })
  }
}
