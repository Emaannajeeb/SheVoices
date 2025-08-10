import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"

export const dynamic = "force-dynamic"

// TypeScript interfaces for type safety
interface CloudinaryResource {
  public_id: string
  filename?: string
  display_name?: string
  secure_url: string
  created_at: string
  format: string
  bytes: number
  width?: number
  height?: number
  context?: {
    title?: string
    description?: string
    category?: string
    isActive?: string
    published?: string
    tags?: string
  }
  tags?: string[]
}

interface ProcessedImage {
  id: string
  title: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  altText: string
  category: string
  isActive: boolean
  published: boolean
  createdAt: string
  updatedAt: string
  publicId: string
  format: string
  bytes: number
  width?: number
  height?: number
  tags: string[]
}

interface GroupedImages {
  [category: string]: ProcessedImage[]
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Gallery GET API called')
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    // Simplified search without folder restrictions
    let expression = "resource_type:image"
    if (category && category !== "all") {
      expression += ` AND context.category=${category}`
    }

    console.log('Search expression:', expression)

    const result = await cloudinary.search
      .expression(expression)
      .sort_by("created_at", "desc")
      .max_results(100)
      .execute()

    console.log(`Found ${result.resources.length} images`)

    // Process images with proper type annotations
    const images: ProcessedImage[] = result.resources
      .filter((resource: CloudinaryResource) => {
        const isActive = resource.context?.isActive
        const published = resource.context?.published
        return (isActive === undefined || isActive === "true") && 
               (published === undefined || published === "true")
      })
      .map((resource: CloudinaryResource): ProcessedImage => ({
        id: resource.public_id,
        title: resource.context?.title || resource.filename || "Untitled Image",
        description: resource.context?.description || "",
        imageUrl: resource.secure_url,
        thumbnailUrl: cloudinary.url(resource.public_id, { 
          width: 400, 
          height: 300, 
          crop: "fill",
          quality: "auto"
        }),
        altText: resource.context?.title || resource.filename || "Image",
        category: resource.context?.category || category || "general",
        isActive: resource.context?.isActive !== "false",
        published: resource.context?.published !== "false",
        createdAt: resource.created_at,
        updatedAt: resource.created_at,
        publicId: resource.public_id,
        format: resource.format,
        bytes: resource.bytes,
        width: resource.width,
        height: resource.height,
        tags: resource.context?.tags ? resource.context.tags.split(",") : [],
      }))

    // Group by category if no specific category requested
    if (!category) {
      const groupedImages: GroupedImages = images.reduce(
        (acc: GroupedImages, image: ProcessedImage) => {
          if (!acc[image.category]) {
            acc[image.category] = []
          }
          acc[image.category].push(image)
          return acc
        },
        {} as GroupedImages
      )

      return NextResponse.json({
        images,
        categories: Object.keys(groupedImages),
        groupedImages,
      })
    }

    return NextResponse.json({ images, category })
  } catch (error) {
    console.error("Error fetching gallery images:", error)
    return NextResponse.json({ 
      error: "Failed to fetch gallery images",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 Gallery POST API called')
  
  try {
    // Environment variables check
    const hasConfig = !!(process.env.CLOUDINARY_CLOUD_NAME && 
                        process.env.CLOUDINARY_API_KEY && 
                        process.env.CLOUDINARY_API_SECRET)
    
    if (!hasConfig) {
      console.error('❌ Missing Cloudinary configuration')
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session) {
      console.error('❌ Authentication failed')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    console.log('Request body:', body)
    
    let { publicId, title, imageUrl, description, category, isActive = true, published = true, tags = [] } = body
    
    // FIXED: Extract publicId from imageUrl if publicId is not provided
    if (!publicId && imageUrl) {
      const urlParts = imageUrl.split('/')
      const filename = urlParts[urlParts.length - 1]
      publicId = filename.split('.')[0]
      console.log('Extracted publicId from imageUrl:', publicId)
    }

    if (!publicId || !title) {
      console.error('❌ Missing required fields')
      return NextResponse.json({ 
        error: "Public ID (or image URL) and title are required",
        received: { publicId: !!publicId, title: !!title }
      }, { status: 400 })
    }

    // Create context string in proper pipe-separated format for Cloudinary
    const contextParts = [
      `title=${encodeURIComponent(title)}`,
      `description=${encodeURIComponent(description || "")}`,
      `category=${encodeURIComponent(category || "general")}`,
      `isActive=${isActive.toString()}`,
      `published=${published.toString()}`,
    ]

    if (Array.isArray(tags) && tags.length > 0) {
      contextParts.push(`tags=${encodeURIComponent(tags.join(","))}`)
    } else if (typeof tags === "string" && tags.trim()) {
      contextParts.push(`tags=${encodeURIComponent(tags)}`)
    }

    const contextString = contextParts.join("|")
    console.log('Context string:', contextString)

    // Update metadata in Cloudinary
    console.log('Updating metadata for:', publicId)
    
    await cloudinary.api.update(publicId, {
      resource_type: "image",
      context: contextString, // Use pipe-separated string format
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',') : [])
    })

    console.log('✅ Metadata updated successfully')

    return NextResponse.json({
      message: "Gallery image metadata updated successfully",
      publicId,
      title,
      description,
      category,
      isActive,
      published,
      tags,
    })

  } catch (error: any) {
    console.error('💥 Gallery POST error:', error)
    
    let statusCode = 500
    let errorMessage = "Failed to update gallery image"

    // Handle specific Cloudinary errors
    if (error.http_code === 400) {
      statusCode = 400
      errorMessage = `Cloudinary Bad Request: ${error.message}`
    } else if (error.http_code === 401) {
      statusCode = 401
      errorMessage = "Cloudinary authentication failed"
    } else if (error.http_code === 404) {
      statusCode = 404
      errorMessage = "Image not found in Cloudinary"
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: error.message,
      cloudinary_code: error.http_code
    }, { status: statusCode })
  }
}
