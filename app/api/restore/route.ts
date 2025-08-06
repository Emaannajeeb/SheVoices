import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { backupData, options } = body

    if (!backupData || !backupData.metadata) {
      return NextResponse.json({ error: "Invalid backup data" }, { status: 400 })
    }

    const { data } = backupData
    let restoredCount = 0

    // Restore in transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Restore blog posts
      if (data.blogPosts && options.includeBlogPosts) {
        for (const post of data.blogPosts) {
          const { id, ...postData } = post
          await tx.blogPost.upsert({
            where: { slug: post.slug },
            update: postData,
            create: postData,
          })
          restoredCount++
        }
      }

      // Restore podcast videos
      if (data.podcastVideos && options.includePodcastVideos) {
        for (const video of data.podcastVideos) {
          const { id, ...videoData } = video
          await tx.podcastVideo.create({
            data: videoData,
          })
          restoredCount++
        }
      }

      // Restore gallery images
      if (data.galleryImages && options.includeGalleryImages) {
        for (const image of data.galleryImages) {
          const { id, ...imageData } = image
          await tx.galleryImage.create({
            data: imageData,
          })
          restoredCount++
        }
      }

      // Restore contact info
      if (data.contactInfo && options.includeContactInfo) {
        // Deactivate existing contact info
        await tx.contactInfo.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        })

        // Restore contact info
        for (const contact of data.contactInfo) {
          const { id, ...contactData } = contact
          await tx.contactInfo.create({
            data: contactData,
          })
          restoredCount++
        }
      }
    })

    return NextResponse.json({
      message: `Successfully restored ${restoredCount} items`,
      restoredCount,
      backupDate: backupData.metadata.createdAt,
    })
  } catch (error) {
    console.error("Error restoring backup:", error)
    return NextResponse.json({ error: "Failed to restore backup" }, { status: 500 })
  }
}
