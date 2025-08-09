import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryResource {
  public_id: string
  secure_url: string
  url: string
  width?: number
  height?: number
  format: string
  resource_type: string
  bytes: number
  duration?: number
  created_at: string
  folder: string
  filename: string
  context?: {
    custom?: {
      title?: string
      description?: string
      category?: string
      isActive?: string
      published?: string
      tags?: string
    }
  }
}

export interface UploadResult {
  public_id: string
  secure_url: string
  url: string
  width?: number
  height?: number
  format: string
  resource_type: string
  bytes: number
  duration?: number
}

// Upload file to Cloudinary
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string
    resource_type?: "image" | "video" | "auto"
    public_id?: string
    context?: Record<string, string>
  } = {},
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: options.resource_type || "auto",
      folder: options.folder || "shevoices",
      public_id: options.public_id,
      context: options.context,
      quality: "auto",
      fetch_format: "auto",
    }

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            url: result.url,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type,
            bytes: result.bytes,
            duration: result.duration,
          })
        } else {
          reject(new Error("Upload failed"))
        }
      })
      .end(buffer)
  })
}

// Get resources from Cloudinary folder
export async function getCloudinaryResources(
  folder: string,
  resourceType: "image" | "video" = "image",
  maxResults = 50,
): Promise<CloudinaryResource[]> {
  try {
    const result = await cloudinary.search
      .expression(`folder:${folder} AND resource_type:${resourceType}`)
      .sort_by("created_at", "desc")
      .with_field("context")
      .max_results(maxResults)
      .execute()

    return result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      url: resource.url,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      resource_type: resource.resource_type,
      bytes: resource.bytes,
      duration: resource.duration,
      created_at: resource.created_at,
      folder: resource.folder,
      filename: resource.filename,
      context: resource.context,
    }))
  } catch (error) {
    console.error("Error fetching Cloudinary resources:", error)
    return []
  }
}

// Update resource metadata
export async function updateCloudinaryMetadata(publicId: string, metadata: Record<string, string>) {
  try {
    await cloudinary.uploader.update_metadata(metadata, [publicId])
  } catch (error) {
    console.error("Error updating Cloudinary metadata:", error)
    throw error
  }
}

// Delete resource from Cloudinary
export async function deleteFromCloudinary(publicId: string, resourceType: "image" | "video" = "image") {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    throw error
  }
}

// Get video thumbnail
export function getVideoThumbnail(publicId: string, options: { width?: number; height?: number } = {}) {
  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    quality: "auto",
    transformation: [
      {
        width: options.width || 640,
        height: options.height || 360,
        crop: "fill",
      },
    ],
  })
}

// Get optimized image URL
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string
  } = {},
) {
  return cloudinary.url(publicId, {
    quality: options.quality || "auto",
    fetch_format: "auto",
    width: options.width,
    height: options.height,
    crop: options.crop || "fill",
  })
}

export default cloudinary
