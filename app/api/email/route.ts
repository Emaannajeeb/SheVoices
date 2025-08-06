import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Mock email service - in production, you'd use SendGrid, Mailgun, etc.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { to, subject, template, data } = body

    if (!to || !subject || !template) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Mock email templates
    const templates = {
      welcome: {
        subject: "Welcome to SheVoices!",
        html: `
          <h1>Welcome to SheVoices, {{name}}!</h1>
          <p>Thank you for joining our community of empowered women.</p>
          <p>We're excited to have you share your voice with us.</p>
        `,
      },
      newPost: {
        subject: "New Blog Post Published",
        html: `
          <h1>New Post: {{title}}</h1>
          <p>A new blog post has been published on SheVoices.</p>
          <p>{{excerpt}}</p>
          <a href="{{url}}">Read More</a>
        `,
      },
      newsletter: {
        subject: "SheVoices Newsletter",
        html: `
          <h1>SheVoices Newsletter</h1>
          <p>{{content}}</p>
        `,
      },
    }

    const selectedTemplate = templates[template as keyof typeof templates]
    if (!selectedTemplate) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 })
    }

    // Replace template variables
    let html = selectedTemplate.html
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        html = html.replace(new RegExp(`{{${key}}}`, "g"), String(value))
      })
    }

    // In production, send actual email here
    console.log("Sending email:", {
      to,
      subject: subject || selectedTemplate.subject,
      html,
    })

    // Mock successful response
    return NextResponse.json({
      message: "Email sent successfully",
      messageId: `mock-${Date.now()}`,
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
