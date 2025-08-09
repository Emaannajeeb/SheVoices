import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCloudinaryResources, updateCloudinaryMetadata, getOptimizedImageUrl } from "@/lib/cloudinary"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    // Determine folder to search
    let folder = "shevoices/gallery"
    if (category && category !== "all") {
      folder = `shevoices/gallery/${category}`
    }

    // Fetch images from Cloudinary
    const resources = await getCloudinaryResources(folder, "image", 100)

    const images = resources
      .filter((resource) => {
        // Only show active/published images
        const isActive = resource.context?.custom?.isActive
        const published = resource.context?.custom?.published
        return (isActive === undefined || isActive === "true") && (published === undefined || published === "true")
      })
      .map((resource) => ({
        id: resource.public_id,
        title: resource.context?.custom?.title || resource.filename || "Untitled Image",
        description: resource.context?.custom?.description || "",
        imageUrl: resource.secure_url,
        thumbnailUrl: getOptimizedImageUrl(resource.public_id, { width: 400, height: 300, crop: "fill" }),
        altText: resource.context?.custom?.title || resource.filename,
        category: resource.context?.custom?.category || category || "general",
        isActive: resource.context?.custom?.isActive !== "false",
        published: resource.context?.custom?.published !== "false",
        createdAt: resource.created_at,
        updatedAt: resource.created_at,
        publicId: resource.public_id,
        format: resource.format,
        bytes: resource.bytes,
        width: resource.width,
        height: resource.height,
        tags: resource.context?.custom?.tags ? resource.context.custom.tags.split(",") : [],
      }))

    // Group by category if no specific category requested
    if (!category) {
      const groupedImages = images.reduce(
        (acc, image) => {
          const cat = image.category
          if (!acc[cat]) {
            acc[cat] = []
          }
          acc[cat].push(image)
          return acc
        },
        {} as Record<string, typeof images>,
      )

      return NextResponse.json({
        images,
        categories: Object.keys(groupedImages),
        groupedImages,
      })
    }

    return NextResponse.json({ images, category })
  } catch (error) {
    console.error("Error fetching gallery images from Cloudinary:", error)
    return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { publicId, title, description, category, isActive = true, published = true, tags = [] } = body

    if (!publicId || !title) {
      return NextResponse.json({ error: "Public ID and title are required" }, { status: 400 })
    }

    // Update image metadata in Cloudinary
    await updateCloudinaryMetadata(publicId, {
      title,
      description: description || "",
      category: category || "general",
      isActive: isActive.toString(),
      published: published.toString(),
      tags: Array.isArray(tags) ? tags.join(",") : tags,
    })

    return NextResponse.json(
      {
        message: "Gallery image metadata updated successfully",
        publicId,
        title,
        description,
        category,
        isActive,
        published,
        tags,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating gallery image metadata:", error)
    return NextResponse.json({ error: "Failed to update gallery image" }, { status: 500 })
  }
}
