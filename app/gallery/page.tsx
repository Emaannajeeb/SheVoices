import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageModal } from "@/components/image-modal"
import { Camera, ImageIcon, Eye, Calendar } from "lucide-react"

interface GalleryImage {
  id: string
  title: string
  description?: string
  imageUrl: string
  thumbnailUrl: string
  altText: string
  category: string
  isActive: boolean
  published: boolean
  createdAt: string
  publicId: string
  format: string
  bytes: number
  width?: number
  height?: number
  tags: string[]
}

interface GalleryData {
  images: GalleryImage[]
  categories: string[]
  groupedImages: Record<string, GalleryImage[]>
}

async function getGalleryData(): Promise<GalleryData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/gallery`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Failed to fetch gallery data:", response.status, response.statusText)
      return { images: [], categories: [], groupedImages: {} }
    }

    const data: GalleryData = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching gallery data:", error)
    return { images: [], categories: [], groupedImages: {} }
  }
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export default async function GalleryPage() {
  const { images, categories, groupedImages } = await getGalleryData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-6">
            Photo Gallery
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Explore our collection of inspiring moments, events, and memories captured through the lens of empowerment
            and community.
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => {
                const categoryImages = groupedImages[category] || []
                const previewImage = categoryImages[0]

                return (
                  <Link key={category} href={`/gallery/${category}`}>
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group cursor-pointer">
                      <div className="aspect-square overflow-hidden relative">
                        {previewImage ? (
                          <img
                            src={previewImage.thumbnailUrl || "/placeholder.svg"}
                            alt={`${category} category`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                            <Camera className="w-12 h-12 text-white" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <h3 className="text-white font-semibold text-lg capitalize">{category}</h3>
                          <p className="text-white/80 text-sm">{categoryImages.length} photos</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Images */}
        {images.length > 0 ? (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Recent Photos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.slice(0, 12).map((image) => (
                <Card
                  key={image.id}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={image.thumbnailUrl || "/placeholder.svg"}
                      alt={image.altText}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs">
                        {image.category}
                      </Badge>
                    </div>
                    <ImageModal
                      image={{
                        id: image.id,
                        title: image.title,
                        imageUrl: image.imageUrl,
                        altText: image.altText,
                        description: image.description,
                        category: image.category,
                        createdAt: image.createdAt,
                        tags: image.tags,
                        width: image.width,
                        height: image.height,
                        format: image.format,
                        size: image.bytes,
                      }}
                      trigger={
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                          <Eye className="w-8 h-8 text-white" />
                        </div>
                      }
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{image.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(image.createdAt).toLocaleDateString()}
                      </span>
                      <span>{formatFileSize(image.bytes)}</span>
                    </div>
                    {image.tags && image.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {image.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {image.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{image.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {images.length > 12 && (
              <div className="text-center mt-8">
                <p className="text-gray-600 mb-4">Showing 12 of {images.length} photos</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map((category) => (
                    <Link key={category} href={`/gallery/${category}`}>
                      <Badge
                        variant="outline"
                        className="hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-colors"
                      >
                        View {category} ({groupedImages[category]?.length || 0})
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Gallery Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We're building our photo gallery to share inspiring moments and community highlights. Check back soon
                for amazing photos!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 border-0 shadow-2xl rounded-3xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Share Your Moments</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Have photos from our events or community activities? We'd love to feature them in our gallery and
              celebrate our shared experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-purple-600 hover:bg-gray-50 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Submit Photos
              </a>
              <a
                href="/get-involved"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white hover:bg-white/10 font-semibold rounded-full transition-all duration-300"
              >
                Join Our Events
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
