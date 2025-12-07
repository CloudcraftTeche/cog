"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, Phone, BookOpen, MoreHorizontal, Trash2, Eye, Edit } from "lucide-react";
import { getInitials, ITeacher } from "@/lib/teacherValidation";

interface TeacherCardProps {
  teacher: ITeacher;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const cardColors = [
  "from-blue-500 to-cyan-400",
  "from-purple-500 to-pink-400",
  "from-green-500 to-emerald-400",
  "from-orange-500 to-red-400",
  "from-indigo-500 to-purple-400",
  "from-teal-500 to-blue-400",
];

export function TeacherCard({ teacher, index, onEdit, onDelete }: TeacherCardProps) {
  const cardColor = cardColors[index % cardColors.length];

  return (
    <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden hover:scale-105">
      <CardHeader className="pb-4 relative">
        <div
          className={`absolute inset-0 bg-gradient-to-r ${cardColor} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className={`h-16 w-16 ring-4 ring-gradient-to-r ${cardColor} shadow-xl`}>
                <AvatarImage
                  src={teacher.profilePictureUrl || "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"}
                  alt={teacher.name}
                />
                <AvatarFallback className={`bg-gradient-to-r ${cardColor} text-white font-bold text-xl`}>
                  {getInitials(teacher.name)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${cardColor} rounded-full border-2 border-white shadow-lg`}
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{teacher.name}</h3>
              <Badge className={`bg-gradient-to-r ${cardColor} text-white border-0 shadow-lg font-semibold px-3 py-1 rounded-full`}>
                Teacher
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-purple-100 transition-colors duration-200">
                <MoreHorizontal className="h-5 w-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
             
              <DropdownMenuItem
                onClick={() => onEdit(teacher._id)}
                className="rounded-xl hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 rounded-xl hover:bg-red-50 transition-colors duration-200"
                onClick={() => onDelete(teacher._id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Email</p>
              <p className="text-sm text-gray-700 font-medium truncate">{teacher.email}</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Phone</p>
              <p className="text-sm text-gray-700 font-medium">{teacher.phone || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Assigned Grade</p>
              <p className="text-sm text-gray-700 font-medium">{teacher.gradeId.grade || "Not assigned"}</p>
            </div>
          </div>
          <div className="pt-4">
            <Button
              size="sm"
              className={`w-full bg-gradient-to-r ${cardColor} hover:shadow-xl text-white border-0 rounded-2xl font-semibold py-3 transition-all duration-300 hover:scale-105`}
              onClick={() => onEdit(teacher._id)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}