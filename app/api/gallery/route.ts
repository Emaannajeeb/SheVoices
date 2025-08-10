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

export async function POST(request: NextRequest) {
  console.log('🚀 GALLERY UPLOAD API CALLED')
  
  try {
    // Step 1: Environment validation
    const envCheck = {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET
    }
    console.log('Environment check:', envCheck)
    
    if (!envCheck.cloud_name || !envCheck.api_key || !envCheck.api_secret) {
      console.error('❌ Missing Cloudinary environment variables')
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Step 2: Authentication check
    const session = await getServerSession(authOptions)
    console.log('Authentication check:', !!session)
    
    if (!session) {
      console.error('❌ Authentication failed')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Step 3: Parse and validate request body
    let body
    try {
      body = await request.json()
      console.log('Request body received:', JSON.stringify(body, null, 2))
    } catch (error) {
      console.error('❌ Failed to parse request body:', error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { publicId, title, description, category, isActive = true, published = true, tags = [] } = body

    // Step 4: Validate required fields
    console.log('Field validation:', {
      hasPublicId: !!publicId,
      hasTitle: !!title,
      publicIdValue: publicId,
      titleValue: title
    })

    if (!publicId || !title) {
      console.error('❌ Missing required fields')
      return NextResponse.json({ 
        error: "Public ID and title are required",
        received: { publicId: !!publicId, title: !!title }
      }, { status: 400 })
    }

    // Step 5: SIMPLIFIED UPDATE - NO CONTEXT PARAMETER
    console.log('Performing simplified Cloudinary update without context...')
    
    try {
      // First, verify the resource exists
      const resourceCheck = await cloudinary.api.resource(publicId, {
        resource_type: 'image'
      })
      console.log('✅ Resource exists:', resourceCheck.public_id)
    } catch (resourceError: any) {
      console.error('❌ Resource not found:', resourceError.message)
      return NextResponse.json({ 
        error: "Image not found in Cloudinary",
        publicId: publicId 
      }, { status: 404 })
    }

    // Perform minimal update - just tags without context
    const updateResult = await cloudinary.api.update(publicId, {
      resource_type: 'image',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',') : [])
      // NO CONTEXT PARAMETER TO AVOID 400 ERROR
    })

    console.log('✅ Update successful:', updateResult.public_id)

    return NextResponse.json({
      message: "Gallery image updated successfully (simplified)",
      publicId,
      title,
      description,
      category,
      isActive,
      published,
      tags,
      warning: "Context metadata not updated due to API limitations"
    }, { status: 200 })

  } catch (error: any) {
    console.error('💥 DETAILED ERROR ANALYSIS:')
    console.error('Error type:', typeof error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('HTTP code:', error.http_code)
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))

    // Extract specific Cloudinary error details
    let statusCode = 500
    let errorMessage = "Failed to update gallery image"
    let cloudinaryDetails = null

    if (error.http_code) {
      statusCode = error.http_code
      cloudinaryDetails = {
        http_code: error.http_code,
        message: error.message,
        error_type: error.name
      }

      switch (error.http_code) {
        case 400:
          errorMessage = `Cloudinary Bad Request: ${error.message}`
          break
        case 401:
          errorMessage = "Cloudinary authentication failed"
          break
        case 404:
          errorMessage = "Resource not found in Cloudinary"
          break
        default:
          errorMessage = `Cloudinary error (${error.http_code}): ${error.message}`
      }
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: error.message,
      cloudinary_error: cloudinaryDetails,
      debug_info: {
        timestamp: new Date().toISOString(),
        error_type: error.name,
        stack_available: !!error.stack
      }
    }, { status: statusCode })
  }
}
