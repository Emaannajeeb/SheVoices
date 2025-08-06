import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all unique categories with counts
    const categories = await prisma.galleryImage.groupBy({
      by: ["category"],
      _count: {
        category: true,
      },
      where: {
        isActive: true,
      },
      orderBy: {
        _count: {
          category: "desc",
        },
      },
    })

    const formattedCategories = categories.map((cat) => ({
      name: cat.category,
      count: cat._count.category,
      label: cat.category.charAt(0).toUpperCase() + cat.category.slice(1).replace("-", " "),
    }))

    return NextResponse.json(formattedCategories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
