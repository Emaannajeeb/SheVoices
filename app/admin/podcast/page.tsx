"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Play, Clock, Video, Calendar } from "lucide-react"

interface PodcastVideo {
  id: string
  title: string
  description?: string
  videoUrl: string
  thumbnailUrl?: string
  duration?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminPodcastPage() {
  const { data: session, status } = useSession()
  const [videos, setVideos] = useState<PodcastVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteVideo, setDeleteVideo] = useState<PodcastVideo | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/admin/login")
    }
  }, [status])

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch("/api/podcast")
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
      }
    } catch (error) {
      console.error("Error fetching videos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (video: PodcastVideo) => {
    try {
      const response = await fetch(`/api/podcast/${video.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setVideos(videos.filter((v) => v.id !== video.id))
        setDeleteVideo(null)
      }
    } catch (error) {
      console.error("Error deleting video:", error)
    }
  }

  const toggleActive = async (video: PodcastVideo) => {
    try {
      const response = await fetch(`/api/podcast/${video.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...video,
          isActive: !video.isActive,
        }),
      })

      if (response.ok) {
        const updatedVideo = await response.json()
        setVideos(videos.map((v) => (v.id === video.id ? updatedVideo : v)))
      }
    } catch (error) {
      console.error("Error updating video:", error)
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase())),
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
              Podcast Management
            </h1>
            <p className="text-gray-600">Upload and manage your podcast videos</p>
          </div>
          <Link href="/admin/podcast/upload">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Videos</p>
                  <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
                </div>
                <Video className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{videos.filter((v) => v.isActive).length}</p>
                </div>
                <Play className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-orange-600">{videos.filter((v) => !v.isActive).length}</p>
                </div>
                <Eye className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      videos.filter((v) => {
                        const videoDate = new Date(v.createdAt)
                        const now = new Date()
                        return videoDate.getMonth() === now.getMonth() && videoDate.getFullYear() === now.getFullYear()
                      }).length
                    }
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search videos by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-purple-200 focus:border-purple-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Videos Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Podcast Videos ({filteredVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Video</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVideos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell>
                        <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl || "/placeholder.svg"}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 line-clamp-1">{video.title}</div>
                          {video.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">{video.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {formatDuration(video.duration)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={video.isActive ? "default" : "secondary"}
                          className={video.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                        >
                          {video.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">{new Date(video.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href="/podcast" target="_blank">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/podcast/edit/${video.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleActive(video)}>
                              <Eye className="w-4 h-4 mr-2" />
                              {video.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteVideo(video)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredVideos.length === 0 && (
                <div className="text-center py-12">
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Get started by uploading your first podcast video"}
                  </p>
                  <Link href="/admin/podcast/upload">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Upload First Video
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteVideo} onOpenChange={() => setDeleteVideo(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Podcast Video</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteVideo?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteVideo && handleDelete(deleteVideo)}
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
