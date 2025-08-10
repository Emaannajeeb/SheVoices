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
    console.log('=== UPLOAD API CALLED ===')
    
    // Check environment variables
    console.log('Environment check:', {
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET
    })

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

    console.log('Form data received:', {
      hasFile: !!file,
      fileSize: file?.size,
      fileType: file?.type,
      type,
      title,
      category
    })

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

    // FIXED: Create context string in correct format (pipe-separated)
    const contextParts = []
    if (title && title.trim()) contextParts.push(`title=${encodeURIComponent(title.trim())}`)
    if (description && description.trim()) contextParts.push(`description=${encodeURIComponent(description.trim())}`)
    if (category && category.trim()) contextParts.push(`category=${encodeURIComponent(category.trim())}`)
    contextParts.push(`isActive=true`)
    if (tags && tags.trim()) contextParts.push(`tags=${encodeURIComponent(tags.trim())}`)
    
    const contextString = contextParts.join('|')

    console.log('Upload configuration:', {
      folder,
      resourceType,
      contextString,
      bufferSize: buffer.length
    })

    // Upload to Cloudinary with corrected parameters
    const result = await new Promise<any>((resolve, reject) => {
      const uploadOptions: any = {
        folder,
        resource_type: resourceType,
        quality: 'auto',
        format: 'auto',
        use_filename: true,
        unique_filename: true,
      }

      // Only add context if we have context data
      if (contextString && contextString.trim()) {
        uploadOptions.context = contextString
      }

      console.log('Cloudinary upload options:', uploadOptions)

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', {
              message: error.message,
              name: error.name,
              http_code: error.http_code,
              error: JSON.stringify(error, null, 2)
            })
            reject(error)
          } else {
            console.log('✅ Upload successful:', result?.public_id)
            resolve(result)
          }
        }
      ).end(buffer)
    })

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
  } catch (error: any) {
    console.error('💥 UPLOAD ERROR:', {
      message: error.message,
      name: error.name,
      http_code: error.http_code,
      stack: error.stack
    })

    // Return specific error based on type
    let statusCode = 500
    let errorMessage = "Upload failed"

    if (error.http_code === 400) {
      statusCode = 400
      errorMessage = error.message || "Invalid request parameters"
    } else if (error.http_code === 401) {
      statusCode = 401
      errorMessage = "Cloudinary authentication failed"
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: error.message,
      cloudinary_error: error.http_code
    }, { status: statusCode })
  }
}
