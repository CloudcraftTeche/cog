"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Upload,
  Loader2,
  Save,
  Sparkles,
  BookOpen,
  Award,
} from "lucide-react"
import Image from "next/image"
import api from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

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

interface FormErrors {
  [key: string]: string
}

export default function EditTeacherPage() {
  const router = useRouter()
  const id = useAuth().user?.id
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [grades, setGrades] = useState([])

  const [formData, setFormData] = useState<TeacherFormData>({
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

        setFormData({
          ...data,
          address: {
            street: data.address?.street || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            country: data.address?.country || "India",
            postalCode: data.address?.postalCode || "",
          },
        })
        setPreviewUrl(data?.profilePictureUrl || "")
      } catch (err) {
        toast.error("Failed to fetch teacher data")
        router.back()
      } finally {
        setIsLoading(false)
      }
    }
    const fetchGrades = async () => {
      const response = await api.get("/grades")
      const data = await response.data.data

      setGrades(data)
    }
    fetchGrades()
    fetchData()
  }, [id, router])

  const updateField = (field: string, value: string) => {
    setFormData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof TeacherFormData] as any),
            [child]: value,
          },
        }
      }
      return { ...prev, [field]: value }
    })
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    const { name, email, phone, gender, dateOfBirth, classTeacherFor, address } = formData

    if (!name?.trim()) newErrors.name = "Name is required"
    if (!email?.trim()) newErrors.email = "Email is required"
    if (!phone?.trim()) newErrors.phone = "Phone is required"
    if (!gender) newErrors.gender = "Gender is required"
    if (!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
    if (!classTeacherFor.trim()) newErrors.classTeacherFor = "Class assignment is required"
    if (!address?.street.trim()) newErrors["address.street"] = "Street address is required"
    if (!address?.city.trim()) newErrors["address.city"] = "City is required"
    if (!address?.state.trim()) newErrors["address.state"] = "State is required"
    if (!address?.postalCode.trim()) newErrors["address.postalCode"] = "Postal code is required"

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) newErrors.email = "Enter a valid email"

    const phoneRegex = /^[+]?\d{10,}$/
    if (phone && !phoneRegex.test(phone)) newErrors.phone = "Enter a valid phone number"

    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
    if (age < 18 || age > 80) newErrors.dateOfBirth = "Age must be between 18 and 80"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error("Max file size is 5MB")
    if (!file.type.startsWith("image/")) return toast.error("Only images allowed")

    setProfilePicture(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.")
      return
    }
    setIsLoading(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "address") {
          Object.entries(value).forEach(([k, v]) => formDataObj.append(`address[${k}]`, String(v)))
        } else {
          formDataObj.append(key, value)
        }
      })
      if (profilePicture) formDataObj.append("profilePicture", profilePicture)

      await api.put(`/teacher/${id}`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast.success("Teacher updated successfully")
      router.push("/dashboard/teacher")
    } catch (error: any) {
      toast.error("Failed to create teacher")
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "T"

  return (
    <div className="relative bg-white">
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Edit Teacher Profile</h1>
                <p className="text-white/90 mt-1">Update your professional information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl  overflow-hidden">
              <CardHeader className="text-center pb-4 relative">
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur opacity-30"></div>
                    <Avatar className="h-28 w-28 ring-4 ring-white shadow-xl relative">
                      {formData?.profilePictureUrl || previewUrl ? (
                        <Image
                          src={formData.profilePictureUrl || previewUrl}
                          alt="Profile preview"
                          className="object-cover"
                          height={112}
                          width={112}
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-3xl font-bold">
                          {getInitials(formData?.name || "")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {formData.name || "Teacher Name"}
                    </h3>
                    <p className="text-gray-600 font-medium">{formData.classTeacherFor || "Class Assignment"}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="flex items-center space-x-4 p-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Email</p>
                    <p className="text-sm text-gray-600 truncate">{formData.email || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 ">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Phone</p>
                    <p className="text-sm text-gray-600">{formData.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 ">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Experience</p>
                    <p className="text-sm text-gray-600">{formData.experience || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 ">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Location</p>
                    <p className="text-sm text-gray-600">
                      {formData.address.city && formData.address.state
                        ? `${formData.address.city}, ${formData.address.state}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mr-3">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Personal Information
                  </span>
                  <Sparkles className="h-5 w-5 text-blue-500 ml-2" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-semibold">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Enter full name"
                      className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 ${
                        errors.name ? "border-red-500 focus:border-red-500" : "border-blue-200 focus:border-blue-500"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-semibold">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="Enter email address"
                      className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 ${
                        errors.email ? "border-red-500 focus:border-red-500" : "border-blue-200 focus:border-blue-500"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-semibold">
                      Phone *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="Enter phone number"
                      className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 ${
                        errors.phone ? "border-red-500 focus:border-red-500" : "border-blue-200 focus:border-blue-500"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-gray-700 font-semibold">
                      Gender *
                    </Label>
                    <Select
                      value={formData.gender || ""}
                      onValueChange={(value: string) => updateField("gender", value)}
                    >
                      <SelectTrigger
                        className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 ${
                          errors.gender
                            ? "border-red-500 focus:border-red-500"
                            : "border-blue-200 focus:border-blue-500"
                        }`}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-red-500 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.gender}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-gray-700 font-semibold">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split("T")[0] : ""}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 ${
                      errors.dateOfBirth
                        ? "border-red-500 focus:border-red-500"
                        : "border-blue-200 focus:border-blue-500"
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePicture" className="text-gray-700 font-semibold">
                    Profile Picture
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("profilePicture")?.click()}
                      className="flex items-center space-x-2 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Choose Image</span>
                    </Button>
                    {profilePicture && (
                      <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                        {profilePicture.name || ""}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mr-3">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Professional Information
                  </span>
                  <Award className="h-5 w-5 text-green-500 ml-2" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="classTeacherFor" className="text-gray-700 font-semibold">
                      Class Teacher For *
                    </Label>
                    <Select
                      value={formData.classTeacherFor || ""}
                      onValueChange={(value: string) => updateField("classTeacherFor", value)}
                    >
                      <SelectTrigger
                        id="classTeacherFor"
                        className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-green-500/20 ${
                          errors.classTeacherFor
                            ? "border-red-500 focus:border-red-500"
                            : "border-green-200 focus:border-green-500"
                        }`}
                      >
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades?.map(({ grade }) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.classTeacherFor && (
                      <p className="text-sm text-red-500 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.classTeacherFor}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-gray-700 font-semibold">
                      Experience
                    </Label>
                    <Input
                      id="experience"
                      value={formData.experience || ""}
                      onChange={(e) => updateField("experience", e.target.value)}
                      placeholder="e.g., 5 years"
                      className="border-2 border-green-200 focus:border-green-500 transition-all duration-200 focus:ring-4 focus:ring-green-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifications" className="text-gray-700 font-semibold">
                    Qualifications
                  </Label>
                  <Textarea
                    id="qualifications"
                    value={formData.qualifications || ""}
                    onChange={(e) => updateField("qualifications", e.target.value)}
                    placeholder="e.g., B.Ed in Mathematics, M.Sc in Physics"
                    rows={4}
                    className="border-2 border-green-200 focus:border-green-500 transition-all duration-200 focus:ring-4 focus:ring-green-500/20"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Address Information
                  </span>
                  <BookOpen className="h-5 w-5 text-orange-500 ml-2" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-gray-700 font-semibold">
                    Street Address *
                  </Label>
                  <Input
                    id="street"
                    value={formData.address.street || ""}
                    onChange={(e) => updateField("address.street", e.target.value)}
                    placeholder="Enter street address"
                    className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-orange-500/20 ${
                      errors["address.street"]
                        ? "border-red-500 focus:border-red-500"
                        : "border-orange-200 focus:border-orange-500"
                    }`}
                  />
                  {errors["address.street"] && (
                    <p className="text-sm text-red-500 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors["address.street"]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-700 font-semibold">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.address.city || ""}
                      onChange={(e) => updateField("address.city", e.target.value)}
                      placeholder="Enter city"
                      className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-orange-500/20 ${
                        errors["address.city"]
                          ? "border-red-500 focus:border-red-500"
                          : "border-orange-200 focus:border-orange-500"
                      }`}
                    />
                    {errors["address.city"] && (
                      <p className="text-sm text-red-500 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors["address.city"]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-gray-700 font-semibold">
                      State *
                    </Label>
                    <Input
                      id="state"
                      value={formData.address.state || ""}
                      onChange={(e) => updateField("address.state", e.target.value)}
                      placeholder="Enter state"
                      className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-orange-500/20 ${
                        errors["address.state"]
                          ? "border-red-500 focus:border-red-500"
                          : "border-orange-200 focus:border-orange-500"
                      }`}
                    />
                    {errors["address.state"] && (
                      <p className="text-sm text-red-500 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors["address.state"]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-gray-700 font-semibold">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={formData.address.country || ""}
                      onChange={(e) => updateField("address.country", e.target.value)}
                      placeholder="Enter country"
                      className="border-2 border-orange-200 focus:border-orange-500 transition-all duration-200 focus:ring-4 focus:ring-orange-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-gray-700 font-semibold">
                      Postal Code *
                    </Label>
                    <Input
                      id="postalCode"
                      value={formData.address.postalCode || ""}
                      onChange={(e) => updateField("address.postalCode", e.target.value)}
                      placeholder="Enter postal code"
                      className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-orange-500/20 ${
                        errors["address.postalCode"]
                          ? "border-red-500 focus:border-red-500"
                          : "border-orange-200 focus:border-orange-500"
                      }`}
                    />
                    {errors["address.postalCode"] && (
                      <p className="text-sm text-red-500 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors["address.postalCode"]}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 min-w-[160px]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-5 w-5" />
                  <span>Update Profile</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
