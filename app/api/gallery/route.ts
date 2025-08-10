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

    // Determine folder to search
    let folder = "shevoices/gallery"
    if (category && category !== "all") {
      folder = `shevoices/gallery/${category}`
    }

    console.log('Searching folder:', folder)

    // Fetch images from Cloudinary using direct search
    const result = await cloudinary.search
      .expression(`folder:${folder} AND resource_type:image`)
      .sort_by("created_at", "desc")
      .max_results(100)
      .execute()

    console.log(`Found ${result.resources.length} images`)

    // Process images with proper type annotations
    const images: ProcessedImage[] = result.resources
      .filter((resource: CloudinaryResource) => {
        // Only show active/published images
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
          const cat = image.category
          if (!acc[cat]) {
            acc[cat] = []
          }
          acc[cat].push(image)
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
    const hasConfig = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    console.log('Config check:', hasConfig)
    
    if (!hasConfig) {
      console.error('❌ Missing Cloudinary config')
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Authentication check
    const session = await getServerSession(authOptions)
    console.log('Session check:', !!session)
    
    if (!session) {
      console.error('❌ No session')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    console.log('Request body:', body)
    
    const { publicId, title, description, category, isActive = true, published = true, tags = [] } = body

    if (!publicId || !title) {
      console.error('❌ Missing required fields')
      return NextResponse.json({ error: "Public ID and title are required" }, { status: 400 })
    }

    // Create context string in proper format (pipe-separated)
    const contextParts: string[] = []
    if (title && title.trim()) contextParts.push(`title=${encodeURIComponent(title.trim())}`)
    if (description && description.trim()) contextParts.push(`description=${encodeURIComponent(description.trim())}`)
    if (category && category.trim()) contextParts.push(`category=${encodeURIComponent(category.trim())}`)
    contextParts.push(`isActive=${isActive.toString()}`)
    contextParts.push(`published=${published.toString()}`)
    if (Array.isArray(tags) && tags.length > 0) {
      contextParts.push(`tags=${encodeURIComponent(tags.join(','))}`)
    } else if (typeof tags === 'string' && tags.trim()) {
      contextParts.push(`tags=${encodeURIComponent(tags.trim())}`)
    }
    
    const contextString = contextParts.join('|')
    console.log('Context string:', contextString)

    // Update image metadata in Cloudinary
    console.log('Updating metadata for:', publicId)
    
    await cloudinary.api.update(publicId, {
      resource_type: 'image',
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
    }, { status: 200 })

  } catch (error: any) {
    console.error('💥 GALLERY POST ERROR:')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('HTTP code:', error.http_code)
    console.error('Stack trace:', error.stack)
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))

    // Determine appropriate status code and message
    let statusCode = 500
    let errorMessage = "Failed to update gallery image"

    if (error.http_code === 400) {
      statusCode = 400
      errorMessage = error.message || "Bad request to Cloudinary"
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
