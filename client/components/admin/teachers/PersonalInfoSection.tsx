"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Upload } from "lucide-react";
import { FormErrors } from "@/lib/teacherValidation";
interface PersonalInfoSectionProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
  };
  errors: FormErrors;
  profilePicture: File | null;
  onFieldChange: (field: string, value: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export function PersonalInfoSection({
  formData,
  errors,
  profilePicture,
  onFieldChange,
  onFileChange,
}: PersonalInfoSectionProps) {
  return (
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
              onChange={(e) => onFieldChange("name", e.target.value)}
              placeholder="Enter full name"
              className={`rounded-2xl border-2 transition-all duration-300 ${
                errors.name
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"
              } focus:ring-4`}
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
              onChange={(e) => onFieldChange("email", e.target.value)}
              placeholder="Enter email address"
              className={`rounded-2xl border-2 transition-all duration-300 ${
                errors.email
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"
              } focus:ring-4`}
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
              onChange={(e) => onFieldChange("phone", e.target.value)}
              placeholder="Enter phone number"
              className={`rounded-2xl border-2 transition-all duration-300 ${
                errors.phone
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"
              } focus:ring-4`}
            />
            {errors.phone && <p className="text-sm text-red-500 font-medium">{errors.phone}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-gray-700 font-semibold">
              Gender *
            </Label>
            <Select value={formData.gender} onValueChange={(value) => onFieldChange("gender", value)}>
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
            onChange={(e) => onFieldChange("dateOfBirth", e.target.value)}
            className={`rounded-2xl border-2 transition-all duration-300 ${
              errors.dateOfBirth
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"
            } focus:ring-4`}
          />
          {errors.dateOfBirth && <p className="text-sm text-red-500 font-medium">{errors.dateOfBirth}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="profilePicture" className="text-gray-700 font-semibold">
            Profile Picture
          </Label>
          <div className="flex items-center space-x-4">
            <Input type="file" id="profilePicture" accept="image/*" onChange={onFileChange} className="hidden" />
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
  );
}