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
    console.log('Timestamp:', new Date().toISOString())
    
    // Check environment variables first
    console.log('Environment variables check:', {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING', 
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING'
    })

    // Log actual values (remove in production)
    console.log('Cloudinary config values:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY?.substring(0, 5) + '...',
      api_secret: process.env.CLOUDINARY_API_SECRET?.substring(0, 5) + '...'
    })

    console.log('Getting session...')
    const session = await getServerSession(authOptions)
    console.log('Session result:', session ? 'AUTHENTICATED' : 'NOT AUTHENTICATED')
    
    if (!session) {
      console.error('❌ Authentication failed')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('✅ Authentication successful')
    console.log('User ID:', session.user?.id)
    console.log('User role:', session.user?.role)

    console.log('Reading form data...')
    const formData = await request.formData()
    console.log('Form data keys:', Array.from(formData.keys()))

    // Log each form field
    const file = formData.get("file") as File
    const type = formData.get("type") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const tags = formData.get("tags") as string

    console.log('Form data values:', {
      file: file ? `${file.name} (${file.size} bytes, ${file.type})` : 'NULL',
      type: type,
      title: title,
      description: description,
      category: category,
      tags: tags
    })

    // Validate file
    if (!file) {
      console.error('❌ No file provided in form data')
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log('✅ File received:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })

    // Validate type
    if (!type || !["image", "video", "blog"].includes(type)) {
      console.error('❌ Invalid type:', type)
      return NextResponse.json({ 
        error: `Invalid type: ${type}. Must be image, video, or blog` 
      }, { status: 400 })
    }

    console.log('✅ Type validation passed:', type)

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size, 'bytes')
      return NextResponse.json({ 
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: 100MB` 
      }, { status: 400 })
    }

    console.log('✅ File size validation passed')

    console.log('Converting file to buffer...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('✅ Buffer created, size:', buffer.length, 'bytes')

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

    console.log('Upload destination:', { folder, resourceType })

    // Create context string
    const contextParts = []
    if (title) contextParts.push(`title=${title}`)
    if (description) contextParts.push(`description=${description}`)
    if (category) contextParts.push(`category=${category}`)
    contextParts.push(`isActive=true`)
    if (tags) contextParts.push(`tags=${tags}`)
    
    const contextString = contextParts.join('|')
    console.log('Context string:', contextString)

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      context: contextString,
      quality: 'auto',
      format: 'auto',
      use_filename: true,
      unique_filename: true,
    }

    console.log('🚀 Starting Cloudinary upload with options:', uploadOptions)

    // Upload to Cloudinary with detailed error handling
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStartTime = Date.now()
      
      // Set a timeout
      const timeout = setTimeout(() => {
        console.error('❌ Upload timeout after 2 minutes')
        reject(new Error('Upload timeout'))
      }, 120000)

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          clearTimeout(timeout)
          const uploadDuration = Date.now() - uploadStartTime
          console.log(`Upload completed in ${uploadDuration}ms`)
          
          if (error) {
            console.error('❌ Cloudinary upload error:')
            console.error('Error message:', error.message)
            console.error('Error name:', error.name)
            console.error('HTTP code:', error.http_code)
            console.error('Full error object:', JSON.stringify(error, null, 2))
            reject(error)
          } else {
            console.log('✅ Cloudinary upload successful!')
            console.log('Result:', JSON.stringify(result, null, 2))
            resolve(result)
          }
        }
      ).end(buffer)
    })

    console.log('🎉 Upload process completed successfully')

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
    console.error('💥 UPLOAD API ERROR:')
    console.error('Error message:', error.message)
    console.error('Error name:', error.name)
    console.error('Error stack:', error.stack)
    
    // Log specific Cloudinary errors
    if (error.http_code) {
      console.error('Cloudinary HTTP code:', error.http_code)
    }
    
    if (error.error && error.error.message) {
      console.error('Cloudinary error message:', error.error.message)
    }

    // Full error object
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))

    // Return different status codes based on error type
    let statusCode = 500
    let errorMessage = "Upload failed"

    if (error.message?.includes('timeout')) {
      statusCode = 408
      errorMessage = "Upload timeout"
    } else if (error.http_code === 400) {
      statusCode = 400
      errorMessage = error.message || "Bad request to Cloudinary"
    } else if (error.http_code === 401) {
      statusCode = 401
      errorMessage = "Cloudinary authentication failed"
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: error.message,
      cloudinary_code: error.http_code
    }, { status: statusCode })
  }
}
