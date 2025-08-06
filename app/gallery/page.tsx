"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageModal } from "@/components/image-modal"
import { ImageIcon, ArrowLeft, Home } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface GalleryImage {
  id: string
  title: string
  imageUrl: string
  altText: string | null
  category: string
  createdAt: string
}

export default function CategoryGalleryPage() {
  const params = useParams()
  const category = params.category as string
  const [images, setImages] = useState<GalleryImage[]>([])
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (category) {
      fetchCategoryImages()
    }
  }, [category])

  const fetchCategoryImages = async () => {
    try {
      const response = await fetch(`/api/gallery?category=${category}`)
      const data = await response.json()

      if (response.ok) {
        setImages(data.images || [])
      }
    } catch (error) {
      console.error("Error fetching category images:", error)
    } finally {
      setLoading(false)
    }
  }

  const categoryLabels: { [key: string]: string } = {
    general: "General",
    podcast: "Podcast",
    events: "Events",
    community: "Community",
    workshops: "Workshops",
    testimonials: "Testimonials",
  }

  const categoryLabel = categoryLabels[category] || category

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-purple-600 transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          <span>/</span>
          <Link href="/gallery" className="hover:text-purple-600 transition-colors">
            Gallery
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{categoryLabel}</span>
        </div>

        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="outline"
            asChild
            className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl bg-transparent"
          >
            <Link href="/gallery">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-6">
            {categoryLabel} Gallery
          </h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-lg">
              {images.length} {images.length === 1 ? "Image" : "Images"}
            </Badge>
          </div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Discover our collection of {categoryLabel.toLowerCase()} moments and memories from the SheVoices community.
          </p>
        </div>

        {/* Images Grid */}
        {images.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No {categoryLabel} Images Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We haven't added any {categoryLabel.toLowerCase()} images yet. Check back soon or explore other
                categories!
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-8 py-3"
              >
                <Link href="/gallery">View All Images</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <Card
                key={image.id}
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={image.imageUrl || "/placeholder.svg"}
                    alt={image.altText || image.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{image.title}</h3>
                    <p className="text-sm text-white/80">{new Date(image.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal image={selectedImage} isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} />
        )}
      </div>
    </div>
  )
}
