"use client";

import { useState, useMemo } from "react";
import { IAnnouncement } from "@/types/admin/announcement.types";
import { toast } from "sonner";
import { AnnouncementHeader } from "@/components/admin/announcemnets/AnnouncementHeader";
import { NoAnnouncementsState, NoSearchResultsState } from "@/components/admin/announcemnets/AnnouncementEmptyStates";
import { AnnouncementFormModal } from "@/components/admin/announcemnets/AnnouncementFormModal";
import { AnnouncementLoading } from "@/components/admin/announcemnets/AnnouncementLoading";
import { AnnouncementCard } from "@/components/admin/announcemnets/AnnouncementCard";
import { DeleteConfirmationDialog } from "@/components/admin/announcemnets/DeleteConfirmationDialog";
import { useAnnouncements } from "@/hooks/admin/useAnnouncements";


export default function AdminAnnouncements() {
  const {
    announcements,
    grades,
    loading,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    togglePin,
  } = useAnnouncements();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<IAnnouncement | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<
    string | null
  >(null);

  const filteredAnnouncements = useMemo(() => {
    if (!searchTerm.trim()) return announcements;
    const search = searchTerm.toLowerCase();
    return announcements.filter(
      (announcement) =>
        announcement.title.toLowerCase().includes(search) ||
        announcement.content.toLowerCase().includes(search)
    );
  }, [announcements, searchTerm]);

  const handleCreateClick = () => {
    setSelectedAnnouncement(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (announcement: IAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setAnnouncementToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (formData: FormData) => {
    try {
      if (selectedAnnouncement) {
        await updateAnnouncement({
          id: selectedAnnouncement._id,
          formData,
        });
        toast.success("Announcement updated successfully");
      } else {
        await createAnnouncement(formData);
        toast.success("Announcement created successfully");
      }
      setIsFormModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save announcement");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!announcementToDelete) return;
    try {
      await deleteAnnouncement(announcementToDelete);
      toast.success("Announcement deleted successfully");
      setIsDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete announcement");
    }
  };

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      await togglePin({ id, isPinned });
      toast.success(
        isPinned
          ? "Announcement pinned successfully"
          : "Announcement unpinned successfully"
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update pin status");
    }
  };

  if (announcements.length === 0 && !loading && searchTerm.trim() === "") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <AnnouncementHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateClick={handleCreateClick}
          />
          <NoAnnouncementsState onCreateClick={handleCreateClick} />
        </div>
        <AnnouncementFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          announcement={selectedAnnouncement}
          grades={grades}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <AnnouncementHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCreateClick={handleCreateClick}
        />

        {loading ? (
          <AnnouncementLoading />
        ) : (
          <>
            {filteredAnnouncements.length > 0 ? (
              <div className="space-y-4">
                {filteredAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement._id}
                    announcement={announcement}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </div>
            ) : (
              <NoSearchResultsState />
            )}
          </>
        )}
      </div>

      <AnnouncementFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        announcement={selectedAnnouncement}
        grades={grades}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}