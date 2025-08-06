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
import { Badge } from "@/components/ui/badge"
import { Save, Eye, Upload, X, Plus, ArrowLeft, FileText } from "lucide-react"

export default function NewBlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [newTag, setNewTag] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    published: false,
    featuredImage: "",
    tags: [] as string[],
  })

  if (status === "unauthenticated") {
    redirect("/admin/login")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const post = await response.json()
        router.push("/admin/blogs")
      } else {
        console.error("Failed to create post")
      }
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", "blog")

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({ ...prev, featuredImage: data.url }))
      }
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setImageUploading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handlePreview = () => {
    // Store draft in localStorage for preview
    localStorage.setItem("blogPreview", JSON.stringify(formData))
    window.open("/admin/blogs/preview", "_blank")
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
              Create New Blog Post
            </h1>
            <p className="text-gray-600">Share your story with the SheVoices community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Post Title
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Enter your blog post title..."
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="text-lg rounded-xl border-purple-200 focus:border-purple-400"
                    required
                  />
                </CardContent>
              </Card>

              {/* Content */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Write your blog post content here. Share your story, experiences, and insights..."
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    className="min-h-[400px] rounded-xl border-purple-200 focus:border-purple-400 resize-none"
                    required
                  />
                </CardContent>
              </Card>

              {/* Excerpt */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>Excerpt</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Write a brief excerpt that will appear in the blog listing..."
                    value={formData.excerpt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                    className="h-24 rounded-xl border-purple-200 focus:border-purple-400 resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    If left empty, the first 200 characters of your content will be used.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>Publish Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="published" className="text-sm font-medium">
                      Publish immediately
                    </Label>
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, published: checked }))}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.published
                      ? "This post will be visible to the public"
                      : "This post will be saved as a draft"}
                  </p>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.featuredImage ? (
                    <div className="space-y-4">
                      <img
                        src={formData.featuredImage || "/placeholder.svg"}
                        alt="Featured"
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData((prev) => ({ ...prev, featuredImage: "" }))}
                        className="w-full rounded-xl"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="featured-image"
                      />
                      <Label
                        htmlFor="featured-image"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-purple-400 mb-2" />
                        <span className="text-sm text-purple-600">
                          {imageUploading ? "Uploading..." : "Upload Featured Image"}
                        </span>
                      </Label>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      className="rounded-xl border-purple-200 focus:border-purple-400"
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      size="sm"
                      className="bg-purple-500 hover:bg-purple-600 rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-purple-100 text-purple-700 hover:bg-purple-200"
                        >
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-purple-900">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardContent className="pt-6 space-y-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : formData.published ? "Publish Post" : "Save Draft"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl bg-transparent"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
