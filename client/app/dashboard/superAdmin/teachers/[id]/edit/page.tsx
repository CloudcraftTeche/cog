"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, GraduationCap, MapPin, Upload, Loader2, Save, Edit } from "lucide-react"
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

interface FormErrors {
  [key: string]: string
}

export default function EditTeacherPage() {
  const router = useRouter()
  const { id } = useParams()
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
        const data = res.data.data

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
      try {
        const res = await api.get("/grades/all")
        setGrades(res.data.data)
      } catch (error) {
        toast.error("Failed to fetch grades")
      }
    }

    Promise.all([fetchGrades(), fetchData()])
  }, [id])

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
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full text-white shadow-xl">
            <Edit className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Edit Teacher</h1>
          </div>
          <p className="text-gray-600 text-lg">Update teacher profile information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-2xl rounded-3xl bg-gradient-to-br from-white to-emerald-50 overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-r from-emerald-500 to-blue-600 text-white relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-28 w-28 ring-4 ring-white/50 shadow-2xl">
                      {formData?.profilePictureUrl || previewUrl ? (
                        <Image
                          src={formData.profilePictureUrl || previewUrl}
                          alt="Profile preview"
                          className="object-cover"
                          height={112}
                          width={112}
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-3xl font-bold">
                          {getInitials(formData?.name || "")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white">{formData.name || "Teacher Name"}</h3>
                    <p className="text-emerald-100 font-medium">{formData.classTeacherFor || "Class Assignment"}</p>
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
                    <p className="text-xs text-gray-600 truncate font-medium">{formData.email || ""}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-l-4 border-green-400">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-600 uppercase tracking-wide">Phone</p>
                    <p className="text-xs text-gray-600 font-medium">{formData.phone || ""}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-l-4 border-purple-400">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-purple-600 uppercase tracking-wide">Experience</p>
                    <p className="text-xs text-gray-600 font-medium">{formData.experience || ""}</p>
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
                        : " "}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl mr-3">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Enter full name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="Enter email address"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="Enter phone number"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.gender || ""}
                      onValueChange={(value: string) => updateField("gender", value)}
                    >
                      <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split("T")[0] : ""}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    className={errors.dateOfBirth ? "border-red-500" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture</Label>
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
                      className="flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Choose Image</span>
                    </Button>
                    {profilePicture && <span className="text-sm text-gray-600">{profilePicture.name || ""}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl mr-3">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classTeacherFor">Class Teacher For *</Label>
                    <Select
                      value={formData.classTeacherFor || ""}
                      onValueChange={(value: string) => updateField("classTeacherFor", value)}
                    >
                      <SelectTrigger
                        id="classTeacherFor"
                        value={formData?.classTeacherFor || ""}
                        className={errors.classTeacherFor ? "border-red-500" : ""}
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

                    {errors.classTeacherFor && <p className="text-sm text-red-500">{errors.classTeacherFor}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    value={formData.qualifications || ""}
                    onChange={(e) => updateField("qualifications", e.target.value)}
                    placeholder="e.g., B.Ed in Mathematics, M.Sc in Physics"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl mr-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.address.street || ""}
                    onChange={(e) => updateField("address.street", e.target.value)}
                    placeholder="Enter street address"
                    className={errors["address.street"] ? "border-red-500" : ""}
                  />
                  {errors["address.street"] && <p className="text-sm text-red-500">{errors["address.street"]}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.address.city || ""}
                      onChange={(e) => updateField("address.city", e.target.value)}
                      placeholder="Enter city"
                      className={errors["address.city"] ? "border-red-500" : ""}
                    />
                    {errors["address.city"] && <p className="text-sm text-red-500">{errors["address.city"]}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.address.state || ""}
                      onChange={(e) => updateField("address.state", e.target.value)}
                      placeholder="Enter state"
                      className={errors["address.state"] ? "border-red-500" : ""}
                    />
                    {errors["address.state"] && <p className="text-sm text-red-500">{errors["address.state"]}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.address.country || ""}
                      onChange={(e) => updateField("address.country", e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={formData.address.postalCode || ""}
                      onChange={(e) => updateField("address.postalCode", e.target.value)}
                      placeholder="Enter postal code"
                      className={errors["address.postalCode"] ? "border-red-500" : ""}
                    />
                    {errors["address.postalCode"] && (
                      <p className="text-sm text-red-500">{errors["address.postalCode"]}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8 border-emerald-200" />

        <div className="flex justify-end space-x-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            className="rounded-2xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-8 py-3 font-semibold transition-all duration-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 text-white border-0 rounded-2xl px-8 py-3 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[160px]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Update Teacher
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
