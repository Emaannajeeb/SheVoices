import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Clock, Calendar } from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getPodcastData() {
  try {
    const [video, images] = await Promise.all([
      prisma.podcastVideo.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.galleryImage.findMany({
        where: { isActive: true, category: "podcast" },
        orderBy: { createdAt: "desc" },
      }),
    ])
    return { video, images }
  } catch (error) {
    console.error("Error fetching podcast data:", error)
    return { video: null, images: [] }
  }
}

export default async function PodcastPage() {
  const { video, images } = await getPodcastData()

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

        {/* Featured Video */}
        {video ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl mb-16">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-800 mb-4">{video.title}</CardTitle>
              {video.description && <p className="text-gray-600 max-w-2xl mx-auto">{video.description}</p>}
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg mb-6">
                <video controls poster={video.thumbnailUrl || undefined} className="w-full h-full object-cover">
                  <source src={video.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                {video.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
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

        {/* Photo Gallery */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
              Behind the Scenes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get a glimpse into our podcast recording sessions, community events, and the amazing women who make
              SheVoices possible.
            </p>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <Card
                  key={image.id}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image.imageUrl || "/placeholder.svg"}
                      alt={image.altText || image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-800 text-center">{image.title}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
              <CardContent className="p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Gallery Coming Soon</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We're building our photo gallery to share behind-the-scenes moments and community highlights.
                </p>
              </CardContent>
            </Card>
          )}
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
