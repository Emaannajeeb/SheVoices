"use client"

import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

async function getCategoryImages(category: string) {
  try {
    const images = await prisma.galleryImage.findMany({
      where: {
        category: category.toLowerCase().replace(" ", "-"),
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return images
  } catch (error) {
    console.error("Error fetching category images:", error)
    return []
  }
}

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  const images = await getCategoryImages(decodedCategory)

  if (images.length === 0) {
    notFound()
  }

  const formatCategoryName = (category: string) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const categoryName = formatCategoryName(decodedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/gallery">
            <Button variant="ghost" className="mb-4 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-4">
            {categoryName}
          </h1>
          <p className="text-lg text-gray-600">{images.length} images in this category</p>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {images.map((image) => (
            <Card
              key={image.id}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group cursor-pointer"
              onClick={() => {
                window.open(image.imageUrl, "_blank")
              }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={image.imageUrl || "/placeholder.svg"}
                  alt={image.altText || image.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{image.title}</h3>
                {image.altText && <p className="text-sm text-gray-600 line-clamp-2">{image.altText}</p>}
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="secondary" className="text-xs">
                    {formatCategoryName(image.category)}
                  </Badge>
                  <span className="text-xs text-gray-500">{new Date(image.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back to Gallery */}
        <div className="text-center">
          <Link href="/gallery">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Full Gallery
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
