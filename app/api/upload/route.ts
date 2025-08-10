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
  console.log('=== UPLOAD API STARTED ===')
  
  try {
    // 1. Environment Variables Check
    const configCheck = {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET
    }
    console.log('Environment check:', configCheck)
    
    if (!configCheck.cloud_name || !configCheck.api_key || !configCheck.api_secret) {
      console.error('❌ Missing Cloudinary environment variables')
      return NextResponse.json({ 
        error: "Server configuration error",
        details: "Missing Cloudinary credentials"
      }, { status: 500 })
    }

    // 2. Authentication Check
    const session = await getServerSession(authOptions)
    if (!session) {
      console.error('❌ Authentication failed')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.log('✅ Authentication successful')

    // 3. Form Data Parsing
    let formData
    try {
      formData = await request.formData()
      console.log('✅ Form data parsed, keys:', Array.from(formData.keys()))
    } catch (error) {
      console.error('❌ Failed to parse form data:', error)
      return NextResponse.json({ 
        error: "Failed to parse form data",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 400 })
    }

    // 4. File Validation
    const file = formData.get("file") as File
    if (!file) {
      console.error('❌ No file in form data')
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log('✅ File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // 5. File Size Check
    if (file.size === 0) {
      console.error('❌ Empty file detected')
      return NextResponse.json({ error: "Empty file provided" }, { status: 400 })
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      console.error('❌ File too large:', file.size)
      return NextResponse.json({ 
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: 100MB` 
      }, { status: 400 })
    }

    // 6. Type Validation
    const type = formData.get("type") as string
    if (!type || !["image", "video", "blog"].includes(type)) {
      console.error('❌ Invalid type:', type)
      return NextResponse.json({ 
        error: `Invalid type: ${type}. Must be image, video, or blog` 
      }, { status: 400 })
    }

    // 7. Buffer Conversion
    let buffer
    try {
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
      console.log('✅ Buffer created, size:', buffer.length)
    } catch (error) {
      console.error('❌ Failed to convert file to buffer:', error)
      return NextResponse.json({ 
        error: "Failed to process file",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 400 })
    }

    // 8. Upload Configuration
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const tags = formData.get("tags") as string

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

    // 9. SIMPLIFIED UPLOAD - NO CONTEXT PARAMETER
    console.log('🚀 Starting Cloudinary upload (simplified)')
    
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      quality: 'auto',
      format: 'auto',
      use_filename: true,
      unique_filename: true,
    }

    console.log('Upload options:', uploadOptions)

    const result = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Upload timeout after 2 minutes'))
      }, 120000)

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          clearTimeout(timeout)
          if (error) {
            console.error('❌ Cloudinary error details:', {
              message: error.message,
              name: error.name,
              http_code: error.http_code,
              error_object: JSON.stringify(error, null, 2)
            })
            reject(error)
          } else {
            console.log('✅ Upload successful:', result?.public_id)
            resolve(result)
          }
        }
      ).end(buffer)
    })

    // 10. Success Response
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
    console.error('💥 COMPREHENSIVE ERROR LOG:')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('HTTP code:', error.http_code)
    console.error('Stack trace:', error.stack)
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))

    // Determine appropriate status code and message
    let statusCode = 500
    let errorMessage = "Upload failed"

    if (error.message?.includes('Empty file')) {
      statusCode = 400
      errorMessage = "Empty file detected"
    } else if (error.http_code === 400) {
      statusCode = 400
      errorMessage = error.message || "Bad request to Cloudinary"
    } else if (error.http_code === 401) {
      statusCode = 401
      errorMessage = "Cloudinary authentication failed"
    } else if (error.message?.includes('timeout')) {
      statusCode = 408
      errorMessage = "Upload timeout"
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: error.message,
      cloudinary_code: error.http_code
    }, { status: statusCode })
  }
}
