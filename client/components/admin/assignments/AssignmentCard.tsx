"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Video,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Target,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { IAssignment } from "@/lib/assignmentValidation";
interface AssignmentCardProps {
  assignment: IAssignment;
  onDelete: (id: string) => void;
  onViewSubmissions: (id: string) => void;
}
export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onDelete,
  onViewSubmissions,
}) => {
  const router = useRouter();
  const getStatus = () => {
    const now = new Date();
    const start = new Date(assignment.startDate);
    const end = new Date(assignment.endDate);
    if (now < start) return "locked";
    if (now > end) return "ended";
    return "active";
  };
  const status = getStatus();
  const statusConfig = {
    active: {
      badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
      color: "text-emerald-600",
      gradient: "from-emerald-400 to-teal-500",
      label: "Active",
    },
    locked: {
      badge: "bg-slate-100 text-slate-700 border-slate-200",
      icon: Lock,
      color: "text-slate-600",
      gradient: "from-slate-400 to-gray-500",
      label: "Scheduled",
    },
    ended: {
      badge: "bg-rose-100 text-rose-700 border-rose-200",
      icon: XCircle,
      color: "text-rose-600",
      gradient: "from-rose-400 to-red-500",
      label: "Ended",
    },
  };
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const contentTypeConfig:any = {
    video: {
      icon: Video,
      gradient: "from-purple-500 to-pink-600",
      badge: "bg-purple-100 text-purple-700 border-purple-200",
    },
    text: {
      icon: FileText,
      gradient: "from-blue-500 to-indigo-600",
      badge: "bg-blue-100 text-blue-700 border-blue-200",
    },
    pdf: {
      icon: FileText,
      gradient: "from-red-500 to-orange-600",
      badge: "bg-red-100 text-red-700 border-red-200",
    },
  };
  const contentConfig = contentTypeConfig[assignment.contentType];
  const ContentIcon = contentConfig.icon;
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white rounded-2xl overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />
      <CardContent className="p-6">
        {}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-r ${contentConfig.gradient} shadow-lg`}
          >
            <ContentIcon className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {assignment.title}
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => router.push(`/dashboard/admin/assignments/edit/${assignment._id}`)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Assignment
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(assignment._id)}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Assignment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {assignment.description}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${contentConfig.badge} text-xs font-medium`}>
                {assignment.contentType.toUpperCase()}
              </Badge>
              <Badge className={`${config.badge} text-xs font-medium`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Grade {assignment.gradeId.grade}
              </Badge>
            </div>
          </div>
        </div>
        {}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4 border border-gray-100">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(assignment.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">End Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(assignment.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        {}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <Target className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Questions</p>
            <p className="text-lg font-bold text-gray-900">
              {assignment.questions?.length || 0}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <Users className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Submitted</p>
            <p className="text-lg font-bold text-gray-900">
              {assignment.submittedStudents?.length || 0}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <TrendingUp className="h-4 w-4 text-orange-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Total Marks</p>
            <p className="text-lg font-bold text-gray-900">
              {assignment.totalMarks || 100}
            </p>
          </div>
        </div>
        {}
        <div className="flex gap-2">
          <Button
            onClick={() => onViewSubmissions(assignment._id)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            size="sm"
          >
            <Users className="h-4 w-4 mr-2" />
            View Submissions
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/admin/assignments/edit/${assignment?._id}`)}
            variant="outline"
            size="sm"
            className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};