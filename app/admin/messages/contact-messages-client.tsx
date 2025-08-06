"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Mail,
  Search,
  Filter,
  Eye,
  Trash2,
  MessageSquare,
  CheckCircle,
  Reply,
  Archive,
  User,
  Calendar,
} from "lucide-react"
import { format } from "date-fns"

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  subject: string | null
  status: "unread" | "read" | "replied" | "archived"
  isRead: boolean
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

interface ContactStats {
  total: number
  unread: number
  read: number
  replied: number
  archived: number
}

export function ContactMessagesClient() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [adminNotes, setAdminNotes] = useState("")

  useEffect(() => {
    fetchMessages()
    fetchStats()
  }, [currentPage, statusFilter, searchTerm])

  const fetchMessages = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/admin/contact-messages?${params}`)
      const data = await response.json()

      if (response.ok) {
        setMessages(data.messages)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/contact-messages/stats")
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const updateMessageStatus = async (messageId: string, status: string, isRead?: boolean) => {
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(typeof isRead === "boolean" && { isRead }),
          ...(adminNotes && { adminNotes }),
        }),
      })

      if (response.ok) {
        fetchMessages()
        fetchStats()
        setSelectedMessage(null)
        setAdminNotes("")
      }
    } catch (error) {
      console.error("Error updating message:", error)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchMessages()
        fetchStats()
      }
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      unread: "bg-red-100 text-red-800 border-red-200",
      read: "bg-blue-100 text-blue-800 border-blue-200",
      replied: "bg-green-100 text-green-800 border-green-200",
      archived: "bg-gray-100 text-gray-800 border-gray-200",
    }

    const icons = {
      unread: <Mail className="w-3 h-3" />,
      read: <Eye className="w-3 h-3" />,
      replied: <Reply className="w-3 h-3" />,
      archived: <Archive className="w-3 h-3" />,
    }

    return (
      <Badge className={`${variants[status as keyof typeof variants]} flex items-center gap-1`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-4">
            Contact Messages
          </h1>
          <p className="text-lg text-gray-600">Manage and respond to messages from your community</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-3xl font-bold text-red-600">{stats.unread}</p>
                </div>
                <Mail className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Read</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.read}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Replied</p>
                  <p className="text-3xl font-bold text-green-600">{stats.replied}</p>
                </div>
                <Reply className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Archived</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.archived}</p>
                </div>
                <Archive className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 rounded-xl border-purple-200">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No messages found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No contact messages have been received yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      message.isRead ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">{message.name}</span>
                          </div>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{message.email}</span>
                          {getStatusBadge(message.status)}
                        </div>

                        <h3 className="font-medium text-gray-900 mb-2">{message.subject || "No Subject"}</h3>

                        <p className="text-gray-700 mb-3 line-clamp-2">{message.message}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(message.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedMessage(message)
                                setAdminNotes(message.adminNotes || "")
                                if (!message.isRead) {
                                  updateMessageStatus(message.id, message.status, true)
                                }
                              }}
                              className="rounded-xl"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Message Details</DialogTitle>
                              <DialogDescription>
                                From {message.name} ({message.email})
                              </DialogDescription>
                            </DialogHeader>

                            {selectedMessage && (
                              <div className="space-y-6">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Subject</Label>
                                  <p className="mt-1 text-gray-900">{selectedMessage.subject || "No Subject"}</p>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Message</Label>
                                  <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Admin Notes</Label>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add internal notes about this message..."
                                    className="mt-1 rounded-xl"
                                    rows={3}
                                  />
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t">
                                  <Button
                                    onClick={() => updateMessageStatus(selectedMessage.id, "read")}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark as Read
                                  </Button>

                                  <Button
                                    onClick={() => updateMessageStatus(selectedMessage.id, "replied")}
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                                  >
                                    <Reply className="w-4 h-4 mr-2" />
                                    Mark as Replied
                                  </Button>

                                  <Button
                                    onClick={() => updateMessageStatus(selectedMessage.id, "archived")}
                                    variant="outline"
                                    className="rounded-xl"
                                  >
                                    <Archive className="w-4 h-4 mr-2" />
                                    Archive
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 rounded-xl bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Message</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this message from {message.name}? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMessage(message.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl"
                >
                  Previous
                </Button>

                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl"
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
