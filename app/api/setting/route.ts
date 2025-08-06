import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the latest contact info
    const contactInfo = await prisma.contactInfo.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      contactInfo: contactInfo || {
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
      },
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { contactInfo, siteSettings } = body

    let updatedContactInfo = null

    // Update contact info if provided
    if (contactInfo) {
      // Deactivate existing contact info
      await prisma.contactInfo.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })

      // Create new contact info
      updatedContactInfo = await prisma.contactInfo.create({
        data: {
          email: contactInfo.email,
          phone: contactInfo.phone || null,
          whatsappNumber: contactInfo.whatsappNumber || null,
          address: contactInfo.address || null,
          socialLinks: contactInfo.socialLinks || {},
          isActive: true,
        },
      })
    }

    // Site settings would typically be stored in a separate settings table
    // For now, we'll just return success
    return NextResponse.json({
      message: "Settings updated successfully",
      contactInfo: updatedContactInfo,
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
