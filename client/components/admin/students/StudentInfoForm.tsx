"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Upload } from "lucide-react"
import { FormErrors, StudentFormData } from "@/lib/studentValidation"
interface StudentInfoFormProps {
  formData: StudentFormData
  errors: FormErrors
  grades: Array<{ grade: string; _id: string }>
  profilePicture: File | null
  onFieldChange: (field: string, value: string) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
export const StudentInfoForm = ({
  formData,
  errors,
  grades,
  profilePicture,
  onFieldChange,
  onFileChange
}: StudentInfoFormProps) => {
  return (
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
        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-bold text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              placeholder="Enter student's full name"
              className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-emerald-100 ${
                errors.name ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-emerald-400"
              }`}
            />
            {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name}</p>}
          </div>
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-bold text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onFieldChange("email", e.target.value)}
              placeholder="student@example.com"
              className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-100 ${
                errors.email ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
              }`}
            />
            {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email}</p>}
          </div>
        </div>
        {}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label htmlFor="rollNumber" className="text-sm font-bold text-gray-700">
              Roll Number <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            <Input
              id="rollNumber"
              value={formData.rollNumber}
              onChange={(e) => onFieldChange("rollNumber", e.target.value)}
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
            <Label htmlFor="gradeId" className="text-sm font-bold text-gray-700">
              Grade <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.gradeId} onValueChange={(value: string) => onFieldChange("gradeId", value)}>
              <SelectTrigger
                className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-indigo-100 ${
                  errors.gradeId ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-indigo-400"
                }`}
              >
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {grades?.map(({ grade, _id }) => (
                  <SelectItem key={_id} value={_id} className="rounded-lg">
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gradeId && <p className="text-sm text-red-500 font-medium">{errors.gradeId}</p>}
          </div>
          <div className="space-y-3">
            <Label htmlFor="gender" className="text-sm font-bold text-gray-700">
              Gender <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.gender} onValueChange={(value: string) => onFieldChange("gender", value)}>
              <SelectTrigger
                className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-pink-100 ${
                  errors.gender ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-pink-400"
                }`}
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="male" className="rounded-lg">
                  Male
                </SelectItem>
                <SelectItem value="female" className="rounded-lg">
                  Female
                </SelectItem>
                <SelectItem value="other" className="rounded-lg">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-red-500 font-medium">{errors.gender}</p>}
          </div>
        </div>
        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="dateOfBirth" className="text-sm font-bold text-gray-700">
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => onFieldChange("dateOfBirth", e.target.value)}
              max={new Date().toISOString().split('T')[0]}
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
              Parent Contact <span className="text-red-500">*</span>
            </Label>
            <Input
              id="parentContact"
              value={formData.parentContact}
              onChange={(e) => onFieldChange("parentContact", e.target.value)}
              placeholder="+1234567890"
              className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-teal-100 ${
                errors.parentContact
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-teal-400"
              }`}
            />
            {errors.parentContact && <p className="text-sm text-red-500 font-medium">{errors.parentContact}</p>}
          </div>
        </div>
        {}
        <div className="space-y-3">
          <Label htmlFor="profilePicture" className="text-sm font-bold text-gray-700">
            Profile Picture <span className="text-gray-400 text-xs">(Max 5MB - JPEG, PNG, GIF, WEBP)</span>
          </Label>
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              id="profilePicture"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={onFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("profilePicture")?.click()}
              className="flex items-center space-x-2 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200 hover:from-violet-100 hover:to-purple-100 text-violet-700 rounded-xl px-6 py-3 font-medium transition-all duration-200"
            >
              <Upload className="h-4 w-4" />
              <span>Choose Image</span>
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
  )
}