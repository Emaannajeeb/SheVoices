import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const image = await prisma.galleryImage.findUnique({
      where: { id },
    })

    if (!image) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 })
    }

    return NextResponse.json(image)
  } catch (error) {
    console.error("Error fetching gallery image:", error)
    return NextResponse.json({ error: "Failed to fetch gallery image" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, imageUrl, altText, category, isActive } = body

    const image = await prisma.galleryImage.findUnique({ where: { id } })
    if (!image) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 })
    }

    const updatedImage = await prisma.galleryImage.update({
      where: { id },
      data: {
        title,
        imageUrl,
        altText,
        category,
        isActive,
      },
    })

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error("Error updating gallery image:", error)
    return NextResponse.json({ error: "Failed to update gallery image" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const image = await prisma.galleryImage.findUnique({ where: { id } })
    if (!image) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 })
    }

    await prisma.galleryImage.delete({ where: { id } })

    return NextResponse.json({ message: "Gallery image deleted successfully" })
  } catch (error) {
    console.error("Error deleting gallery image:", error)
    return NextResponse.json({ error: "Failed to delete gallery image" }, { status: 500 })
  }
}
