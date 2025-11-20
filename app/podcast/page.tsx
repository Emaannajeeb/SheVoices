'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Clock, Calendar, Video, FileVideo, RefreshCw, AlertTriangle } from "lucide-react"

interface PodcastVideo {
  id: string
  title: string
  description?: string
  videoUrl: string
  thumbnailUrl?: string
  duration?: number
  isActive: boolean
  createdAt: string
  publicId: string
  format: string
  bytes: number
  width?: number
  height?: number
  category: string
  tags: string[]
}

export default function PodcastPage() {
  const [videos, setVideos] = useState<PodcastVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<PodcastVideo | null>(null)

  useEffect(() => {
    fetchPodcastData()
  }, [])

  // Set the first video as selected when videos are loaded
  useEffect(() => {
    if (videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0])
    }
  }, [videos, selectedVideo])

  const fetchPodcastData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching podcast data...")

      const response = await fetch("/api/podcast", {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        throw new Error(`Failed to fetch podcast data: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fetched data:", data)
      
      // Ensure data is an array
      const videosArray: PodcastVideo[] = Array.isArray(data) ? data : []
      
      // Filter for active videos only
      const activeVideos = videosArray.filter((video: PodcastVideo) => video.isActive !== false)
      console.log(`Found ${activeVideos.length} active videos out of ${videosArray.length} total`)
      
      setVideos(activeVideos)
    } catch (err) {
      console.error("Error fetching podcast data:", err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Use selectedVideo or default to first video
  const featuredVideo = selectedVideo || (videos.length > 0 ? videos[0] : null)
  
  // Get other videos (excluding the currently selected one)
  const otherVideos = featuredVideo 
    ? videos.filter(v => v.id !== featuredVideo.id)
    : videos.slice(1)

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Podcast Content...</h2>
            <p className="text-gray-600">Please wait while we fetch the latest episodes.</p>
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We're having trouble loading the podcast content. Error: {error}
              </p>
              <button
                onClick={fetchPodcastData}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main Content
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-6">
            SheVoices Podcast
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Listen to inspiring conversations, powerful stories, and meaningful discussions that celebrate women's
            voices and experiences.
          </p>
        </div>

        {/* Debug Info - Development Only */}
        {process.env.NODE_ENV === "development" && (
          <Card className="bg-yellow-50 border-yellow-200 mb-8">
            <CardContent className="p-4">
              <p className="text-sm text-yellow-800">
                Debug: Found {videos.length} active videos, Featured: {featuredVideo ? featuredVideo.title : "None"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Featured Video */}
        {featuredVideo ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl mb-16">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-800 mb-4">{featuredVideo.title}</CardTitle>
              {featuredVideo.description && <p className="text-gray-600 max-w-2xl mx-auto">{featuredVideo.description}</p>}
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg mb-6 bg-black">
                {featuredVideo.videoUrl.includes("youtube.com/embed/") || featuredVideo.videoUrl.includes("youtu.be/") ? (
                  <iframe
                    src={featuredVideo.videoUrl}
                    title={featuredVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    poster={featuredVideo.thumbnailUrl}
                    className="w-full h-full object-contain"
                    preload="metadata"
                    controlsList="nodownload"
                  >
                    <source src={featuredVideo.videoUrl} type={`video/${featuredVideo.format}`} />
                    <source src={featuredVideo.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
                {featuredVideo.duration && featuredVideo.duration > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(featuredVideo.duration)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(featuredVideo.createdAt).toLocaleDateString()}</span>
                </div>
                {featuredVideo.width && featuredVideo.height && (
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    <span>
                      {featuredVideo.width}x{featuredVideo.height}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileVideo className="w-4 h-4" />
                  <span>{formatFileSize(featuredVideo.bytes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="uppercase text-xs font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {featuredVideo.format}
                  </span>
                </div>
              </div>

              {featuredVideo.tags && featuredVideo.tags.length > 0 && featuredVideo.tags[0] !== "" && (
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {featuredVideo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl mb-16">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We're working on bringing you inspiring podcast content. Stay tuned for powerful conversations and
                stories from our community.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Additional Videos */}
        {otherVideos.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
                More Episodes
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our collection of inspiring podcast episodes and conversations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherVideos.map((episode) => (
                <Card
                  key={episode.id}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group cursor-pointer"
                  onClick={() => {
                    setSelectedVideo(episode)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  <div className="aspect-video overflow-hidden relative bg-black">
                    {episode.thumbnailUrl ? (
                      <img
                        src={episode.thumbnailUrl}
                        alt={episode.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          const parent = target.parentElement
                          if (parent) {
                            const fallback = parent.querySelector(".fallback-icon")
                            if (fallback) {
                              fallback.classList.remove("hidden")
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <div className="fallback-icon hidden w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center absolute inset-0">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    {episode.duration && episode.duration > 0 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {formatDuration(episode.duration)}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{episode.title}</h3>
                    {episode.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{episode.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{new Date(episode.createdAt).toLocaleDateString()}</span>
                      <span>{formatFileSize(episode.bytes)}</span>
                    </div>
                    {episode.tags && episode.tags.length > 0 && episode.tags[0] !== "" && (
                      <div className="flex flex-wrap gap-1">
                        {episode.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {tag.trim()}
                          </span>
                        ))}
                        {episode.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{episode.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mb-8">
          <button
            onClick={fetchPodcastData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Content
          </button>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 border-0 shadow-2xl rounded-3xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Want to Be Featured?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Have an inspiring story to share on our podcast? We'd love to hear from you and potentially feature your
              voice in our upcoming episodes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-purple-600 hover:bg-gray-50 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get in Touch
              </a>
              <a
                href="/community"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white hover:bg-white/10 font-semibold rounded-full transition-all duration-300"
              >
                Read Stories
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
