// scripts/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'


const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create dummy users
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@shevoices.com' },
    update: {},
    create: {
      email: 'admin@shevoices.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  })

  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@shevoices.com' },
    update: {},
    create: {
      email: 'editor@shevoices.com',
      password: hashedPassword,
      name: 'Editor User',
      role: 'editor',
    },
  })

  console.log('👤 Created users:', { adminUser, editorUser })

  // Create dummy blog posts
  const blogPosts = await Promise.all([
    prisma.blogPost.create({
      data: {
        title: 'Welcome to SheVoices',
        slug: 'welcome-to-shevoices',
        content: 'This is our first blog post on SheVoices platform. We are excited to share stories and empower women through content.',
        excerpt: 'Welcome to our new platform for empowering women through storytelling.',
        author: adminUser.name,
        authorId: adminUser.id,
        published: true,
        tags: ['welcome', 'introduction', 'women-empowerment'],
        featuredImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop',
      },
    }),
    prisma.blogPost.create({
      data: {
        title: 'Building Confidence Through Storytelling',
        slug: 'building-confidence-through-storytelling',
        content: 'Stories have the power to transform lives. In this post, we explore how sharing our experiences can build confidence and create connections.',
        excerpt: 'Discover how storytelling can be a powerful tool for building self-confidence.',
        author: editorUser.name,
        authorId: editorUser.id,
        published: true,
        tags: ['storytelling', 'confidence', 'personal-growth'],
        featuredImage: 'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=800&h=400&fit=crop',
      },
    }),
    prisma.blogPost.create({
      data: {
        title: 'Draft: Upcoming Events',
        slug: 'draft-upcoming-events',
        content: 'This is a draft post about our upcoming events and workshops.',
        excerpt: 'Stay tuned for exciting events and workshops coming soon.',
        author: adminUser.name,
        authorId: adminUser.id,
        published: false,
        tags: ['events', 'workshops', 'community'],
      },
    }),
  ])

  console.log('📝 Created blog posts:', blogPosts.length)

  // Create dummy podcast videos
  const podcastVideos = await Promise.all([
    prisma.podcastVideo.create({
      data: {
        title: 'Episode 1: Finding Your Voice',
        description: 'In our first episode, we discuss the importance of finding and using your authentic voice.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop',
        duration: 1800, // 30 minutes
      },
    }),
    prisma.podcastVideo.create({
      data: {
        title: 'Episode 2: Overcoming Challenges',
        description: 'A deep dive into overcoming personal and professional challenges as a woman.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=300&fit=crop',
        duration: 2100, // 35 minutes
      },
    }),
  ])

  console.log('🎥 Created podcast videos:', podcastVideos.length)

  // Create dummy gallery images
  const galleryImages = await Promise.all([
    prisma.galleryImage.create({
      data: {
        title: 'Women Empowerment Workshop',
        imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop',
        altText: 'Group of women at empowerment workshop',
        category: 'general',
      },
    }),
    prisma.galleryImage.create({
      data: {
        title: 'Podcast Recording Session',
        imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&h=400&fit=crop',
        altText: 'Behind the scenes of podcast recording',
        category: 'general',
      },
    }),
    prisma.galleryImage.create({
      data: {
        title: 'Community Event',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&h=400&fit=crop',
        altText: 'Community gathering and networking event',
        category: 'general',
      },
    }),
  ])

  console.log('🖼️ Created gallery images:', galleryImages.length)

  // Create contact info
  const contactInfo = await prisma.contactInfo.upsert({
    where: { id: 'contact-info-1' },
    update: {},
    create: {
      email: 'hello@shevoices.com',
      phone: '+1 (555) 123-4567',
      whatsappNumber: '+1 (555) 123-4567',
      address: '123 Empowerment Street, Women City, WC 12345',
      socialLinks: {
        instagram: 'https://instagram.com/shevoices',
        facebook: 'https://facebook.com/shevoices',
        twitter: 'https://twitter.com/shevoices',
        linkedin: 'https://linkedin.com/company/shevoices'
      },
    },
  })

  console.log('📞 Created contact info:', contactInfo)

  // Create dummy social updates
  const socialUpdates = await Promise.all([
    prisma.socialUpdate.create({
      data: {
        platform: 'instagram',
        postId: 'insta_post_1',
        content: 'Excited to share our latest podcast episode! 🎙️ #SheVoices #WomenEmpowerment',
        imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=400&fit=crop',
        postUrl: 'https://instagram.com/p/example1',
        publishedAt: new Date('2024-01-15'),
      },
    }),
    prisma.socialUpdate.create({
      data: {
        platform: 'facebook',
        postId: 'fb_post_1',
        content: 'Join us for our upcoming workshop on building confidence through storytelling!',
        postUrl: 'https://facebook.com/shevoices/posts/example1',
        publishedAt: new Date('2024-01-10'),
      },
    }),
  ])

  console.log('📱 Created social updates:', socialUpdates.length)

  console.log('✅ Database seeded successfully!')
  console.log('\n🔑 Login Credentials:')
  console.log('Admin User:')
  console.log('  Email: admin@shevoices.com')
  console.log('  Password: password123')
  console.log('\nEditor User:')
  console.log('  Email: editor@shevoices.com')
  console.log('  Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })