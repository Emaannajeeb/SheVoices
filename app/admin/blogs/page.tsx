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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Calendar, User, FileText } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  author: string
  published: boolean
  createdAt: string
  updatedAt: string
  tags: string[]
  featuredImage?: string
}

export default function AdminBlogsPage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deletePost, setDeletePost] = useState<BlogPost | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/admin/login")
    }
  }, [status])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/blogs")
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || data)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blogs/${post.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== post.id))
        setDeletePost(null)
      }
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const togglePublished = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blogs/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...post,
          published: !post.published,
        }),
      })

      if (response.ok) {
        const updatedPost = await response.json()
        setPosts(posts.map((p) => (p.id === post.id ? updatedPost : p)))
      }
    } catch (error) {
      console.error("Error updating post:", error)
    }
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
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
              Blog Management
            </h1>
            <p className="text-gray-600">Create, edit, and manage your blog posts</p>
          </div>
          <Link href="/admin/blogs/new">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">{posts.filter((p) => p.published).length}</p>
                </div>
                <Eye className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-orange-600">{posts.filter((p) => !p.published).length}</p>
                </div>
                <Edit className="w-8 h-8 text-orange-500" />
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
                      posts.filter((p) => {
                        const postDate = new Date(p.createdAt)
                        const now = new Date()
                        return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear()
                      }).length
                    }
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
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
                  placeholder="Search posts by title, author, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-purple-200 focus:border-purple-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Blog Posts ({filteredPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {post.featuredImage && (
                            <img
                              src={post.featuredImage || "/placeholder.svg"}
                              alt={post.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900 line-clamp-1">{post.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {post.author}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={post.published ? "default" : "secondary"}
                          className={post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                        >
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">{new Date(post.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.tags.length - 2}
                            </Badge>
                          )}
                        </div>
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
                              <Link href={`/community/${post.slug}`} target="_blank">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/blogs/edit/${post.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => togglePublished(post)}>
                              <Eye className="w-4 h-4 mr-2" />
                              {post.published ? "Unpublish" : "Publish"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletePost(post)} className="text-red-600">
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

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first blog post"}
                  </p>
                  <Link href="/admin/blogs/new">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Post
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletePost} onOpenChange={() => setDeletePost(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletePost?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletePost && handleDelete(deletePost)}
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
