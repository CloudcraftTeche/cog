"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Save,
  GraduationCap,
  MapPin,
  Calendar,
  Upload,
  Loader2,
  Mail,
  Phone,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

export default function EditStudentPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [currentProfileUrl, setCurrentProfileUrl] = useState<string>("")
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
    if (!studentId) return

    const fetchStudentData = async () => {
      try {
        setIsLoadingData(true)
        const response = await api.get(`/student/${studentId}`)
        const student = response.data.data

        setFormData({
          name: student.name || "",
          email: student.email || "",
          rollNumber: student.rollNumber || "",
          class: student.class || "",
          gender: student.gender || "",
          dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split("T")[0] : "",
          parentContact: student.parentContact || "",
          address: {
            street: student.address?.street || "",
            city: student.address?.city || "",
            state: student.address?.state || "",
            country: student.address?.country || "India",
            postalCode: student.address?.postalCode || "",
          },
        })

        if (student.profilePicture) {
          setCurrentProfileUrl(student.profilePicture)
        }
      } catch (error) {
        toast.error("Error fetching student data")
      } finally {
        setIsLoadingData(false)
      }
    }

    const fetchGrades = async () => {
      try {
        const response = await api.get("/grades/all")
        const data = response.data.data
        setGrades(data)
      } catch (error) {
        toast.error("Error fetching grades")
      }
    }

    Promise.all([fetchGrades(), fetchStudentData()])
  }, [studentId])

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

    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/
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
        return
      }

      if (!file.type.startsWith("image/")) {
        return
      }

      setProfilePicture(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdate = async () => {
    if (!validateForm()) {
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

      await api.put(`/student/${studentId}`, formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      router.push("/dashboard/admin/students")
    } catch (error) {
      toast.error("Error updating student")
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

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Loading student data...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-balance">Edit Student Profile</h1>
            <p className="text-indigo-100 text-lg">Update student information and details</p>
          </div>
        </div>
      </div>

      <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-lg">
        <AlertCircle className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-amber-800 font-medium">
          You are editing student information. Changes will be saved immediately upon submission.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-28 w-28 ring-4 ring-white/50 shadow-2xl">
                    {previewUrl || currentProfileUrl ? (
                      <Image
                        src={previewUrl || currentProfileUrl || "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"}
                        height={112}
                        width={112}
                        alt="Profile preview"
                        className="object-cover w-full h-full rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                        {getInitials(formData.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-lg">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">{formData.name || "Student Name"}</h3>
                  <p className="text-blue-100 font-medium">{formData.class ? `Class ${formData.class}` : "Class"}</p>
                  {formData.rollNumber && (
                    <p className="text-xs text-blue-200 bg-white/20 px-3 py-1 rounded-full mt-2 inline-block">
                      Roll No: {formData.rollNumber}
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
                  <p className="text-sm text-gray-600 truncate">{formData.email || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Parent Contact</p>
                  <p className="text-sm text-gray-600">{formData.parentContact || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 shadow-sm">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Age</p>
                  <p className="text-sm text-gray-600">{calculateAge(formData.dateOfBirth) || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 shadow-sm">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">
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
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <CardTitle className="flex items-center text-xl font-bold">
                <div className="p-2 bg-white/20 rounded-xl mr-3">
                  <GraduationCap className="h-6 w-6" />
                </div>
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8 bg-gradient-to-br from-white to-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-bold text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter student's full name"
                    className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-emerald-100 ${
                      errors.name ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-emerald-400"
                    }`}
                  />
                  {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name}</p>}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-bold text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Enter email address"
                    className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-100 ${
                      errors.email ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
                    }`}
                  />
                  {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="rollNumber" className="text-sm font-bold text-gray-700">
                    Roll Number *
                  </Label>
                  <Input
                    id="rollNumber"
                    value={formData.rollNumber}
                    onChange={(e) => updateField("rollNumber", e.target.value)}
                    placeholder="Enter roll number"
                    className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-purple-100 ${
                      errors.rollNumber
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200 focus:border-purple-400"
                    }`}
                  />
                  {errors.rollNumber && <p className="text-sm text-red-500 font-medium">{errors.rollNumber}</p>}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="class" className="text-sm font-bold text-gray-700">
                    Class *
                  </Label>
                  <Select value={formData.class} onValueChange={(value: string) => updateField("class", value)}>
                    <SelectTrigger
                      className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-indigo-100 ${
                        errors.class ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-indigo-400"
                      }`}
                    >
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {grades?.map(({ grade: g }) => (
                        <SelectItem key={g} value={g} className="rounded-lg">
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.class && <p className="text-sm text-red-500 font-medium">{errors.class}</p>}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="gender" className="text-sm font-bold text-gray-700">
                    Gender *
                  </Label>
                  <Select value={formData.gender} onValueChange={(value: string) => updateField("gender", value)}>
                    <SelectTrigger
                      className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-pink-100 ${
                        errors.gender ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-pink-400"
                      }`}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Male" className="rounded-lg">
                        Male
                      </SelectItem>
                      <SelectItem value="Female" className="rounded-lg">
                        Female
                      </SelectItem>
                      <SelectItem value="Other" className="rounded-lg">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-red-500 font-medium">{errors.gender}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="dateOfBirth" className="text-sm font-bold text-gray-700">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-cyan-100 ${
                      errors.dateOfBirth
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200 focus:border-cyan-400"
                    }`}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-red-500 font-medium">{errors.dateOfBirth}</p>}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="parentContact" className="text-sm font-bold text-gray-700">
                    Parent Contact *
                  </Label>
                  <Input
                    id="parentContact"
                    value={formData.parentContact}
                    onChange={(e) => updateField("parentContact", e.target.value)}
                    placeholder="Enter parent phone number"
                    className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-teal-100 ${
                      errors.parentContact
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200 focus:border-teal-400"
                    }`}
                  />
                  {errors.parentContact && <p className="text-sm text-red-500 font-medium">{errors.parentContact}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="profilePicture" className="text-sm font-bold text-gray-700">
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
                    className="flex items-center space-x-2 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200 hover:from-violet-100 hover:to-purple-100 text-violet-700 rounded-xl px-6 py-3 font-medium transition-all duration-200"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Change Image</span>
                  </Button>
                  {profilePicture && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg font-medium">
                      {profilePicture.name}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <CardTitle className="flex items-center text-xl font-bold">
                <div className="p-2 bg-white/20 rounded-xl mr-3">
                  <MapPin className="h-6 w-6" />
                </div>
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8 bg-gradient-to-br from-white to-gray-50">
              <div className="space-y-3">
                <Label htmlFor="street" className="text-sm font-bold text-gray-700">
                  Street Address *
                </Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => updateField("address.street", e.target.value)}
                  placeholder="Enter street address"
                  className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-orange-100 ${
                    errors["address.street"]
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-orange-400"
                  }`}
                />
                {errors["address.street"] && (
                  <p className="text-sm text-red-500 font-medium">{errors["address.street"]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="city" className="text-sm font-bold text-gray-700">
                    City *
                  </Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => updateField("address.city", e.target.value)}
                    placeholder="Enter city"
                    className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-amber-100 ${
                      errors["address.city"]
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200 focus:border-amber-400"
                    }`}
                  />
                  {errors["address.city"] && (
                    <p className="text-sm text-red-500 font-medium">{errors["address.city"]}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="state" className="text-sm font-bold text-gray-700">
                    State *
                  </Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => updateField("address.state", e.target.value)}
                    placeholder="Enter state"
                    className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-yellow-100 ${
                      errors["address.state"]
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200 focus:border-yellow-400"
                    }`}
                  />
                  {errors["address.state"] && (
                    <p className="text-sm text-red-500 font-medium">{errors["address.state"]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="country" className="text-sm font-bold text-gray-700">
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => updateField("address.country", e.target.value)}
                    placeholder="Enter country"
                    className="rounded-xl border-2 border-gray-200 focus:border-lime-400 transition-all duration-200 focus:ring-4 focus:ring-lime-100"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="postalCode" className="text-sm font-bold text-gray-700">
                    Postal Code *
                  </Label>
                  <Input
                    id="postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) => updateField("address.postalCode", e.target.value)}
                    placeholder="Enter postal code"
                    className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-green-100 ${
                      errors["address.postalCode"]
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200 focus:border-green-400"
                    }`}
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

      <Separator className="my-8 bg-gradient-to-r from-transparent via-gray-300 to-transparent h-px" />

      <div className="flex justify-end space-x-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
          className="px-8 py-3 rounded-2xl border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200"
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          disabled={isLoading}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 min-w-[160px]"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" /> Update Student
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
