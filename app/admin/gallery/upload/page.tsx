"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ImageIcon, Save, X, Eye } from "lucide-react"

interface UploadedImage {
  id: string
  file: File
  url: string
  title: string
  altText: string
  category: string
  isActive: boolean
  uploading: boolean
  uploaded: boolean
}

const categories = [
  { value: "general", label: "General" },
  { value: "podcast", label: "Podcast" },
  { value: "events", label: "Events" },
  { value: "community", label: "Community" },
  { value: "behind-scenes", label: "Behind the Scenes" },
]

export default function UploadGalleryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  if (status === "unauthenticated") {
    redirect("/admin/login")
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`)
        return
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is 10MB`)
        return
      }

      const id = Math.random().toString(36).substring(7)
      const url = URL.createObjectURL(file)

      const newImage: UploadedImage = {
        id,
        file,
        url,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        altText: "",
        category: "general",
        isActive: true,
        uploading: false,
        uploaded: false,
      }

      setImages((prev) => [...prev, newImage])
    })

    // Reset input
    e.target.value = ""
  }, [])

  const updateImage = (id: string, updates: Partial<UploadedImage>) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...updates } : img)))
  }

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.url)
      }
      return prev.filter((img) => img.id !== id)
    })
  }

  const uploadSingleImage = async (image: UploadedImage): Promise<boolean> => {
    updateImage(image.id, { uploading: true })

    try {
      // Upload file
      const formData = new FormData()
      formData.append("file", image.file)
      formData.append("category", "gallery")

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file")
      }

      const uploadData = await uploadResponse.json()

      // Save to database
      const saveResponse = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: image.title,
          imageUrl: uploadData.url,
          altText: image.altText,
          category: image.category,
          isActive: image.isActive,
        }),
      })

      if (!saveResponse.ok) {
        throw new Error("Failed to save image data")
      }

      updateImage(image.id, { uploading: false, uploaded: true })
      return true
    } catch (error) {
      console.error("Error uploading image:", error)
      updateImage(image.id, { uploading: false })
      return false
    }
  }

  const handleUploadAll = async () => {
    if (images.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    const unuploadedImages = images.filter((img) => !img.uploaded)
    let completed = 0

    for (const image of unuploadedImages) {
      await uploadSingleImage(image)
      completed++
      setUploadProgress((completed / unuploadedImages.length) * 100)
    }

    setUploading(false)

    // Check if all images were uploaded successfully
    const allUploaded = images.every((img) => img.uploaded)
    if (allUploaded) {
      router.push("/admin/gallery")
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Upload Gallery Images
            </h1>
            <p className="text-gray-600">Add multiple images to your gallery</p>
          </div>
        </div>

        {/* Upload Area */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Select Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <Label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors"
              >
                <ImageIcon className="w-12 h-12 text-purple-400 mb-4" />
                <span className="text-lg font-medium text-purple-600 mb-2">Click to select images</span>
                <span className="text-sm text-gray-500">JPG, PNG, GIF up to 10MB each</span>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Images List */}
        {images.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Images to Upload ({images.length})</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.open("/gallery", "_blank")} className="rounded-xl">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Gallery
                </Button>
                <Button
                  onClick={handleUploadAll}
                  disabled={uploading || images.every((img) => img.uploaded)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {uploading && (
                <div className="mb-6">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Uploading images... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`flex gap-4 p-4 border rounded-xl ${
                      image.uploaded
                        ? "border-green-200 bg-green-50"
                        : image.uploading
                          ? "border-blue-200 bg-blue-50"
                          : "border-gray-200"
                    }`}
                  >
                    {/* Image Preview */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Image Details */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`title-${image.id}`} className="text-sm">
                          Title
                        </Label>
                        <Input
                          id={`title-${image.id}`}
                          value={image.title}
                          onChange={(e) => updateImage(image.id, { title: e.target.value })}
                          className="rounded-lg"
                          disabled={image.uploading || image.uploaded}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`alt-${image.id}`} className="text-sm">
                          Alt Text
                        </Label>
                        <Input
                          id={`alt-${image.id}`}
                          value={image.altText}
                          onChange={(e) => updateImage(image.id, { altText: e.target.value })}
                          placeholder="Describe the image..."
                          className="rounded-lg"
                          disabled={image.uploading || image.uploaded}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Category</Label>
                        <Select
                          value={image.category}
                          onValueChange={(value) => updateImage(image.id, { category: value })}
                          disabled={image.uploading || image.uploaded}
                        >
                          <SelectTrigger className="rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={image.isActive}
                            onCheckedChange={(checked) => updateImage(image.id, { isActive: checked })}
                            disabled={image.uploading || image.uploaded}
                          />
                          <Label className="text-sm">Active</Label>
                        </div>

                        {!image.uploaded && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(image.id)}
                            disabled={image.uploading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                      {image.uploaded && <div className="text-green-600 text-sm font-medium">✓ Uploaded</div>}
                      {image.uploading && <div className="text-blue-600 text-sm font-medium">Uploading...</div>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Upload Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Image Requirements</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Supported formats: JPG, PNG, GIF</li>
                  <li>• Maximum file size: 10MB per image</li>
                  <li>• Recommended resolution: 1200x800px or higher</li>
                  <li>• Square images work best for gallery grid</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use descriptive titles for better organization</li>
                  <li>• Add alt text for accessibility</li>
                  <li>• Choose appropriate categories</li>
                  <li>• Only activate images ready for public viewing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
