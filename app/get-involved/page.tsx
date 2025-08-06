import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, Megaphone, HandHeart, Mail, Calendar } from "lucide-react"

export default function GetInvolvedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-6">
            Get Involved
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            There are many ways to support the SheVoices community and help us create a more inclusive world where every
            woman's voice is heard and valued.
          </p>
        </div>

        {/* Ways to Get Involved */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Become a Mentor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Share your experience and wisdom with other women in our community. Help guide someone through
                challenges you've overcome and be the support you wish you had.
              </p>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full">
                Apply to Mentor
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full flex items-center justify-center mb-4">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Community Ambassador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Help spread the word about SheVoices in your networks. Organize local meetups, share our mission on
                social media, and help other women discover our community.
              </p>
              <Button className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white rounded-full">
                Become Ambassador
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
                <HandHeart className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Volunteer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Contribute your skills to help SheVoices grow. Whether you're a designer, writer, developer, or have
                other talents, we can use your help to make our platform even better.
              </p>
              <Button className="bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white rounded-full">
                Volunteer With Us
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Support Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Help us keep SheVoices free and accessible to all women. Your donation supports our platform, community
                programs, and initiatives to reach underserved communities.
              </p>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full">
                Make a Donation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl mb-12">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-gray-800">Upcoming Events</CardTitle>
            <p className="text-gray-600 mt-2">Join us for these special community events</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-l-4 border-purple-400 pl-6 py-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Women in Leadership Workshop</h3>
              <p className="text-gray-600 mb-2">March 15, 2024 • 2:00 PM EST • Virtual</p>
              <p className="text-gray-700">
                Join successful women leaders as they share strategies for advancing your career and overcoming
                workplace challenges.
              </p>
            </div>

            <div className="border-l-4 border-pink-400 pl-6 py-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Storytelling Circle</h3>
              <p className="text-gray-600 mb-2">March 22, 2024 • 7:00 PM EST • Virtual</p>
              <p className="text-gray-700">
                A safe space to practice sharing your story with a small group of supportive women before posting to the
                larger community.
              </p>
            </div>

            <div className="border-l-4 border-orange-400 pl-6 py-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Mental Health & Wellness Panel</h3>
              <p className="text-gray-600 mb-2">April 5, 2024 • 1:00 PM EST • Virtual</p>
              <p className="text-gray-700">
                Mental health professionals discuss strategies for maintaining wellness and supporting others in our
                community.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 border-0 shadow-2xl rounded-3xl">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Have Questions?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We'd love to hear from you! Whether you want to get involved, have suggestions, or just want to connect,
              don't hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-50 px-8 py-3 rounded-full font-semibold"
              >
                Contact Us
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold bg-transparent"
              >
                Join Our Newsletter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
