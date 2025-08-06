import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const contactInfo = await prisma.contactInfo.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(contactInfo)
  } catch (error) {
    console.error("Error fetching contact info:", error)
    return NextResponse.json({ error: "Failed to fetch contact info" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, phone, whatsappNumber, address, socialLinks } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Deactivate existing contact info
    await prisma.contactInfo.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })

    // Create new contact info
    const contactInfo = await prisma.contactInfo.create({
      data: {
        email,
        phone,
        whatsappNumber,
        address,
        socialLinks,
        isActive: true,
      },
    })

    return NextResponse.json(contactInfo, { status: 201 })
  } catch (error) {
    console.error("Error creating contact info:", error)
    return NextResponse.json({ error: "Failed to create contact info" }, { status: 500 })
  }
}
