import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v2 as cloudinary } from 'cloudinary'

export const dynamic = "force-dynamic"

// Basic Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  console.log('🚀 UPLOAD API CALLED')
  
  try {
    // Test environment variables
    const hasConfig = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    console.log('Config check:', hasConfig)
    
    if (!hasConfig) {
      console.error('❌ Missing Cloudinary config')
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Test session
    const session = await getServerSession(authOptions)
    console.log('Session check:', !!session)
    
    if (!session) {
      console.error('❌ No session')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Test form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    console.log('File check:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    })
    
    if (!file) {
      console.error('❌ No file')
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Test buffer conversion
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('Buffer created:', buffer.length, 'bytes')

    // UPDATED: Upload to /podcast folder instead of root
    console.log('Starting upload to podcast folder...')
    
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'podcast',           // 🔥 ADDED: Upload to podcast folder
          resource_type: 'video',      // 🔥 ADDED: Specify video resource type
          quality: 'auto',
          format: 'auto',
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            console.error('💥 CLOUDINARY ERROR DETAILS:')
            console.error('Message:', error.message)
            console.error('Name:', error.name)
            console.error('HTTP Code:', error.http_code)
            console.error('Full Error:', JSON.stringify(error, null, 2))
            reject(error)
          } else {
            console.log('✅ SUCCESS - Uploaded to podcast folder:', result?.public_id)
            resolve(result)
          }
        }
      ).end(buffer)
    })

    return NextResponse.json({
      success: true,
      publicId: result.public_id,
      url: result.secure_url,
      folder: 'podcast'  // Confirm folder in response
    })

  } catch (error: any) {
    console.error('🔥 TOP LEVEL ERROR:')
    console.error('Type:', typeof error)
    console.error('Name:', error.name)
    console.error('Message:', error.message)
    console.error('HTTP Code:', error.http_code)
    console.error('Stack:', error.stack)
    console.error('Keys:', Object.keys(error))
    console.error('Full Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))

    return NextResponse.json({ 
      error: "Upload failed",
      message: error.message,
      code: error.http_code,
      type: error.name
    }, { status: error.http_code || 500 })
  }
}
