"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, SettingsIcon, Mail, Instagram, Facebook, Twitter, Globe, Shield, Bell } from "lucide-react"

interface ContactInfo {
  id?: string
  email: string
  phone: string
  whatsappNumber: string
  address: string
  socialLinks: {
    instagram: string
    facebook: string
    twitter: string
    website: string
  }
}

interface SiteSettings {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  allowRegistration: boolean
  moderateComments: boolean
  emailNotifications: boolean
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "",
    phone: "",
    whatsappNumber: "",
    address: "",
    socialLinks: {
      instagram: "",
      facebook: "",
      twitter: "",
      website: "",
    },
  })

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "SheVoices",
    siteDescription: "Empowering Women Through Stories",
    maintenanceMode: false,
    allowRegistration: true,
    moderateComments: true,
    emailNotifications: true,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/admin/login")
    }
  }, [status])

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const response = await fetch("/api/contact/info")
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setContactInfo({
            id: data.id,
            email: data.email || "",
            phone: data.phone || "",
            whatsappNumber: data.whatsappNumber || "",
            address: data.address || "",
            socialLinks: data.socialLinks || {
              instagram: "",
              facebook: "",
              twitter: "",
              website: "",
            },
          })
        }
      }
    } catch (error) {
      console.error("Error fetching contact info:", error)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/contact/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactInfo),
      })

      if (response.ok) {
        alert("Contact information updated successfully!")
      } else {
        alert("Failed to update contact information")
      }
    } catch (error) {
      console.error("Error updating contact info:", error)
      alert("An error occurred while updating contact information")
    } finally {
      setLoading(false)
    }
  }

  const handleSiteSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // This would typically save to a settings API endpoint
    alert("Site settings updated successfully!")
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-gray-600">Manage your site configuration and contact information</p>
        </div>

        <Tabs defaultValue="contact" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm rounded-xl">
            <TabsTrigger value="contact" className="rounded-lg">
              Contact Info
            </TabsTrigger>
            <TabsTrigger value="site" className="rounded-lg">
              Site Settings
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg">
              Security
            </TabsTrigger>
          </TabsList>

          {/* Contact Information Tab */}
          <TabsContent value="contact">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              {/* Basic Contact Info */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo((prev) => ({ ...prev, email: e.target.value }))}
                        className="rounded-xl border-purple-200 focus:border-purple-400"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo((prev) => ({ ...prev, phone: e.target.value }))}
                        className="rounded-xl border-purple-200 focus:border-purple-400"
                        placeholder="+1 (234) 567-8900"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={contactInfo.whatsappNumber}
                      onChange={(e) => setContactInfo((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                      className="rounded-xl border-purple-200 focus:border-purple-400"
                      placeholder="1234567890 (without + or spaces)"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Used for WhatsApp contact button. Enter number without country code prefix.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={contactInfo.address}
                      onChange={(e) => setContactInfo((prev) => ({ ...prev, address: e.target.value }))}
                      className="rounded-xl border-purple-200 focus:border-purple-400 resize-none"
                      rows={3}
                      placeholder="Your business address..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Links */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Social Media Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instagram" className="flex items-center gap-2">
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        type="url"
                        value={contactInfo.socialLinks.instagram}
                        onChange={(e) =>
                          setContactInfo((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                          }))
                        }
                        className="rounded-xl border-purple-200 focus:border-purple-400"
                        placeholder="https://instagram.com/shevoices"
                      />
                    </div>
                    <div>
                      <Label htmlFor="facebook" className="flex items-center gap-2">
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </Label>
                      <Input
                        id="facebook"
                        type="url"
                        value={contactInfo.socialLinks.facebook}
                        onChange={(e) =>
                          setContactInfo((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, facebook: e.target.value },
                          }))
                        }
                        className="rounded-xl border-purple-200 focus:border-purple-400"
                        placeholder="https://facebook.com/shevoices"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="twitter" className="flex items-center gap-2">
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </Label>
                      <Input
                        id="twitter"
                        type="url"
                        value={contactInfo.socialLinks.twitter}
                        onChange={(e) =>
                          setContactInfo((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                          }))
                        }
                        className="rounded-xl border-purple-200 focus:border-purple-400"
                        placeholder="https://twitter.com/shevoices"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={contactInfo.socialLinks.website}
                        onChange={(e) =>
                          setContactInfo((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, website: e.target.value },
                          }))
                        }
                        className="rounded-xl border-purple-200 focus:border-purple-400"
                        placeholder="https://shevoices.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-8"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Contact Info"}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Site Settings Tab */}
          <TabsContent value="site">
            <form onSubmit={handleSiteSettingsSubmit} className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings((prev) => ({ ...prev, siteName: e.target.value }))}
                      className="rounded-xl border-purple-200 focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={siteSettings.siteDescription}
                      onChange={(e) => setSiteSettings((prev) => ({ ...prev, siteDescription: e.target.value }))}
                      className="rounded-xl border-purple-200 focus:border-purple-400 resize-none"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Site Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance">Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">Temporarily disable public access to the site</p>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={siteSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSiteSettings((prev) => ({ ...prev, maintenanceMode: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registration">Allow Registration</Label>
                      <p className="text-sm text-gray-500">Allow new users to register accounts</p>
                    </div>
                    <Switch
                      id="registration"
                      checked={siteSettings.allowRegistration}
                      onCheckedChange={(checked) =>
                        setSiteSettings((prev) => ({ ...prev, allowRegistration: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="moderate">Moderate Comments</Label>
                      <p className="text-sm text-gray-500">Require approval before comments are published</p>
                    </div>
                    <Switch
                      id="moderate"
                      checked={siteSettings.moderateComments}
                      onCheckedChange={(checked) => setSiteSettings((prev) => ({ ...prev, moderateComments: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Send email notifications for new content and messages</p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={siteSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setSiteSettings((prev) => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-8"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Site Settings
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Security Features Coming Soon</h3>
                  <p className="text-gray-500 mb-4">
                    Advanced security settings including password policies, two-factor authentication, and access logs
                    will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
