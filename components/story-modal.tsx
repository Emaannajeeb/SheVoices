"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Heart, Send } from "lucide-react"

interface StoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (story: { name: string; title: string; content: string }) => void
}

export function StoryModal({ isOpen, onClose, onSubmit }: StoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    content: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.title && formData.content) {
      onSubmit(formData)
      setFormData({ name: "", title: "", content: "" })
      onClose()
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white rounded-3xl border-0 shadow-2xl">
        <DialogHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Share Your Voice
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-lg">
            Your story matters. Share your experience to inspire and connect with other women.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="How would you like to be known?"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Story Title
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Give your story a meaningful title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-gray-700">
              Your Story
            </Label>
            <Textarea
              id="content"
              placeholder="Share your experience, thoughts, or message. Remember, this is a safe space where your authentic voice is valued and respected."
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              className="min-h-[200px] rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-400 resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Your story will be shared with the community. Please ensure it follows our community guidelines.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full py-3 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full py-3 font-semibold"
            >
              <Send className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
