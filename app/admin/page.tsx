import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Video, ImageIcon, Settings, BarChart3, Plus, Eye, Mail } from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getAdminStats() {
  try {
    const [blogCount, videoCount, imageCount, messageCount, unreadMessageCount] = await Promise.all([
      prisma.blogPost.count({ where: { published: true } }),
      prisma.podcastVideo.count({ where: { isActive: true } }),
      prisma.galleryImage.count({ where: { isActive: true } }),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    ])
    return { blogCount, videoCount, imageCount, messageCount, unreadMessageCount }
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return { blogCount: 0, videoCount: 0, imageCount: 0, messageCount: 0, unreadMessageCount: 0 }
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const stats = await getAdminStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back, {session.user?.name}! Manage your SheVoices platform content and settings.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blog Posts</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.blogCount}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Podcast Videos</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.videoCount}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gallery Images</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.imageCount}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-purple-400 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Contact Messages Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contact Messages</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.messageCount}</p>
                  {stats.unreadMessageCount > 0 && (
                    <p className="text-sm text-red-600 font-medium">
                      {stats.unreadMessageCount} unread
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-600" />
                Blog Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
                asChild
              >
                <a href="/admin/blogs/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Post
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl bg-transparent"
                asChild
              >
                <a href="/admin/blogs">
                  <Eye className="w-4 h-4 mr-2" />
                  Manage Posts
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Video className="w-6 h-6 text-pink-600" />
                Podcast Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white rounded-xl"
                asChild
              >
                <a href="/admin/podcast/upload">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Video
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full border-pink-300 text-pink-600 hover:bg-pink-50 rounded-xl bg-transparent"
                asChild
              >
                <a href="/admin/podcast">
                  <Eye className="w-4 h-4 mr-2" />
                  Manage Videos
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ImageIcon className="w-6 h-6 text-orange-600" />
                Gallery Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white rounded-xl"
                asChild
              >
                <a href="/admin/gallery/upload">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Images
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl bg-transparent"
                asChild
              >
                <a href="/admin/gallery">
                  <Eye className="w-4 h-4 mr-2" />
                  Manage Gallery
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* New Messages Management Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-blue-600" />
                Message Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl bg-transparent"
                asChild
              >
                <a href="/admin/messages">
                  <Eye className="w-4 h-4 mr-2" />
                  View Messages ({stats.messageCount})
                  {stats.unreadMessageCount > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {stats.unreadMessageCount}
                    </Badge>
                  )}
                </a>
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl"
                asChild
              >
                <a href="/contact">
                  <Plus className="w-4 h-4 mr-2" />
                  View Contact Page
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Management Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-gray-600" />
                Site Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage contact information, social media links, and other site settings.
              </p>
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl bg-transparent"
                asChild
              >
                <a href="/admin/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Settings
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View site analytics, user engagement, and content performance metrics.
              </p>
              <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl bg-transparent"
                disabled
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
