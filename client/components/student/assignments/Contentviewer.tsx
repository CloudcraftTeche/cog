"use client"
import { Video, FileText, File, Play, Download, Eye, Sparkles } from "lucide-react";
import { IAssignment } from "@/types/assignment.types";
interface ContentViewerProps {
  assignment: IAssignment;
}
export function ContentViewer({ assignment }: ContentViewerProps) {
  const contentConfig = {
    video: { 
      icon: Video, 
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 via-blue-100/50 to-indigo-50',
      border: 'border-blue-300',
      title: 'Video Content',
      buttonGradient: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600'
    },
    text: { 
      icon: FileText, 
      gradient: 'from-green-500 via-emerald-600 to-teal-600',
      bgGradient: 'from-green-50 via-emerald-100/50 to-teal-50',
      border: 'border-green-300',
      title: 'Text Content',
      buttonGradient: 'from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700',
      iconBg: 'bg-gradient-to-br from-green-500 to-teal-600'
    },
    pdf: { 
      icon: File, 
      gradient: 'from-purple-500 via-violet-600 to-fuchsia-600',
      bgGradient: 'from-purple-50 via-violet-100/50 to-fuchsia-50',
      border: 'border-purple-300',
      title: 'PDF Document',
      buttonGradient: 'from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700',
      iconBg: 'bg-gradient-to-br from-purple-500 to-fuchsia-600'
    }
  }[assignment.contentType];
  const ContentIcon = contentConfig.icon;
  return (
    <div className={`relative rounded-2xl border-2 ${contentConfig.border} bg-gradient-to-br ${contentConfig.bgGradient} p-8 transition-all hover:shadow-2xl overflow-hidden`}>
      {}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${contentConfig.gradient} opacity-10 rounded-full blur-3xl`} />
      <div className={`absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr ${contentConfig.gradient} opacity-10 rounded-full blur-3xl`} />
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className={`p-4 rounded-2xl ${contentConfig.iconBg} shadow-2xl shadow-blue-500/30 transform hover:scale-110 transition-transform duration-300`}>
            <ContentIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-2xl font-bold text-gray-900">
                {contentConfig.title}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">Interactive learning material</p>
          </div>
        </div>
        {assignment.contentType === 'video' && assignment.videoUrl && (
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-xl">
            <div className="aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-12 h-12 text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-black/50 to-transparent p-3 rounded-lg backdrop-blur-sm">
                <p className="text-white text-sm font-medium">Click to watch video</p>
              </div>
            </div>
            <a 
              href={assignment.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${contentConfig.buttonGradient} text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all transform hover:scale-105`}
            >
              <Eye className="w-5 h-5 mr-2" />
              Open Video in New Tab
            </a>
          </div>
        )}
        {assignment.contentType === 'pdf' && assignment.pdfUrl && (
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`p-5 ${contentConfig.iconBg} rounded-2xl shadow-lg`}>
                  <File className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xl mb-1">PDF Document</p>
                  <p className="text-sm text-gray-500">Click to view or download the document</p>
                </div>
              </div>
              <a 
                href={assignment.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${contentConfig.buttonGradient} text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all transform hover:scale-105`}
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </a>
            </div>
          </div>
        )}
        {assignment.contentType === 'text' && assignment.textContent && (
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-xl">
            <div className="prose prose-lg max-w-none">
              <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-green-500 to-teal-500 rounded-full" />
                <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap pl-6">
                  {assignment.textContent}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}