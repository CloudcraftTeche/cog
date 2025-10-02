"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import api from "@/lib/api";
import { toast } from "sonner";

interface StudentFormData {
  name: string;
  email: string;
  rollNumber: string;
  class: string;
  gender: string;
  dateOfBirth: string;
  parentContact: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

interface FormErrors {
  [key: string]: string;
}

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [currentProfileUrl, setCurrentProfileUrl] = useState<string>("");
  const [grades, setGrades] = useState([]);

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
  });

  useEffect(() => {
    if (!studentId) return;

    const fetchStudentData = async () => {
      try {
        setIsLoadingData(true);
        const res = await api.get(`/student/${studentId}`);
        const student = res.data.data;

        setFormData({
          name: student.name || "",
          email: student.email || "",
          rollNumber: student.rollNumber || "",
          class: student.class || "",
          gender: student.gender || "",
          dateOfBirth: student.dateOfBirth
            ? student.dateOfBirth.split("T")[0]
            : "",
          parentContact: student.parentContact || "",
          address: {
            street: student.address?.street || "",
            city: student.address?.city || "",
            state: student.address?.state || "",
            country: student.address?.country || "India",
            postalCode: student.address?.postalCode || "",
          },
        });

        if (student.profilePicture) {
          setCurrentProfileUrl(student.profilePicture);
        }
      } catch (error) {
        toast.error("Error fetching student data");
      } finally {
        setIsLoadingData(false);
      }
    };

    const fetchGrades = async () => {
      try {
        const res = await api.get("/grades");
        setGrades(res.data.data);
      } catch {
        toast.error("Error fetching grades");
      }
    };

    Promise.all([fetchGrades(), fetchStudentData()]);
  }, [studentId]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof StudentFormData] as any),
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.rollNumber.trim())
      newErrors.rollNumber = "Roll number is required";
    if (!formData.class.trim()) newErrors.class = "Class is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.parentContact.trim())
      newErrors.parentContact = "Parent contact is required";

    if (!formData.address.street.trim())
      newErrors["address.street"] = "Street address is required";
    if (!formData.address.city.trim())
      newErrors["address.city"] = "City is required";
    if (!formData.address.state.trim())
      newErrors["address.state"] = "State is required";
    if (!formData.address.postalCode.trim())
      newErrors["address.postalCode"] = "Postal code is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
    if (formData.parentContact && !phoneRegex.test(formData.parentContact)) {
      newErrors.parentContact = "Please enter a valid phone number";
    }

    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 3 || age > 25) {
        newErrors.dateOfBirth = "Student age must be between 3 and 25 years";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            formDataObj.append(`${key}[${nestedKey}]`, String(nestedValue));
          });
        } else {
          formDataObj.append(key, String(value));
        }
      });

      if (profilePicture) {
        formDataObj.append("profilePicture", profilePicture);
      }

      await api.put(`/student/${studentId}`, formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      router.push("/dashboard/teacher/students");
    } catch (error) {
      toast.error("Error updating student");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "S"
    );
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    return `${age} years old`;
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading student data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You are editing student information. Changes will be saved immediately
          upon submission.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-green-200">
                    {previewUrl || currentProfileUrl ? (
                      <Image
                        src={
                          previewUrl || currentProfileUrl || "/placeholder.svg"
                        }
                        height={96}
                        width={96}
                        alt="Profile preview"
                        className="object-cover w-full h-full rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-white text-2xl font-semibold">
                        {getInitials(formData.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formData.name || "Student Name"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formData.class ? `${formData.class}` : "Class"}
                  </p>
                  {formData.rollNumber && (
                    <p className="text-xs text-gray-500">
                      Roll No: {formData.rollNumber}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Mail className="h-4 w-4 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-gray-600 truncate">
                    {formData.email || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Phone className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Parent Contact</p>
                  <p className="text-xs text-gray-600">
                    {formData.parentContact || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Age</p>
                  <p className="text-xs text-gray-600">
                    {calculateAge(formData.dateOfBirth) || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <MapPin className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-xs text-gray-600">
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
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <GraduationCap className="h-5 w-5 mr-2 text-green-500" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter student's full name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number *</Label>
                  <Input
                    id="rollNumber"
                    value={formData.rollNumber}
                    onChange={(e) => updateField("rollNumber", e.target.value)}
                    placeholder="Enter roll number"
                    className={errors.rollNumber ? "border-red-500" : ""}
                  />
                  {errors.rollNumber && (
                    <p className="text-sm text-red-500">{errors.rollNumber}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class *</Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value: string) =>
                      updateField("class", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.class ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades?.map(({ grade: g }) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.class && (
                    <p className="text-sm text-red-500">{errors.class}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: string) =>
                      updateField("gender", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.gender ? "border-red-500" : ""}
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
                    <p className="text-sm text-red-500">{errors.gender}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    className={errors.dateOfBirth ? "border-red-500" : ""}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentContact">Parent Contact *</Label>
                  <Input
                    id="parentContact"
                    value={formData.parentContact}
                    onChange={(e) =>
                      updateField("parentContact", e.target.value)
                    }
                    placeholder="Enter parent phone number"
                    className={errors.parentContact ? "border-red-500" : ""}
                  />
                  {errors.parentContact && (
                    <p className="text-sm text-red-500">
                      {errors.parentContact}
                    </p>
                  )}
                </div>
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
                    onClick={() =>
                      document.getElementById("profilePicture")?.click()
                    }
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Change Image</span>
                  </Button>
                  {profilePicture && (
                    <span className="text-sm text-gray-600">
                      {profilePicture.name}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MapPin className="h-5 w-5 mr-2 text-orange-500" /> Address
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) =>
                    updateField("address.street", e.target.value)
                  }
                  placeholder="Enter street address"
                  className={errors["address.street"] ? "border-red-500" : ""}
                />
                {errors["address.street"] && (
                  <p className="text-sm text-red-500">
                    {errors["address.street"]}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) =>
                      updateField("address.city", e.target.value)
                    }
                    placeholder="Enter city"
                    className={errors["address.city"] ? "border-red-500" : ""}
                  />
                  {errors["address.city"] && (
                    <p className="text-sm text-red-500">
                      {errors["address.city"]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) =>
                      updateField("address.state", e.target.value)
                    }
                    placeholder="Enter state"
                    className={errors["address.state"] ? "border-red-500" : ""}
                  />
                  {errors["address.state"] && (
                    <p className="text-sm text-red-500">
                      {errors["address.state"]}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) =>
                      updateField("address.country", e.target.value)
                    }
                    placeholder="Enter country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) =>
                      updateField("address.postalCode", e.target.value)
                    }
                    placeholder="Enter postal code"
                    className={
                      errors["address.postalCode"] ? "border-red-500" : ""
                    }
                  />
                  {errors["address.postalCode"] && (
                    <p className="text-sm text-red-500">
                      {errors["address.postalCode"]}
                    </p>
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
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          disabled={isLoading}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 min-w-[140px]"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> Update Student
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
