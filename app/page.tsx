import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Sparkles, Instagram, Facebook } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-6">
              SheVoices
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Empowering Women Through Stories
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
              A safe digital space where every woman's voice matters. Share your experiences, connect with others, and
              be part of a supportive community that celebrates authenticity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/community">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Join the Conversation
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-full text-lg font-semibold bg-transparent"
              >
                Learn More
              </Button>
            </Link>
          </div>

          {/* Social Media Links */}
          <div className="flex justify-center gap-6 mb-16">
            <a
              href="https://instagram.com/shevoices"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300"
            >
              <Instagram className="w-6 h-6 text-white" />
            </a>
            <a
              href="https://facebook.com/shevoices"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300"
            >
              <Facebook className="w-6 h-6 text-white" />
            </a>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Safe Space</h3>
                <p className="text-gray-600">
                  A supportive environment where you can share authentically without judgment.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Community</h3>
                <p className="text-gray-600">
                  Connect with women from all walks of life and build meaningful relationships.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Empowerment</h3>
                <p className="text-gray-600">
                  Share your story and inspire others while finding strength in shared experiences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 border-0 shadow-2xl rounded-3xl">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Share Your Voice?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Every story matters. Every voice deserves to be heard. Join thousands of women who have found strength,
                support, and sisterhood in our community.
              </p>
              <Link href="/community">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-50 px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Your Journey
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
