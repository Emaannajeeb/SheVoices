"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Video, ArrowLeft, CheckCircle, AlertCircle, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function PodcastUploadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedVideo, setUploadedVideo] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    youtubeUrl: "",
  })

  if (status === "unauthenticated") {
    redirect("/admin/login")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = (url: string): string | null => {
    const videoId = extractYouTubeId(url)
    if (!videoId) return null
    return `https://www.youtube.com/embed/${videoId}`
  }

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (url: string): string | null => {
    const videoId = extractYouTubeId(url)
    if (!videoId) return null
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      toast({
        title: "Title Required",
        description: "Please enter a title for the podcast video",
        variant: "destructive",
      })
      return
    }

    if (!formData.youtubeUrl) {
      toast({
        title: "YouTube URL Required",
        description: "Please enter a YouTube video URL",
        variant: "destructive",
      })
      return
    }

    const videoId = extractYouTubeId(formData.youtubeUrl)
    if (!videoId) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 200)

      const tagsArray = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag)
        : []

      const response = await fetch("/api/podcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          videoUrl: getYouTubeEmbedUrl(formData.youtubeUrl),
          thumbnailUrl: getYouTubeThumbnail(formData.youtubeUrl),
          tags: tagsArray,
          isActive: true,
          category: "podcast",
        }),
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        setUploadedVideo(result)

        toast({
          title: "Video Added Successfully",
          description: "Your YouTube video has been added to the podcast",
        })

        // Reset form
        setFormData({
          title: "",
          description: "",
          tags: "",
          youtubeUrl: "",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to add video")
      }
    } catch (error) {
      console.error("Error adding video:", error)
      toast({
        title: "Failed to Add Video",
        description: (error as any).message || "Failed to add YouTube video",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
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
          <Link href="/admin/podcast">
            <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Podcast
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Add Podcast Video
            </h1>
            <p className="text-gray-600">Add a YouTube video to your podcast</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter video title"
                    className="rounded-xl"
                    required
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube URL *</Label>
                  <Input
                    id="youtubeUrl"
                    name="youtubeUrl"
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="rounded-xl"
                    required
                    disabled={uploading}
                  />
                  <p className="text-sm text-gray-500">
                    Enter a YouTube video URL (e.g., https://www.youtube.com/watch?v=...)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter video description"
                    className="rounded-xl min-h-[100px]"
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Enter tags separated by commas"
                    className="rounded-xl"
                    disabled={uploading}
                  />
                  <p className="text-sm text-gray-500">Separate multiple tags with commas</p>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Adding video...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
                >
                  {uploading ? "Adding Video..." : "Add YouTube Video"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Upload Status */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!uploadedVideo && !uploading && (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No video uploaded yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Fill in the details and select a video file to get started
                  </p>
                </div>
              )}

              {uploading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-purple-600 animate-pulse" />
                  </div>
                  <p className="text-gray-700 font-medium">Adding video...</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait while we add your YouTube video</p>
                </div>
              )}

              {uploadedVideo && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Video Added Successfully!</p>
                      <p className="text-sm text-green-600">YouTube video has been added to the podcast</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-medium">{uploadedVideo.title}</span>
                    </div>
                    {uploadedVideo.videoUrl && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Video URL:</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[200px]">
                          {uploadedVideo.videoUrl}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => router.push("/admin/podcast")}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
                    >
                      View All Videos
                    </Button>
                    <Button
                      onClick={() => window.open("/podcast", "_blank")}
                      variant="outline"
                      className="flex-1 rounded-xl"
                    >
                      View on Site
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Upload Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Supported URLs</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• youtube.com/watch?v=...</li>
                  <li>• youtu.be/...</li>
                  <li>• youtube.com/embed/...</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Requirements</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Valid YouTube video URL</li>
                  <li>• Title is required</li>
                  <li>• Video must be publicly accessible</li>
                  <li>• Videos will be embedded on the podcast page</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
