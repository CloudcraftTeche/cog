"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Upload } from "lucide-react";
import {
  FormErrors,
  StudentFormData,
  Grade,
} from "@/types/admin/student.types";

interface StudentInfoFormProps {
  formData: StudentFormData;
  errors: FormErrors;
  grades: Grade[];
  profilePicture: File | null;
  onFieldChange: (field: string, value: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StudentInfoForm = ({
  formData,
  errors,
  grades,
  profilePicture,
  onFieldChange,
  onFileChange,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormInput
            id="name"
            label="Full Name"
            required
            value={formData.name}
            onChange={(value) => onFieldChange("name", value)}
            placeholder="Enter student's full name"
            error={errors.name}
            focusColor="emerald"
          />

          <FormInput
            id="email"
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(value) => onFieldChange("email", value)}
            placeholder="student@example.com"
            error={errors.email}
            focusColor="blue"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FormInput
            id="rollNumber"
            label="Roll Number"
            value={formData.rollNumber}
            onChange={(value) => onFieldChange("rollNumber", value)}
            placeholder="Enter roll number"
            error={errors.rollNumber}
            focusColor="purple"
            optional
          />

          <FormSelect
            id="gradeId"
            label="Grade"
            required
            value={formData.gradeId}
            onChange={(value) => onFieldChange("gradeId", value)}
            placeholder="Select grade"
            error={errors.gradeId}
            focusColor="indigo"
            options={grades.map((g) => ({ value: g._id, label: g.grade }))}
          />

          <FormSelect
            id="gender"
            label="Gender"
            required
            value={formData.gender}
            onChange={(value) => onFieldChange("gender", value)}
            placeholder="Select gender"
            error={errors.gender}
            focusColor="pink"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormInput
            id="dateOfBirth"
            label="Date of Birth"
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(value) => onFieldChange("dateOfBirth", value)}
            max={new Date().toISOString().split("T")[0]}
            error={errors.dateOfBirth}
            focusColor="cyan"
          />

          <FormInput
            id="parentContact"
            label="Parent Contact"
            required
            value={formData.parentContact}
            onChange={(value) => onFieldChange("parentContact", value)}
            placeholder="+1234567890"
            error={errors.parentContact}
            focusColor="teal"
          />
        </div>

        <ProfilePictureUpload
          profilePicture={profilePicture}
          onFileChange={onFileChange}
        />
      </CardContent>
    </Card>
  );
};

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  max?: string;
  error?: string;
  focusColor: string;
}

const FormInput = ({
  id,
  label,
  type = "text",
  required = false,
  optional = false,
  value,
  onChange,
  placeholder,
  max,
  error,
  focusColor,
}: FormInputProps) => (
  <div className="space-y-3">
    <Label htmlFor={id} className="text-sm font-bold text-gray-700">
      {label}{" "}
      {required && <span className="text-red-500">*</span>}
      {optional && <span className="text-gray-400 text-xs">(Optional)</span>}
    </Label>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      max={max}
      className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-${focusColor}-100 ${
        error
          ? "border-red-400 focus:border-red-500"
          : `border-gray-200 focus:border-${focusColor}-400`
      }`}
    />
    {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
  </div>
);

interface FormSelectProps {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  focusColor: string;
  options: Array<{ value: string; label: string }>;
}

const FormSelect = ({
  id,
  label,
  required = false,
  value,
  onChange,
  placeholder,
  error,
  focusColor,
  options,
}: FormSelectProps) => (
  <div className="space-y-3">
    <Label htmlFor={id} className="text-sm font-bold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-${focusColor}-100 ${
          error
            ? "border-red-400 focus:border-red-500"
            : `border-gray-200 focus:border-${focusColor}-400`
        }`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="rounded-lg"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
  </div>
);

interface ProfilePictureUploadProps {
  profilePicture: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfilePictureUpload = ({
  profilePicture,
  onFileChange,
}: ProfilePictureUploadProps) => (
  <div className="space-y-3">
    <Label htmlFor="profilePicture" className="text-sm font-bold text-gray-700">
      Profile Picture{" "}
      <span className="text-gray-400 text-xs">
        (Max 5MB - JPEG, PNG, GIF, WEBP)
      </span>
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
);