import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ImageModal } from "@/components/image-modal"
import { ArrowLeft, Calendar, Eye, ImageIcon } from "lucide-react"

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
  size: any
}

interface CategoryGalleryData {
  images: GalleryImage[]
  category: string
}

async function getCategoryGalleryData(category: string): Promise<CategoryGalleryData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/gallery?category=${encodeURIComponent(category)}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Failed to fetch category gallery data:", response.status, response.statusText)
      return { images: [], category }
    }

    const data: CategoryGalleryData = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching category gallery data:", error)
    return { images: [], category }
  }
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

interface CategoryGalleryPageProps {
  params: Promise<{ category: string }>
}

export default async function CategoryGalleryPage({ params }: CategoryGalleryPageProps) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  const { images } = await getCategoryGalleryData(decodedCategory)

  if (images.length === 0) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/gallery">
            <Button variant="ghost" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
          </Link>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-6 capitalize">
            {decodedCategory} Gallery
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Explore our collection of {decodedCategory} photos showcasing inspiring moments and community highlights.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-4 py-2">
              {images.length} {images.length === 1 ? "Photo" : "Photos"}
            </Badge>
          </div>
        </div>

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
            {images.map((image) => (
              <Card
                key={image.id}
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={image.thumbnailUrl || "/placeholder.svg"}
                    alt={image.altText}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
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
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{image.title}</h3>
                  {image.description && <p className="text-sm text-gray-600 line-clamp-2 mb-2">{image.description}</p>}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                    <span>{formatFileSize(image.bytes)}</span>
                  </div>
                  {image.width && image.height && (
                    <div className="text-xs text-gray-500 mb-2">
                      {image.width} × {image.height} • {image.format.toUpperCase()}
                    </div>
                  )}
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {image.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {image.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{image.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl mb-16">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Photos Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                We haven't added any photos to the {decodedCategory} category yet. Check back soon for updates!
              </p>
              <Link href="/gallery">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl">
                  Browse Other Categories
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 border-0 shadow-2xl rounded-3xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Share Your {decodedCategory} Photos</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Have photos from {decodedCategory} events or activities? We'd love to feature them in our gallery and
              celebrate our community moments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-50 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Submit Photos
                </Button>
              </Link>
              <Link href="/gallery">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold bg-transparent"
                >
                  Browse All Categories
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
