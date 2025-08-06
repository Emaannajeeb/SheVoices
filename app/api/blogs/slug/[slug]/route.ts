import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params

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

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching blog post by slug:", error)
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 })
  }
}
