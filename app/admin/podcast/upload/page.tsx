"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Video, ImageIcon, Save, Play, X } from "lucide-react"

export default function UploadPodcastPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [videoUploading, setVideoUploading] = useState(false)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    duration: 0,
    isActive: true,
  })

  if (status === "unauthenticated") {
    redirect("/admin/login")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/podcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/podcast")
      } else {
        console.error("Failed to upload video")
      }
    } catch (error) {
      console.error("Error uploading video:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("video/")) {
      alert("Please select a video file")
      return
    }

    // Validate file size (50MB limit for videos)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      alert("Video file is too large. Maximum size is 50MB")
      return
    }

    setVideoUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", "podcast")

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({
          ...prev,
          videoUrl: data.url,
          // Try to extract duration from video metadata if available
          duration: 0, // You might want to implement video duration extraction
        }))
        setUploadProgress(100)
      }
    } catch (error) {
      console.error("Error uploading video:", error)
    } finally {
      setVideoUploading(false)
    }
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    setThumbnailUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", "podcast")

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({ ...prev, thumbnailUrl: data.url }))
      }
    } catch (error) {
      console.error("Error uploading thumbnail:", error)
    } finally {
      setThumbnailUploading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Upload Podcast Video
            </h1>
            <p className="text-gray-600">Share your podcast content with the community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Upload */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Video File
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.videoUrl ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-black rounded-xl overflow-hidden">
                        <video
                          src={formData.videoUrl}
                          controls
                          className="w-full h-full"
                          poster={formData.thumbnailUrl}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData((prev) => ({ ...prev, videoUrl: "" }))}
                        className="w-full rounded-xl"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove Video
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <Label
                        htmlFor="video-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors"
                      >
                        <Video className="w-12 h-12 text-purple-400 mb-4" />
                        <span className="text-lg font-medium text-purple-600 mb-2">
                          {videoUploading ? "Uploading..." : "Upload Video File"}
                        </span>
                        <span className="text-sm text-gray-500">MP4, WebM up to 50MB</span>
                      </Label>

                      {videoUploading && (
                        <div className="mt-4">
                          <Progress value={uploadProgress} className="w-full" />
                          <p className="text-sm text-gray-500 mt-2 text-center">Uploading... {uploadProgress}%</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Video Details */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>Video Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter video title..."
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="rounded-xl border-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your podcast video..."
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="h-24 rounded-xl border-purple-200 focus:border-purple-400 resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="Video duration in seconds"
                      value={formData.duration || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: Number.parseInt(e.target.value) || 0,
                        }))
                      }
                      className="rounded-xl border-purple-200 focus:border-purple-400"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Optional: Enter the video duration for better user experience
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Thumbnail */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Thumbnail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.thumbnailUrl ? (
                    <div className="space-y-4">
                      <img
                        src={formData.thumbnailUrl || "/placeholder.svg"}
                        alt="Thumbnail"
                        className="w-full aspect-video object-cover rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData((prev) => ({ ...prev, thumbnailUrl: "" }))}
                        className="w-full rounded-xl"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove Thumbnail
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <Label
                        htmlFor="thumbnail-upload"
                        className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors"
                      >
                        <ImageIcon className="w-8 h-8 text-purple-400 mb-2" />
                        <span className="text-sm text-purple-600">
                          {thumbnailUploading ? "Uploading..." : "Upload Thumbnail"}
                        </span>
                      </Label>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Settings */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive" className="text-sm font-medium">
                      Make video active
                    </Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.isActive
                      ? "This video will be visible on the podcast page"
                      : "This video will be hidden from the public"}
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardContent className="pt-6 space-y-3">
                  <Button
                    type="submit"
                    disabled={loading || !formData.videoUrl || !formData.title}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Uploading..." : "Upload Video"}
                  </Button>

                  {formData.videoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.open("/podcast", "_blank")}
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Preview Page
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
