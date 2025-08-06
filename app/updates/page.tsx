import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Instagram, Facebook, ExternalLink, Calendar } from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getSocialUpdates() {
  try {
    const updates = await prisma.socialUpdate.findMany({
      orderBy: { publishedAt: "desc" },
      take: 20,
    })
    return updates
  } catch (error) {
    console.error("Error fetching social updates:", error)
    return []
  }
}

export default async function UpdatesPage() {
  const updates = await getSocialUpdates()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-6">
            Latest Updates
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Stay connected with our latest posts, announcements, and community highlights from our social media
            channels.
          </p>
        </div>

        {/* Social Media Links */}
        <div className="flex justify-center gap-6 mb-12">
          <a
            href="https://instagram.com/shevoices"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300"
          >
            <Instagram className="w-5 h-5" />
            <span className="font-semibold">Follow on Instagram</span>
          </a>
          <a
            href="https://facebook.com/shevoices"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300"
          >
            <Facebook className="w-5 h-5" />
            <span className="font-semibold">Follow on Facebook</span>
          </a>
        </div>

        {/* Updates Feed */}
        {updates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {updates.map((update) => (
              <Card
                key={update.id}
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="secondary"
                      className={`${
                        update.platform === "instagram" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {update.platform === "instagram" ? (
                          <Instagram className="w-3 h-3" />
                        ) : (
                          <Facebook className="w-3 h-3" />
                        )}
                        {update.platform}
                      </div>
                    </Badge>

                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(update.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardHeader>

                {update.imageUrl && (
                  <div className="aspect-square overflow-hidden mx-4 rounded-xl mb-4">
                    <img
                      src={update.imageUrl || "/placeholder.svg"}
                      alt="Social media post"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <CardContent className="pt-0">
                  <p className="text-gray-700 leading-relaxed mb-4 line-clamp-4">{update.content}</p>

                  <a
                    href={update.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm group"
                  >
                    View Original Post
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl mb-12">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Instagram className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Updates Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                We're working on connecting our social media feeds to bring you the latest updates automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://instagram.com/shevoices"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Follow on Instagram
                </a>
                <a
                  href="https://facebook.com/shevoices"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Follow on Facebook
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 border-0 shadow-2xl rounded-3xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Stay Connected</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Don't miss out on our latest stories, community highlights, and empowering content. Follow us on social
              media for daily inspiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://instagram.com/shevoices"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-purple-600 hover:bg-gray-50 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Instagram className="w-5 h-5 mr-2" />
                Instagram
              </a>
              <a
                href="https://facebook.com/shevoices"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white hover:bg-white/10 font-semibold rounded-full transition-all duration-300"
              >
                <Facebook className="w-5 h-5 mr-2" />
                Facebook
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
