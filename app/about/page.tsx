import { Card, CardContent } from "@/components/ui/card"
import { Heart, Shield, Sparkles, Target, Globe } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-6">
            About SheVoices
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            We believe every woman has a story worth telling and a voice worth hearing. SheVoices is more than a
            platform—it's a movement to create safe spaces where women can share authentically, connect meaningfully,
            and empower each other.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl mb-12">
          <CardContent className="p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
              To create an inclusive digital sanctuary where women from all backgrounds can share their experiences,
              celebrate their journeys, and find strength in community. We're committed to amplifying voices that have
              been silenced, supporting those who feel alone, and fostering connections that transcend boundaries.
            </p>
          </CardContent>
        </Card>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Safety First</h3>
              <p className="text-gray-700 leading-relaxed">
                We prioritize creating a secure environment where women can express themselves without fear of judgment,
                harassment, or discrimination. Our community guidelines and moderation ensure respectful dialogue.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Inclusivity</h3>
              <p className="text-gray-700 leading-relaxed">
                We celebrate diversity in all its forms. Women of every race, religion, sexual orientation, age,
                ability, and background are welcome here. Our strength lies in our differences and shared experiences.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Authentic Connection</h3>
              <p className="text-gray-700 leading-relaxed">
                We encourage genuine storytelling and meaningful connections. This isn't about perfection—it's about
                real experiences, honest emotions, and the power of vulnerability to create lasting bonds.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Empowerment</h3>
              <p className="text-gray-700 leading-relaxed">
                Every story shared has the power to inspire, heal, and empower others. We believe in the transformative
                power of storytelling to create positive change in individual lives and society as a whole.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Story Section */}
        <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 border-0 shadow-2xl rounded-3xl mb-12">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why SheVoices Matters</h2>
            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              In a world where women's voices are often marginalized or silenced, we're creating a space where every
              story matters. Whether you're sharing a triumph, seeking support through a challenge, or simply wanting to
              connect with others who understand your journey—you belong here.
            </p>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
              10K+
            </div>
            <p className="text-gray-600 font-medium">Stories Shared</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">
              25K+
            </div>
            <p className="text-gray-600 font-medium">Community Members</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent mb-2">
              50+
            </div>
            <p className="text-gray-600 font-medium">Countries</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
              100%
            </div>
            <p className="text-gray-600 font-medium">Safe Space</p>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Add Your Voice?</h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Join thousands of women who have found their community, shared their truth, and discovered the power of
              their voice. Your story could be exactly what someone else needs to hear today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/community"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Join Our Community
              </a>
              <a
                href="/get-involved"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-purple-300 text-purple-600 hover:bg-purple-50 font-semibold rounded-full transition-all duration-300"
              >
                Get Involved
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
