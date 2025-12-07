
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pin,
  Edit,
  Trash2,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Video,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { formatDate, truncateContent, getTypeColor, IAnnouncement } from "@/utils/announcement.utils";

interface AnnouncementCardProps {
  announcement: IAnnouncement;
  onEdit: (announcement: IAnnouncement) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
}

export const AnnouncementCard = ({
  announcement,
  onEdit,
  onDelete,
  onTogglePin,
}: AnnouncementCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeIcon = () => {
    switch (announcement.type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const renderMedia = () => {
    if (announcement.type === "image" && announcement.mediaUrl) {
      return (
        <div className="mt-3">
          <img
            src={announcement.mediaUrl}
            alt={announcement.title}
            className="w-full rounded-lg border shadow-sm max-h-96 object-cover"
          />
        </div>
      );
    }

    if (announcement.type === "video" && announcement.mediaUrl) {
      return (
        <div className="mt-3">
          <video
            controls
            className="w-full rounded-lg border shadow-sm max-h-96"
          >
            <source src={announcement.mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return null;
  };

  return (
    <Card
      className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-xl"
      style={{ borderLeft: `4px solid ${announcement.accentColor}` }}
    >
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                {announcement.title}
              </h3>
              {announcement.isPinned && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Badge className={`${getTypeColor(announcement.type)} border`}>
                {getTypeIcon()}
                <span className="ml-1 capitalize">{announcement.type}</span>
              </Badge>

              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {announcement.targetAudience === "all"
                  ? "All Students"
                  : `${announcement.targetGrades.length} Grade${announcement.targetGrades.length > 1 ? "s" : ""}`}
              </span>

              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(announcement.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePin(announcement._id, !announcement.isPinned)}
              className="h-8 w-8 p-0"
              title={announcement.isPinned ? "Unpin" : "Pin"}
            >
              <Pin
                className={`h-4 w-4 ${
                  announcement.isPinned
                    ? "text-amber-600 fill-amber-600"
                    : "text-gray-600"
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(announcement)}
              className="h-8 w-8 p-0"
              title="Edit"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(announcement._id)}
              className="h-8 w-8 p-0"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0">
        <p
          className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {isExpanded
            ? announcement.content
            : truncateContent(announcement.content, 200)}
        </p>

        {announcement.content.length > 200 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Read More
              </>
            )}
          </Button>
        )}

        {isExpanded && renderMedia()}

        {announcement.targetAudience === "specific" &&
          announcement.targetGrades.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <p className="text-xs font-medium text-gray-600 mb-2">
                Target Grades:
              </p>
              <div className="flex flex-wrap gap-1">
                {announcement.targetGrades.map((grade) => (
                  <Badge
                    key={grade._id}
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {grade.grade}
                  </Badge>
                ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
};