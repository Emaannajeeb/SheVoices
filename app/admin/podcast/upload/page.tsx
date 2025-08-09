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
import { Upload, Video, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select a video file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select a video file smaller than 100MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("type", "video")
      uploadFormData.append("title", formData.title || file.name)
      uploadFormData.append("description", formData.description)
      uploadFormData.append("category", "podcast")
      uploadFormData.append("tags", formData.tags)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 500)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        setUploadedVideo(result)

        toast({
          title: "Upload Successful",
          description: "Your podcast video has been uploaded to Cloudinary",
        })

        // Reset form
        setFormData({
          title: "",
          description: "",
          tags: "",
        })

        // Reset file input
        e.target.value = ""
      } else {
        const error = await response.json()
        throw new Error(error.message || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: (error as any).message || "Failed to upload video",
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
              Upload Podcast Video
            </h1>
            <p className="text-gray-600">Upload your podcast video to Cloudinary</p>
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
            <CardContent className="space-y-6">
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
                />
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
                />
                <p className="text-sm text-gray-500">Separate multiple tags with commas</p>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="video">Video File *</Label>
                <div className="border-2 border-dashed border-purple-200 rounded-xl p-8 text-center hover:border-purple-300 transition-colors">
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="video"
                    className={`cursor-pointer flex flex-col items-center gap-4 ${
                      uploading ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        {uploading ? "Uploading..." : "Click to upload video"}
                      </p>
                      <p className="text-sm text-gray-500">MP4, MOV, AVI up to 100MB</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading to Cloudinary...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
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
                  <p className="text-gray-700 font-medium">Uploading to Cloudinary...</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait while we process your video</p>
                </div>
              )}

              {uploadedVideo && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Upload Successful!</p>
                      <p className="text-sm text-green-600">Video uploaded to Cloudinary</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Public ID:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{uploadedVideo.publicId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Format:</span>
                      <span className="uppercase">{uploadedVideo.format}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span>{(uploadedVideo.bytes / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                    {uploadedVideo.duration && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span>
                          {Math.floor(uploadedVideo.duration / 60)}:
                          {(uploadedVideo.duration % 60).toString().padStart(2, "0")}
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
                <h4 className="font-medium text-gray-800 mb-2">Supported Formats</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• MP4 (recommended)</li>
                  <li>• MOV</li>
                  <li>• AVI</li>
                  <li>• WebM</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Requirements</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Maximum file size: 100MB</li>
                  <li>• Recommended resolution: 1080p</li>
                  <li>• Title is required</li>
                  <li>• Videos are automatically optimized</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
