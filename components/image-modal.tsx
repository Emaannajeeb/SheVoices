"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Download, Share2, ZoomIn, ZoomOut, Calendar, Tag, Check } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"

interface GalleryImage {
  id: string
  title: string
  description?: string
  imageUrl: string
  thumbnailUrl?: string  // Make optional if not always available
  altText: string
  category: string
  isActive?: boolean     // Make optional
  published?: boolean    // Make optional
  createdAt: string
  publicId?: string      // Make optional
  format: string
  bytes?: number         // Make optional
  width?: number
  height?: number
  tags: string[]
  size: number           // Keep this if you prefer 'size' over 'bytes'
}


interface ImageModalProps {
  image: GalleryImage
  trigger: React.ReactNode  // Add this line
  isOpen?: boolean          // Make optional if controlled by trigger
  onClose?: () => void      // Make optional if controlled by trigger
}


export function ImageModal({ image, isOpen, onClose }: ImageModalProps) {
  const [zoom, setZoom] = useState(1)
  const [copied, setCopied] = useState(false)

  const categoryLabels: { [key: string]: string } = {
    general: "General",
    podcast: "Podcast",
    events: "Events",
    community: "Community",
    workshops: "Workshops",
    testimonials: "Testimonials",
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(image.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${image.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: image.title,
      text: `Check out this image from SheVoices: ${image.title}`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error("Error sharing:", error)
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Error copying to clipboard:", error)
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden bg-black/95 border-0">
        <div className="relative w-full h-full">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
            <div className="flex items-start justify-between text-white">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold mb-2">{image.title}</h2>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(image.createdAt), "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <Badge className="bg-white/20 text-white border-white/30">
                      {categoryLabels[image.category] || image.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>

                <span className="text-white/80 text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <Download className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="flex items-center justify-center w-full h-[90vh] overflow-auto">
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoom})` }}
            >
              <Image
                src={image.imageUrl || "/placeholder.svg"}
                alt={image.altText || image.title}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
                priority
              />
            </div>
          </div>

          {/* Footer */}
          {image.altText && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="text-white/90 text-center max-w-3xl mx-auto">{image.altText}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
