"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pin, PinOff, Trash2, Edit, Sparkles } from "lucide-react"
import type { Announcement } from "@/app/dashboard/admin/announcements/page"
import Image from "next/image"

interface AnnouncementCardProps {
  announcement: Announcement
  onDelete: (id: string) => void
  onTogglePin: (id: string, isPinned: boolean) => void
  onEdit: (a: Announcement) => void
}

export function AnnouncementCard({ announcement, onDelete, onTogglePin, onEdit }: AnnouncementCardProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this announcement?")) return
    setLoading(true)
    await onDelete(announcement._id)
    setLoading(false)
  }

  const handlePinToggle = async () => {
    setLoading(true)
    await onTogglePin(announcement._id, !announcement.isPinned)
    setLoading(false)
  }

  return (
    <Card
      className="relative overflow-hidden rounded-3xl shadow-xl border-2 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
      style={{
        borderLeft: `8px solid ${announcement.accentColor || "#8b5cf6"}`,
        background: `linear-gradient(135deg, ${announcement.accentColor || "#8b5cf6"}08 0%, white 100%)`,
      }}
    >
      {announcement.isPinned && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
          <Sparkles className="h-3 w-3 inline mr-1" />
          Pinned
        </div>
      )}

      <CardContent className="p-8 space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold leading-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {announcement.title}
            </h3>
            <div
              className="w-16 h-1 rounded-full mt-2"
              style={{ backgroundColor: announcement.accentColor || "#8b5cf6" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              disabled={loading}
              onClick={handlePinToggle}
              title={announcement.isPinned ? "Unpin" : "Pin"}
              className={`rounded-xl transition-all duration-200 ${
                announcement.isPinned
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-600 hover:from-yellow-100 hover:to-orange-100"
                  : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-600 hover:from-green-100 hover:to-emerald-100"
              }`}
            >
              {announcement.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              disabled={loading}
              onClick={() => onEdit(announcement)}
              title="Edit"
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200 rounded-xl"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              disabled={loading}
              onClick={handleDelete}
              title="Delete"
              className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-600 hover:from-red-100 hover:to-pink-100 hover:border-red-300 transition-all duration-200 rounded-xl"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">{announcement.content}</p>

        {announcement.type === "image" && announcement.mediaUrl && (
          <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            <Image
              src={announcement.mediaUrl || "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"}
              alt="Announcement"
              className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              width={100}
              height={100}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
        )}
        {announcement.type === "video" && announcement.mediaUrl && (
          <div className="relative overflow-hidden rounded-2xl shadow-lg">
            <video src={announcement.mediaUrl} controls className="w-full h-72 object-cover rounded-2xl" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
