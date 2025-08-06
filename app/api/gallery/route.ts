import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where = {
      isActive: true,
      ...(category && { category }),
    }

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error("Error fetching gallery images:", error)
    return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, imageUrl, altText, category } = body

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title and image URL are required" }, { status: 400 })
    }

    const image = await prisma.galleryImage.create({
      data: {
        title,
        imageUrl,
        altText,
        category: category || "general",
        isActive: true,
      },
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error("Error creating gallery image:", error)
    return NextResponse.json({ error: "Failed to create gallery image" }, { status: 500 })
  }
}
