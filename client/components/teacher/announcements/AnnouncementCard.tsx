import { Announcement, formatDate } from "@/app/dashboard/teacher/announcements/page";
import { Pin, Calendar, Users, Image, Video, FileText} from 'lucide-react';
 const AnnouncementCard = ({ announcement, onClick }: { 
  announcement: Announcement; 
  onClick: () => void;
}) => {
  const getTypeIcon = () => {
    switch (announcement.type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 border-2 border-gray-100"
      style={{ borderLeftWidth: '6px', borderLeftColor: announcement.accentColor }}
    >
      {announcement.mediaUrl && announcement.type === 'image' && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={announcement.mediaUrl} 
            alt={announcement.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${announcement.accentColor}15` }}
            >
              <div style={{ color: announcement.accentColor }}>
                {getTypeIcon()}
              </div>
            </div>
            {announcement.isPinned && (
              <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                <Pin className="w-3 h-3 fill-current" />
                Pinned
              </div>
            )}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {announcement.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {announcement.content}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-4 h-4" />
              {formatDate(announcement.createdAt)}
            </div>
            {announcement.targetAudience === 'specific' && announcement.targetGrades.length > 0 && (
              <div className="flex items-center gap-1 text-gray-500">
                <Users className="w-4 h-4" />
                {announcement.targetGrades.map(g => g.grade).join(', ')}
              </div>
            )}
            {announcement.targetAudience === 'all' && (
              <div className="flex items-center gap-1 text-purple-600 font-medium">
                <Users className="w-4 h-4" />
                All Grades
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnnouncementCard;