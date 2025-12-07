"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { GraduationCap, Mail, Phone, Calendar, MapPin } from "lucide-react"
import Image from "next/image"
interface StudentProfileCardProps {
  name: string
  email: string
  rollNumber: string
  gradeId: string
  gradeName?: string
  parentContact: string
  dateOfBirth: string
  city: string
  state: string
  previewUrl: string
  currentProfileUrl?: string
}
export const StudentProfileCard = ({
  name,
  email,
  rollNumber,
  gradeId,
  gradeName,
  parentContact,
  dateOfBirth,
  city,
  state,
  previewUrl,
  currentProfileUrl
}: StudentProfileCardProps) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "S"
  }
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return ""
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) 
      ? age - 1 
      : age
    return `${actualAge} years old`
  }
  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden">
      <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-28 w-28 ring-4 ring-white/50 shadow-2xl">
              {previewUrl || currentProfileUrl ? (
                <Image
                  src={previewUrl || currentProfileUrl || "/placeholder.png"}
                  height={112}
                  width={112}
                  alt="Profile preview"
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                  {getInitials(name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-lg">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">{name || "Student Name"}</h3>
            <p className="text-blue-100 font-medium"> Grade {gradeName || gradeId || "Grade"}</p>
            {rollNumber && (
              <p className="text-xs text-blue-200 bg-white/20 px-3 py-1 rounded-full mt-2 inline-block">
                Roll No: {rollNumber}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">Email</p>
            <p className="text-sm text-gray-600 truncate">{email || "Not set"}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Parent Contact</p>
            <p className="text-sm text-gray-600">{parentContact || "Not set"}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 shadow-sm">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Age</p>
            <p className="text-sm text-gray-600">{calculateAge(dateOfBirth) || "Not set"}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 shadow-sm">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Location</p>
            <p className="text-sm text-gray-600">
              {city && state ? `${city}, ${state}` : "Not set"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}