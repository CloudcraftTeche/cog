import { Announcement } from '@/hooks/useStudentDashboard';
import React from 'react';
interface AnnouncementsSectionProps {
  announcements: Announcement[];
}
export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ announcements }) => {
  const getTypeStyles = (type: string) => {
    const styles: Record<string, string> = {
      important: 'bg-red-50 border-l-4 border-red-500 text-red-700',
      urgent: 'bg-orange-50 border-l-4 border-orange-500 text-orange-700',
      general: 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
    };
    return styles[type] || styles.general;
  };
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-all">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>📢</span> Recent Announcements
      </h2>
      {announcements.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No announcements yet</p>
          <p className="text-sm text-gray-400 mt-2">Check back later for updates</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl transition-all hover:shadow-md ${getTypeStyles(announcement.type)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{announcement.title}</p>
                  <p className="text-sm mt-1 line-clamp-2">{announcement.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {new Date(announcement.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 bg-white rounded-full opacity-70">
                  {announcement.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};