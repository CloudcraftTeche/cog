"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, GraduationCap, MapPin, Eye } from "lucide-react"
import Image from "next/image"
import api from "@/lib/api"
import { toast } from "sonner"

interface TeacherFormData {
  name: string
  email: string
  phone: string
  gender: string
  dateOfBirth: string
  classTeacherFor: string
  experience: string
  qualifications: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  profilePictureUrl: string
}

export default function EditTeacherPage() {
  const router = useRouter()
  const { id } = useParams()
  const [_, setIsLoading] = useState(false)

  const [profile, setProfile] = useState<TeacherFormData>({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    classTeacherFor: "",
    experience: "",
    qualifications: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
    },
    profilePictureUrl: "",
  })

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const res = await api.get(`/teacher/${id}`)
        const data = await res.data.data
        setProfile({
          ...data,
          address: {
            street: data.address?.street || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            country: data.address?.country || "India",
            postalCode: data.address?.postalCode || "",
          },
          profilePictureUrl: data?.profilePictureUrl || "",
        })
      } catch (err) {
        toast.error("Failed to fetch teacher data")
        router.back()
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id, router])

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "T"

  return (
    <div className="">
      <div className="space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white shadow-xl">
            <Eye className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Teacher Profile</h1>
          </div>
          <p className="text-gray-600 text-lg">View detailed teacher information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-2xl rounded-3xl bg-gradient-to-br from-white to-indigo-50 overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-28 w-28 ring-4 ring-white/50 shadow-2xl">
                      {profile.profilePictureUrl ? (
                        <Image
                          src={profile.profilePictureUrl || ""}
                          alt="Profile preview"
                          className="object-cover"
                          height={112}
                          width={112}
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-3xl font-bold">
                          {getInitials(profile?.name || "")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white">{profile.name || "Teacher Name"}</h3>
                    <p className="text-indigo-100 font-medium">{profile.classTeacherFor || "Class Assignment"}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-l-4 border-blue-400">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">Email</p>
                    <p className="text-xs text-gray-600 truncate font-medium">{profile.email || ""}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-l-4 border-green-400">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-600 uppercase tracking-wide">Phone</p>
                    <p className="text-xs text-gray-600 font-medium">{profile.phone || ""}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-l-4 border-purple-400">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-purple-600 uppercase tracking-wide">Experience</p>
                    <p className="text-xs text-gray-600 font-medium">{profile.experience || ""}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-l-4 border-orange-400">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-400 rounded-xl">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-orange-600 uppercase tracking-wide">Location</p>
                    <p className="text-xs text-gray-600 font-medium">
                      {profile.address.city && profile.address.state
                        ? `${profile.address.city}, ${profile.address.state}`
                        : " "}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl mr-3">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8 bg-gradient-to-br from-white to-indigo-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={profile.name || ""} disabled className="bg-gray-100 text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ""}
                      disabled
                      className="bg-gray-100 text-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" value={profile.phone || ""} disabled className="bg-gray-100 text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Input value={profile.gender || ""} disabled className="bg-gray-100 text-gray-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : ""}
                    disabled
                    className="bg-gray-100 text-gray-500"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl mr-3">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8 bg-gradient-to-br from-white to-green-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classTeacherFor">Class Teacher For *</Label>
                    <Input value={profile.classTeacherFor || ""} disabled className="bg-gray-100 text-gray-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    value={profile.qualifications || ""}
                    disabled
                    rows={3}
                    className="bg-gray-100 text-gray-500"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl mr-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8 bg-gradient-to-br from-white to-orange-50">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={profile.address.street || ""}
                    disabled
                    className="bg-gray-100 text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={profile.address.city || ""}
                      disabled
                      className="bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={profile.address.state || ""}
                      disabled
                      className="bg-gray-100 text-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profile.address.country || ""}
                      disabled
                      className="bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={profile.address.postalCode || ""}
                      disabled
                      className="bg-gray-100 text-gray-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
