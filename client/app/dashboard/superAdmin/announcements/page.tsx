"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Megaphone, Sparkles, TrendingUp } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { AnnouncementList } from "@/components/admin/announcemnets/announcement-list"
import { AnnouncementDialog } from "@/components/admin/announcemnets/AnnouncementDialog"

export interface Announcement {
  _id: string
  title: string
  content: string
  type: "text" | "image" | "video"
  mediaUrl?: string
  createdAt: Date
  accentColor?: string
  isPinned?: boolean
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true)
      try {
        const res = await api.get("/announcements")
        setAnnouncements(res.data.data)
        
      } catch {
        toast.error("Failed to fetch announcements.")
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncements()
  }, [])

  const handleCreate = async (formData: FormData) => {
    try {
      const res = await api.post("/announcements", formData)
      setAnnouncements((prev) => [res.data.data, ...prev])
      toast.success("Announcement created successfully.")
      setDialogOpen(false)
    } catch {
      toast.error("Failed to create announcement.")
    }
  }

  const handleUpdate = async (formData: FormData, id?: string) => {
    if (!id) return
    try {
      const res = await api.put(`/announcements/${id}`, formData)
      setAnnouncements((prev) => prev.map((a) => (a._id === id ? res.data.data : a)))
      toast.success("Announcement updated successfully.")
      setDialogOpen(false)
      setEditingAnnouncement(null)
    } catch {
      toast.error("Failed to update announcement.")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/announcements/${id}`)
      setAnnouncements((prev) => prev.filter((a) => a._id !== id))
      toast.success("Announcement deleted.")
    } catch {
      toast.error("Failed to delete announcement.")
    }
  }

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      await api.patch(`/announcements/${id}/pin`, { isPinned })
      setAnnouncements((prev) => prev.map((a) => (a._id === id ? { ...a, isPinned } : a)))
      toast.success(isPinned ? "Announcement pinned." : "Announcement unpinned.")
    } catch {
      toast.error("Failed to toggle pin.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30">
      <div className="container mx-auto px-6 ">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-green-600/10 rounded-3xl blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-4 border-2 border-purple-100 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-lg opacity-30" />
                  <div className="relative p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-lg">
                    <Megaphone className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent text-balance leading-tight">
                    Announcements
                  </h1>
                  <p className="text-gray-600 text-sm mt-2 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    Share important updates with your community
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full">
                      <span className="text-green-700 font-semibold">{announcements.length} Total</span>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full">
                      <span className="text-orange-700 font-semibold">
                        {announcements.filter((a) => a.isPinned).length} Pinned
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => {
                  setEditingAnnouncement(null)
                  setDialogOpen(true)
                }}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 rounded-2xl text-lg font-semibold group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Plus className="h-5 w-5" />
                  </div>
                  Create Announcement
                  <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                </div>
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="space-y-4 p-6 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100"
              >
                <Skeleton className="h-8 w-2/3 rounded-xl bg-gradient-to-r from-purple-200 to-blue-200" />
                <Skeleton className="h-4 w-full rounded-lg bg-gradient-to-r from-gray-200 to-gray-300" />
                <Skeleton className="h-4 w-5/6 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300" />
                <Skeleton className="h-48 w-full rounded-2xl bg-gradient-to-br from-indigo-200 to-purple-200" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16 rounded-xl bg-gradient-to-r from-blue-200 to-indigo-200" />
                  <Skeleton className="h-8 w-20 rounded-xl bg-gradient-to-r from-red-200 to-pink-200" />
                </div>
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-10">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-2xl opacity-20" />
              <div className="relative p-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                <Megaphone className="h-16 w-16 text-purple-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No announcements yet</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Create your first announcement to start engaging with your community!
            </p>
            <Button
              onClick={() => {
                setEditingAnnouncement(null)
                setDialogOpen(true)
              }}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 rounded-2xl text-lg font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Announcement
            </Button>
          </div>
        ) : (
          <AnnouncementList
            announcements={announcements}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin}
            onEdit={(a) => {
              setEditingAnnouncement(a)
              setDialogOpen(true)
            }}
          />
        )}

        <AnnouncementDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          announcement={editingAnnouncement || undefined}
          onSubmit={editingAnnouncement ? handleUpdate : handleCreate}
        />
      </div>
    </div>
  )
}
