import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get("platform")
    const limit = searchParams.get("limit")

    const where = platform ? { platform } : {}
    const take = limit ? Number.parseInt(limit) : 20

    const updates = await prisma.socialUpdate.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take,
    })

    return NextResponse.json(updates)
  } catch (error) {
    console.error("Error fetching social updates:", error)
    return NextResponse.json({ error: "Failed to fetch social updates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { platform, postId, content, imageUrl, postUrl, publishedAt } = body

    if (!platform || !postId || !content || !postUrl) {
      return NextResponse.json({ error: "Platform, postId, content, and postUrl are required" }, { status: 400 })
    }

    // Check if update already exists
    const existingUpdate = await prisma.socialUpdate.findUnique({
      where: { postId },
    })

    if (existingUpdate) {
      return NextResponse.json({ error: "Social update already exists" }, { status: 409 })
    }

    const update = await prisma.socialUpdate.create({
      data: {
        platform,
        postId,
        content,
        imageUrl,
        postUrl,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
    })

    return NextResponse.json(update, { status: 201 })
  } catch (error) {
    console.error("Error creating social update:", error)
    return NextResponse.json({ error: "Failed to create social update" }, { status: 500 })
  }
}
