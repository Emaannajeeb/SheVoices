import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Clock, Calendar, Video, FileVideo } from "lucide-react"
export const dynamic = 'force-dynamic'
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

async function getPodcastData() {
  try {
    // More robust URL handling
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   "http://localhost:3000"
    
    console.log("Fetching podcast data from:", `${baseUrl}/api/podcast`)

    const response = await fetch(`${baseUrl}/api/podcast`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    console.log("Podcast API response status:", response.status)

    if (!response.ok) {
      console.error("Failed to fetch podcast data:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      
      // Return empty data instead of throwing
      return { video: null, videos: [] }
    }

    const data = await response.json()
    console.log("Raw API response:", data)
    
    // Handle both array and object responses
    const videos: PodcastVideo[] = Array.isArray(data) ? data : (data.videos || [])
    console.log("Processed videos:", videos.length)

    // Validate video data structure
    const validVideos = videos.filter((video) => {
      const isValid = video && 
                     typeof video.id === 'string' && 
                     typeof video.title === 'string' &&
                     typeof video.videoUrl === 'string'
      
      if (!isValid) {
        console.warn('Invalid video data:', video)
      }
      return isValid
    })

    // Get only active videos
    const activeVideos = validVideos.filter((video) => video.isActive !== false)
    console.log("Active videos:", activeVideos.length)

    // Get the most recent active video as featured
    const featuredVideo = activeVideos.length > 0 ? activeVideos[0] : null

    return { video: featuredVideo, videos: activeVideos }
  } catch (error) {
    console.error("Error fetching podcast data:", error)
    
    // Return empty data instead of throwing to prevent page crash
    return { video: null, videos: [] }
  }
}


function formatDuration(seconds?: number) {
  if (!seconds) return "Unknown"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export default async function PodcastPage() {
  const { video, videos } = await getPodcastData()

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

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === "development" && (
          <Card className="bg-yellow-50 border-yellow-200 mb-8">
            <CardContent className="p-4">
              <p className="text-sm text-yellow-800">
                Debug: Found {videos.length} active videos, Featured: {video ? video.title : "None"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Featured Video */}
        {video ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl mb-16">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-800 mb-4">{video.title}</CardTitle>
              {video.description && <p className="text-gray-600 max-w-2xl mx-auto">{video.description}</p>}
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg mb-6 bg-black">
                <video
                  controls
                  poster={video.thumbnailUrl}
                  className="w-full h-full object-contain"
                  preload="metadata"
                  controlsList="nodownload"
                >
                  <source src={video.videoUrl} type={`video/${video.format}`} />
                  <source src={video.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
                {video.duration && video.duration > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
                {video.width && video.height && (
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    <span>
                      {video.width}x{video.height}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileVideo className="w-4 h-4" />
                  <span>{formatFileSize(video.bytes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="uppercase text-xs font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {video.format}
                  </span>
                </div>
              </div>

              {video.tags && video.tags.length > 0 && video.tags[0] !== "" && (
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {video.tags.map((tag, index) => (
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
        {videos.length > 1 && (
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
              {videos.slice(1).map((episode) => (
                <Card
                  key={episode.id}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <div className="aspect-video overflow-hidden relative bg-black">
                    {episode.thumbnailUrl ? (
                      <img
                        src={episode.thumbnailUrl || "/placeholder.svg"}
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
