"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, ImageIcon, Calendar, Filter } from "lucide-react"

interface GalleryImage {
  id: string
  title: string
  imageUrl: string
  altText?: string
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const categories = ["general", "podcast", "events", "community", "behind-scenes"]

export default function AdminGalleryPage() {
  const { data: session, status } = useSession()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [deleteImage, setDeleteImage] = useState<GalleryImage | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/admin/login")
    }
  }, [status])

  useEffect(() => {
    fetchImages()
  }, [selectedCategory])

  const fetchImages = async () => {
    try {
      const url = selectedCategory === "all" ? "/api/gallery" : `/api/gallery?category=${selectedCategory}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setImages(data)
      }
    } catch (error) {
      console.error("Error fetching images:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (image: GalleryImage) => {
    try {
      const response = await fetch(`/api/gallery/${image.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setImages(images.filter((img) => img.id !== image.id))
        setDeleteImage(null)
      }
    } catch (error) {
      console.error("Error deleting image:", error)
    }
  }

  const toggleActive = async (image: GalleryImage) => {
    try {
      const response = await fetch(`/api/gallery/${image.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...image,
          isActive: !image.isActive,
        }),
      })

      if (response.ok) {
        const updatedImage = await response.json()
        setImages(images.map((img) => (img.id === image.id ? updatedImage : img)))
      }
    } catch (error) {
      console.error("Error updating image:", error)
    }
  }

  const filteredImages = images.filter(
    (image) =>
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (image.altText && image.altText.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">
              Gallery Management
            </h1>
            <p className="text-gray-600">Upload and manage your photo gallery</p>
          </div>
          <Link href="/admin/gallery/upload">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Upload Images
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Images</p>
                  <p className="text-2xl font-bold text-gray-900">{images.length}</p>
                </div>
                <ImageIcon className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{images.filter((img) => img.isActive).length}</p>
                </div>
                <Eye className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-blue-600">{new Set(images.map((img) => img.category)).size}</p>
                </div>
                <Filter className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {
                      images.filter((img) => {
                        const imageDate = new Date(img.createdAt)
                        const now = new Date()
                        return imageDate.getMonth() === now.getMonth() && imageDate.getFullYear() === now.getFullYear()
                      }).length
                    }
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search images by title or alt text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-purple-200 focus:border-purple-400"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 rounded-xl border-purple-200">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Images Grid */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Gallery Images ({filteredImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={image.imageUrl || "/placeholder.svg"}
                        alt={image.altText || image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-1 flex-1">{image.title}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(image.imageUrl, "_blank")}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Full Size
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/gallery/edit/${image.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleActive(image)}>
                              <Eye className="w-4 h-4 mr-2" />
                              {image.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteImage(image)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {image.category.replace("-", " ")}
                        </Badge>
                        <Badge
                          variant={image.isActive ? "default" : "secondary"}
                          className={`text-xs ${image.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {image.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">{new Date(image.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filter"
                    : "Get started by uploading your first images"}
                </p>
                <Link href="/admin/gallery/upload">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Images
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteImage} onOpenChange={() => setDeleteImage(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Image</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteImage?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteImage && handleDelete(deleteImage)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
