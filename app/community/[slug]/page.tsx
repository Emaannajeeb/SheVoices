import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Share2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import ShareButtons from "./share-buttons"

export const dynamic = "force-dynamic"

async function getBlogPost(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug, published: true },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })
    return post
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return null
  }
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/community/${post.slug}`
  const shareText = `Check out this inspiring story: ${post.title}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
            <Calendar className="w-4 h-4 ml-4" />
            <span>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-6">
            {post.title}
          </h1>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-purple-100 text-purple-700">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={post.featuredImage || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        {/* Content */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mb-8">
          <CardContent className="p-8 md:p-12">
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }}
            />
          </CardContent>
        </Card>

        {/* Additional Images */}
        {Array.isArray((post as any).images) && (post as any).images.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(post as any).images.map((url: string) => (
                  <div key={url} className="rounded-xl overflow-hidden shadow">
                    <img src={url} alt={post.title} className="w-full h-48 object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share Buttons */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Share2 className="w-5 h-5 mr-2" />
              Share This Story
            </h3>
            <ShareButtons shareUrl={shareUrl} shareText={shareText} postTitle={post.title} />
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 border-0 shadow-2xl rounded-3xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Inspired by This Story?</h2>
            <p className="text-lg text-white/90 mb-6">
              Join our community and discover more empowering stories from women around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-50 px-6 py-3 rounded-full font-semibold"
                asChild
              >
                <a href="/community">Read More Stories</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-full font-semibold bg-transparent"
                asChild
              >
                <a href="/contact">Share Your Story</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
