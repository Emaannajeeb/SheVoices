"use client"

import { Button } from "@/components/ui/button"
import { Share2, Facebook, MessageCircle } from "lucide-react"

interface ShareButtonsProps {
  shareUrl: string
  shareText: string
  postTitle: string
}

export default function ShareButtons({ shareUrl, shareText, postTitle }: ShareButtonsProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log("Share cancelled or failed:", error)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert("Link copied to clipboard!")
      } catch (error) {
        console.error("Failed to copy to clipboard:", error)
      }
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </Button>
      </a>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full">
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
      </a>

      <Button
        onClick={handleShare}
        variant="outline"
        className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-full"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </div>
  )
}
