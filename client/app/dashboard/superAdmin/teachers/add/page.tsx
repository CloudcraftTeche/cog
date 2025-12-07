"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, UserPlus, GraduationCap, MapPin, Upload, Loader2, Plus } from "lucide-react"
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
  qualifications: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
}

interface FormErrors {
  [key: string]: string
}

export default function AddTeacherPage() {
  const router = useRouter()
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
    qualifications: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
    },
  })

  useEffect(() => {
    const fetchGrades = async () => {
      const response = await api.get("/grades/all")
      const data = await response.data.data

      setGrades(data)
    }
    fetchGrades()
  }, [])

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

    if (!name.trim()) newErrors.name = "Name is required"
    if (!email.trim()) newErrors.email = "Email is required"
    if (!phone.trim()) newErrors.phone = "Phone is required"
    if (!gender) newErrors.gender = "Gender is required"
    if (!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
    if (!classTeacherFor.trim()) newErrors.classTeacherFor = "Class assignment is required"
    if (!address.street.trim()) newErrors["address.street"] = "Street address is required"
    if (!address.city.trim()) newErrors["address.city"] = "City is required"
    if (!address.state.trim()) newErrors["address.state"] = "State is required"
    if (!address.postalCode.trim()) newErrors["address.postalCode"] = "Postal code is required"

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

      await api.post(`/teacher`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast.success("Teacher created successfully")
      router.push("/dashboard/admin/teachers")
    } catch (error) {
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
    <div className="">
      <div className="space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white shadow-xl">
            <Plus className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Add New Teacher</h1>
          </div>
          <p className="text-gray-600 text-lg">Create a new teacher profile with all the details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-2xl rounded-3xl bg-gradient-to-br from-white to-blue-50 overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-28 w-28 ring-4 ring-white/50 shadow-2xl">
                      {previewUrl ? (
                        <Image
                          src={previewUrl || "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"}
                          alt="Profile preview"
                          className="object-cover"
                          height={112}
                          width={112}
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-3xl font-bold">
                          {getInitials(formData.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white">{formData.name || "Teacher Name"}</h3>
                    <p className="text-blue-100 font-medium">{formData.classTeacherFor || "Class Assignment"}</p>
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
                    <p className="text-xs text-gray-600 truncate font-medium">{formData.email || "Not set"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-l-4 border-green-400">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-600 uppercase tracking-wide">Phone</p>
                    <p className="text-xs text-gray-600 font-medium">{formData.phone || "Not set"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-l-4 border-orange-400">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-400 rounded-xl">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-orange-600 uppercase tracking-wide">Location</p>
                    <p className="text-xs text-gray-600 font-medium">
                      {formData.address.city && formData.address.state
                        ? `${formData.address.city}, ${formData.address.state}`
                        : "Not set"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl mr-3">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-semibold">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Enter full name"
                      className={`rounded-2xl border-2 transition-all duration-300 ${errors.name ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"} focus:ring-4`}
                    />
                    {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-semibold">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="Enter email address"
                      className={`rounded-2xl border-2 transition-all duration-300 ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"} focus:ring-4`}
                    />
                    {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-semibold">
                      Phone *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="Enter phone number"
                      className={`rounded-2xl border-2 transition-all duration-300 ${errors.phone ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"} focus:ring-4`}
                    />
                    {errors.phone && <p className="text-sm text-red-500 font-medium">{errors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-gray-700 font-semibold">
                      Gender *
                    </Label>
                    <Select value={formData.gender} onValueChange={(value: string) => updateField("gender", value)}>
                      <SelectTrigger
                        className={
                          errors.gender
                            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                            : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"
                        }
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-sm text-red-500 font-medium">{errors.gender}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-gray-700 font-semibold">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    className={`rounded-2xl border-2 transition-all duration-300 ${errors.dateOfBirth ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"} focus:ring-4`}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-red-500 font-medium">{errors.dateOfBirth}</p>}
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
                      className="flex items-center space-x-2 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 px-6 py-3"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Choose Image</span>
                    </Button>
                    {profilePicture && (
                      <span className="text-sm text-gray-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        {profilePicture.name}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl mr-3">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="classTeacherFor" className="text-gray-700 font-semibold">
                      Class Teacher For *
                    </Label>
                    <Select
                      value={formData.classTeacherFor}
                      onValueChange={(value: string) => updateField("classTeacherFor", value)}
                    >
                      <SelectTrigger
                        id="classTeacherFor"
                        className={
                          errors.classTeacherFor
                            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                            : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"
                        }
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
                      <p className="text-sm text-red-500 font-medium">{errors.classTeacherFor}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifications" className="text-gray-700 font-semibold">
                    Qualifications
                  </Label>
                  <Textarea
                    id="qualifications"
                    value={formData.qualifications}
                    onChange={(e) => updateField("qualifications", e.target.value)}
                    placeholder="e.g., B.Ed in Mathematics, M.Sc in Physics"
                    rows={3}
                    className="rounded-2xl border-2 transition-all duration-300 focus:border-purple-400 focus:ring-purple-100 focus:ring-4"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl mr-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-gray-700 font-semibold">
                    Street Address *
                  </Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => updateField("address.street", e.target.value)}
                    placeholder="Enter street address"
                    className={`rounded-2xl border-2 transition-all duration-300 ${errors["address.street"] ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"} focus:ring-4`}
                  />
                  {errors["address.street"] && (
                    <p className="text-sm text-red-500 font-medium">{errors["address.street"]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-700 font-semibold">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => updateField("address.city", e.target.value)}
                      placeholder="Enter city"
                      className={`rounded-2xl border-2 transition-all duration-300 ${errors["address.city"] ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"} focus:ring-4`}
                    />
                    {errors["address.city"] && (
                      <p className="text-sm text-red-500 font-medium">{errors["address.city"]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-gray-700 font-semibold">
                      State *
                    </Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => updateField("address.state", e.target.value)}
                      placeholder="Enter state"
                      className={`rounded-2xl border-2 transition-all duration-300 ${errors["address.state"] ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"} focus:ring-4`}
                    />
                    {errors["address.state"] && (
                      <p className="text-sm text-red-500 font-medium">{errors["address.state"]}</p>
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
                      value={formData.address.country}
                      onChange={(e) => updateField("address.country", e.target.value)}
                      placeholder="Enter country"
                      className="rounded-2xl border-2 transition-all duration-300 focus:border-purple-400 focus:ring-purple-100 focus:ring-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-gray-700 font-semibold">
                      Postal Code *
                    </Label>
                    <Input
                      id="postalCode"
                      value={formData.address.postalCode}
                      onChange={(e) => updateField("address.postalCode", e.target.value)}
                      placeholder="Enter postal code"
                      className={`rounded-2xl border-2 transition-all duration-300 ${errors["address.postalCode"] ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"} focus:ring-4`}
                    />
                    {errors["address.postalCode"] && (
                      <p className="text-sm text-red-500 font-medium">{errors["address.postalCode"]}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8 border-purple-200" />

        <div className="flex justify-end space-x-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            className="rounded-2xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-8 py-3 font-semibold transition-all duration-300 min-w-[160px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-600 hover:via-blue-600 hover:to-purple-700 text-white border-0 rounded-2xl px-8 py-3 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[160px]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" /> Create Teacher
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
