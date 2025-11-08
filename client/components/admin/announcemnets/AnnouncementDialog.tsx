"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Sparkles, Edit, ImageIcon, Video, FileText, Palette } from "lucide-react"
import type { Announcement } from "@/app/dashboard/admin/announcements/page"
import Image from "next/image"

interface AnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (formData: FormData, id?: string) => Promise<void>
  announcement?: Announcement | null
}

export function AnnouncementDialog({ open, onOpenChange, onSubmit, announcement }: AnnouncementDialogProps) {
  const isEditing = Boolean(announcement)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<"text" | "image" | "video">("text")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [accentColor, setAccentColor] = useState("#8b5cf6")
  const [loading, setLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const colorOptions = [
    "#8b5cf6",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
    "#f97316",
    "#84cc16",
    "#a855f7",
    "#06b6d4",
  ]

  useEffect(() => {
    if (!open) return

    if (announcement) {
      setTitle(announcement?.title || "")
      setContent(announcement?.content || "")
      setType(announcement?.type || "text")
      setAccentColor(announcement?.accentColor || "#8b5cf6")
      setMediaPreview(announcement?.mediaUrl || null)
      setMediaFile(null)
    } else {
      setTitle("")
      setContent("")
      setType("text")
      setAccentColor("#8b5cf6")
      setMediaPreview(null)
      setMediaFile(null)
    }
  }, [announcement, open])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMediaFile(file)
    setMediaPreview(URL.createObjectURL(file))
    setType(file.type.startsWith("image/") ? "image" : "video")
  }

  const handleRemoveMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview)
    setMediaFile(null)
    setMediaPreview(null)
    setType("text")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    const formData = new FormData()
    formData.append("title", title)
    formData.append("content", content)
    formData.append("type", type)
    formData.append("accentColor", accentColor)
    if (mediaFile) formData.append("file", mediaFile)
    console.log(formData)

    try {
      setLoading(true)
      await onSubmit(formData, announcement?._id)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/50 border-2 rounded-3xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-4 text-3xl">
            <div
              className="p-4 rounded-2xl shadow-lg"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
            >
              {isEditing ? <Edit className="h-6 w-6 text-white" /> : <Sparkles className="h-6 w-6 text-white" />}
            </div>
            <div>
              <div className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {isEditing ? "Edit Announcement" : "Create New Announcement"}
              </div>
              <p className="text-sm text-gray-500 font-normal mt-1">
                {isEditing ? "Update your announcement details" : "Share something amazing with your community"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-lg font-semibold text-gray-700">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-lg p-4 rounded-xl border-2 focus:border-purple-300 transition-colors"
              placeholder="Enter an engaging title..."
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="content" className="text-lg font-semibold text-gray-700">
              Content *
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] text-lg p-4 rounded-xl border-2 focus:border-purple-300 transition-colors resize-none"
              required
              placeholder="Write your announcement content here..."
            />
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold text-gray-700">Media Type</Label>
            <Tabs value={type} onValueChange={(v) => setType(v as any)}>
              <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger
                  value="text"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Text
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-6">
                <Card className="border-2 border-dashed border-gray-200 rounded-2xl">
                  <CardContent className="p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">Text-only announcement</p>
                    <p className="text-sm text-gray-400 mt-2">Perfect for simple updates and messages</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="image" className="mt-6">
                {!mediaPreview ? (
                  <Card
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-2xl transition-colors bg-gradient-to-br from-blue-50 to-indigo-50"
                  >
                    <CardContent className="p-12 text-center">
                      <Upload className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                      <p className="text-xl font-semibold text-blue-700 mb-2">Upload Image</p>
                      <p className="text-blue-600">Click to select an image file</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden shadow-lg">
                    <Image src={mediaPreview || "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"} className="w-full h-64 object-cover" alt="Preview" width={100} height={100} />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveMedia}
                      className="absolute top-4 right-4 rounded-full shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="video" className="mt-6">
                {!mediaPreview ? (
                  <Card
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl transition-colors bg-gradient-to-br from-purple-50 to-pink-50"
                  >
                    <CardContent className="p-12 text-center">
                      <Upload className="mx-auto h-16 w-16 text-purple-500 mb-4" />
                      <p className="text-xl font-semibold text-purple-700 mb-2">Upload Video</p>
                      <p className="text-purple-600">Click to select a video file</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden shadow-lg">
                    <video src={mediaPreview} className="w-full h-64 rounded-2xl" controls />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveMedia}
                      className="absolute top-4 right-4 rounded-full shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            <input
              ref={fileInputRef}
              type="file"
              accept={type === "image" ? "image/*" : type === "video" ? "video/*" : ""}
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Accent Color
            </Label>
            <div className="flex flex-wrap gap-3 mb-4">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccentColor(color)}
                  className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 ${
                    accentColor === color ? "ring-4 ring-gray-300 scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Input
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="rounded-xl border-2 p-3"
              placeholder="#8b5cf6"
            />
          </div>

          <div className="flex justify-end gap-4 border-t-2 border-gray-100 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-8 py-3 rounded-xl border-2 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                color: "white",
              }}
            >
              {loading ? "Processing..." : isEditing ? "Update Announcement" : "Create Announcement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
