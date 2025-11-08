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
import { UserPlus, GraduationCap, MapPin, Calendar, Upload, Loader2, Mail, Phone } from "lucide-react"
import Image from "next/image"
import api from "@/lib/api"
import { toast } from "sonner"

interface StudentFormData {
  name: string
  email: string
  rollNumber: string
  class: string
  gender: string
  dateOfBirth: string
  parentContact: string
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

export default function AddStudentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [grades, setGrades] = useState([])

  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    email: "",
    rollNumber: "",
    class: "",
    gender: "",
    dateOfBirth: "",
    parentContact: "",
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
            ...(prev[parent as keyof StudentFormData] as any),
            [child]: value,
          },
        }
      }
      return { ...prev, [field]: value }
    })

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.rollNumber.trim()) newErrors.rollNumber = "Roll number is required"
    if (!formData.class.trim()) newErrors.class = "Class is required"
    if (!formData.gender) newErrors.gender = "Gender is required"
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
    if (!formData.parentContact.trim()) newErrors.parentContact = "Parent contact is required"

    if (!formData.address.street.trim()) newErrors["address.street"] = "Street address is required"
    if (!formData.address.city.trim()) newErrors["address.city"] = "City is required"
    if (!formData.address.state.trim()) newErrors["address.state"] = "State is required"
    if (!formData.address.postalCode.trim()) newErrors["address.postalCode"] = "Postal code is required"

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    const phoneRegex = /^[+]?\d{10,}$/
    if (formData.parentContact && !phoneRegex.test(formData.parentContact)) {
      newErrors.parentContact = "Please enter a valid phone number"
    }

    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 3 || age > 25) {
        newErrors.dateOfBirth = "Student age must be between 3 and 25 years"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed")
        return
      }

      setProfilePicture(file)

      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill the form")
      return
    }

    setIsLoading(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            formDataObj.append(`${key}[${nestedKey}]`, String(nestedValue))
          })
        } else {
          formDataObj.append(key, String(value))
        }
      })

      if (profilePicture) {
        formDataObj.append("profilePicture", profilePicture)
      }

      await api.post(`/student`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast.success("Student created successfully")
      router.push("/dashboard/admin/students")
    } catch (error: any) {
      toast.error(error.response.data.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "S"
    )
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return ""
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    return `${age} years old`
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-8 border border-emerald-100 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-2xl shadow-lg">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Add New Student
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Create a comprehensive student profile with all necessary details
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-28 w-28 ring-4 ring-white shadow-2xl">
                    {previewUrl ? (
                      <Image
                        src={previewUrl || "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"}
                        height={50}
                        width={50}
                        alt="Profile preview"
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-3xl font-bold">
                        {getInitials(formData.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {formData.name || "Student Name"}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">{formData.class ? `${formData.class}` : "Class"}</p>
                  {formData.rollNumber && (
                    <p className="text-xs text-gray-500 bg-white/60 px-3 py-1 rounded-full mt-2 inline-block">
                      Roll No: {formData.rollNumber}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl shadow-md border border-blue-200">
                <Mail className="h-5 w-5 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-blue-700">Email</p>
                  <p className="text-xs text-blue-600 truncate">{formData.email || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl shadow-md border border-emerald-200">
                <Phone className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-emerald-700">Parent Contact</p>
                  <p className="text-xs text-emerald-600">{formData.parentContact || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-100 to-violet-100 rounded-2xl shadow-md border border-purple-200">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-bold text-purple-700">Age</p>
                  <p className="text-xs text-purple-600">{calculateAge(formData.dateOfBirth) || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl shadow-md border border-orange-200">
                <MapPin className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-bold text-orange-700">Location</p>
                  <p className="text-xs text-orange-600">
                    {formData.address.city && formData.address.state
                      ? `${formData.address.city}, ${formData.address.state}`
                      : "Not set"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-green-700">
                <GraduationCap className="h-6 w-6 mr-3 text-green-500" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-green-700 font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter student's full name"
                    className={`bg-white/70 border-green-200 focus:border-green-400 shadow-sm ${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-green-700 font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Enter email address"
                    className={`bg-white/70 border-green-200 focus:border-green-400 shadow-sm ${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rollNumber" className="text-green-700 font-medium">
                    Roll Number *
                  </Label>
                  <Input
                    id="rollNumber"
                    value={formData.rollNumber}
                    onChange={(e) => updateField("rollNumber", e.target.value)}
                    placeholder="Enter roll number"
                    className={`bg-white/70 border-green-200 focus:border-green-400 shadow-sm ${errors.rollNumber ? "border-red-500" : ""}`}
                  />
                  {errors.rollNumber && <p className="text-sm text-red-500 font-medium">{errors.rollNumber}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class" className="text-green-700 font-medium">
                    Grade *
                  </Label>
                  <Select value={formData.class} onValueChange={(value: string) => updateField("class", value)}>
                    <SelectTrigger
                      className={`bg-white/70 border-green-200 focus:border-green-400 shadow-sm ${errors.class ? "border-red-500" : ""}`}
                    >
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades?.map(({ grade: g }) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.class && <p className="text-sm text-red-500 font-medium">{errors.class}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-green-700 font-medium">
                    Gender *
                  </Label>
                  <Select value={formData.gender} onValueChange={(value: string) => updateField("gender", value)}>
                    <SelectTrigger
                      className={`bg-white/70 border-green-200 focus:border-green-400 shadow-sm ${errors.gender ? "border-red-500" : ""}`}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-green-700 font-medium">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    className={`bg-white/70 border-green-200 focus:border-green-400 shadow-sm ${errors.dateOfBirth ? "border-red-500" : ""}`}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-red-500 font-medium">{errors.dateOfBirth}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentContact" className="text-green-700 font-medium">
                    Parent Contact *
                  </Label>
                  <Input
                    id="parentContact"
                    value={formData.parentContact}
                    onChange={(e) => updateField("parentContact", e.target.value)}
                    placeholder="Enter parent phone number"
                    className={`bg-white/70 border-green-200 focus:border-green-400 shadow-sm ${errors.parentContact ? "border-red-500" : ""}`}
                  />
                  {errors.parentContact && <p className="text-sm text-red-500 font-medium">{errors.parentContact}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePicture" className="text-green-700 font-medium">
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
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 text-blue-700 shadow-md"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Choose Image</span>
                  </Button>
                  {profilePicture && (
                    <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
                      {profilePicture.name}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-orange-700">
                <MapPin className="h-6 w-6 mr-3 text-orange-500" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street" className="text-orange-700 font-medium">
                  Street Address *
                </Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => updateField("address.street", e.target.value)}
                  placeholder="Enter street address"
                  className={`bg-white/70 border-orange-200 focus:border-orange-400 shadow-sm ${errors["address.street"] ? "border-red-500" : ""}`}
                />
                {errors["address.street"] && (
                  <p className="text-sm text-red-500 font-medium">{errors["address.street"]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-orange-700 font-medium">
                    City *
                  </Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => updateField("address.city", e.target.value)}
                    placeholder="Enter city"
                    className={`bg-white/70 border-orange-200 focus:border-orange-400 shadow-sm ${errors["address.city"] ? "border-red-500" : ""}`}
                  />
                  {errors["address.city"] && (
                    <p className="text-sm text-red-500 font-medium">{errors["address.city"]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-orange-700 font-medium">
                    State *
                  </Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => updateField("address.state", e.target.value)}
                    placeholder="Enter state"
                    className={`bg-white/70 border-orange-200 focus:border-orange-400 shadow-sm ${errors["address.state"] ? "border-red-500" : ""}`}
                  />
                  {errors["address.state"] && (
                    <p className="text-sm text-red-500 font-medium">{errors["address.state"]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-orange-700 font-medium">
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => updateField("address.country", e.target.value)}
                    placeholder="Enter country"
                    className="bg-white/70 border-orange-200 focus:border-orange-400 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-orange-700 font-medium">
                    Postal Code *
                  </Label>
                  <Input
                    id="postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) => updateField("address.postalCode", e.target.value)}
                    placeholder="Enter postal code"
                    className={`bg-white/70 border-orange-200 focus:border-orange-400 shadow-sm ${errors["address.postalCode"] ? "border-red-500" : ""}`}
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

      <Separator className="my-6" />

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
          className="bg-gray-50 border-gray-300 hover:bg-gray-100 shadow-md"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 min-w-[140px] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating...</span>
            </div>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" /> Create Student
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
