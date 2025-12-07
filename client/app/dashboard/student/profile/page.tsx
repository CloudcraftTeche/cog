"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  MapPin,
  Edit2,
  Save,
  X,
  Loader2,
  Mail,
  User,
  Sparkles,
  Camera,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
interface Student {
  name: string;
  email: string;
  phone?: string;
  rollNumber?: string;
  gradeId?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  parentContact?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  profilePictureUrl?: string;
}
export default function StudentDetailsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [student, setStudent] = useState<Student>({
    name: "",
    email: "",
    phone: "",
    rollNumber: "",
    gradeId: "",
    gender: undefined,
    dateOfBirth: "",
    parentContact: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
    },
    profilePictureUrl: "",
  });
  const [editedStudent, setEditedStudent] = useState<Student>(student);
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/students/${user?.id}`);
        const studentData = response.data.data;
        const formattedStudent = {
          name: studentData.name || "",
          email: studentData.email || "",
          phone: studentData.phone || "",
          rollNumber: studentData.rollNumber || "",
          gradeId: studentData.gradeId || "",
          gender: studentData.gender,
          dateOfBirth: studentData.dateOfBirth
            ? studentData.dateOfBirth.split("T")[0]
            : "",
          parentContact: studentData.parentContact || "",
          address: {
            street: studentData.address?.street || "",
            city: studentData.address?.city || "",
            state: studentData.address?.state || "",
            country: studentData.address?.country || "India",
            postalCode: studentData.address?.postalCode || "",
          },
          profilePictureUrl: studentData.profilePictureUrl || "",
        };
        setStudent(formattedStudent);
        setEditedStudent(formattedStudent);
        setProfileImagePreview(studentData.profilePictureUrl || "");
      } catch (error) {
        toast.error("Failed to fetch student data");
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.id) {
      fetchStudentData();
    }
  }, [user?.id]);
  const handleEdit = () => {
    setIsEditing(true);
    setEditedStudent(student);
  };
  const handleCancel = () => {
    setIsEditing(false);
    setEditedStudent(student);
    setProfileImage(null);
    setProfileImagePreview(student.profilePictureUrl || "");
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const formData = new FormData();
      Object.entries(editedStudent).forEach(([key, value]) => {
        if (key === "address") {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      if (profileImage) {
        formData.append("profilePicture", profileImage);
      }
      await api.put(`/students/${user?.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setStudent(editedStudent);
      setIsEditing(false);
      setProfileImage(null);
      toast.success("Profile updated successfully");
      const response = await api.get(`/students/${user?.id}`);
      const studentData = response.data.data;
      setStudent((prev) => ({
        ...prev,
        profilePictureUrl: studentData.profilePictureUrl,
      }));
      setProfileImagePreview(studentData.profilePictureUrl || "");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };
  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setEditedStudent((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setEditedStudent((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <Loader2 className="relative animate-spin w-12 h-12 text-violet-600" />
        </div>
      </div>
    );
  }
  const displayStudent = isEditing ? editedStudent : student;
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                  <div className="relative">
                    <Avatar className="h-24 w-24 ring-4 ring-white/50 shadow-2xl">
                      <AvatarImage
                        src={
                          profileImagePreview ||
                          "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"
                        }
                        alt={student.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-pink-500 text-white text-3xl font-bold">
                        {student.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full shadow-lg hover:from-violet-700 hover:to-purple-700 transition-all hover:scale-110"
                      >
                        <Camera className="h-4 w-4 text-white" />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    {student.name}
                    <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                  </h1>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {student.rollNumber && (
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {student.rollNumber}
                      </Badge>
                    )}
                    {student.email && (
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors">
                        <Mail className="h-3 w-3 mr-1" />
                        {student.email}
                      </Badge>
                    )}
                    {student.gender && (
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors capitalize">
                        {student.gender}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  className="bg-white text-purple-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                    className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative pb-4">
              <CardTitle className="flex items-center text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mr-3 shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 relative">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={displayStudent.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  readOnly={!isEditing}
                  className={`transition-all duration-300 ${isEditing ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50" : "bg-gray-50/50 border-gray-200"}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={displayStudent.email}
                  readOnly
                  className="bg-gray-100/50 border-gray-200 cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={displayStudent.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    readOnly={!isEditing}
                    placeholder="+91 1234567890"
                    className={`transition-all duration-300 ${isEditing ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50" : "bg-gray-50/50 border-gray-200"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-gray-700 font-medium">
                    Gender
                  </Label>
                  {isEditing ? (
                    <Select
                      value={displayStudent.gender}
                      onValueChange={(value) =>
                        handleInputChange("gender", value)
                      }
                    >
                      <SelectTrigger className="border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50 transition-all duration-300">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="gender"
                      value={displayStudent.gender || ""}
                      readOnly
                      className="capitalize bg-gray-50/50 border-gray-200"
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="dateOfBirth"
                    className="text-gray-700 font-medium"
                  >
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={displayStudent.dateOfBirth || ""}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    readOnly={!isEditing}
                    className={`transition-all duration-300 ${isEditing ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50" : "bg-gray-50/50 border-gray-200"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="rollNumber"
                    className="text-gray-700 font-medium"
                  >
                    Roll Number
                  </Label>
                  <Input
                    id="rollNumber"
                    value={displayStudent.rollNumber || ""}
                    onChange={(e) =>
                      handleInputChange("rollNumber", e.target.value)
                    }
                    readOnly={!isEditing}
                    className={`transition-all duration-300 ${isEditing ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50" : "bg-gray-50/50 border-gray-200"}`}
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="parentContact"
                  className="text-gray-700 font-medium"
                >
                  Parent Contact
                </Label>
                <Input
                  id="parentContact"
                  value={displayStudent.parentContact || ""}
                  onChange={(e) =>
                    handleInputChange("parentContact", e.target.value)
                  }
                  readOnly={!isEditing}
                  placeholder="+91 1234567890"
                  className={`transition-all duration-300 ${isEditing ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50" : "bg-gray-50/50 border-gray-200"}`}
                />
              </div>
            </CardContent>
          </Card>
          {}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-rose-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative pb-4">
              <CardTitle className="flex items-center text-xl bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg mr-3 shadow-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 relative">
              <div className="space-y-2">
                <Label htmlFor="street" className="text-gray-700 font-medium">
                  Street Address
                </Label>
                <Input
                  id="street"
                  value={displayStudent.address.street || ""}
                  onChange={(e) =>
                    handleInputChange("address.street", e.target.value)
                  }
                  readOnly={!isEditing}
                  placeholder="Enter street address"
                  className={`transition-all duration-300 ${isEditing ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50" : "bg-gray-50/50 border-gray-200"}`}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-700 font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={displayStudent.address.city || ""}
                    onChange={(e) =>
                      handleInputChange("address.city", e.target.value)
                    }
                    readOnly={!isEditing}
                    placeholder="Enter city"
                    className={`transition-all duration-300 ${isEditing ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50" : "bg-gray-50/50 border-gray-200"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-gray-700 font-medium">
                    State
                  </Label>
                  <Input
                    id="state"
                    value={displayStudent.address.state || ""}
                    onChange={(e) =>
                      handleInputChange("address.state", e.target.value)
                    }
                    readOnly={!isEditing}
                    placeholder="Enter state"
                    className={`transition-all duration-300 ${isEditing ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50" : "bg-gray-50/50 border-gray-200"}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="country"
                    className="text-gray-700 font-medium"
                  >
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={displayStudent.address.country || ""}
                    onChange={(e) =>
                      handleInputChange("address.country", e.target.value)
                    }
                    readOnly={!isEditing}
                    placeholder="Enter country"
                    className={`transition-all duration-300 ${isEditing ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50" : "bg-gray-50/50 border-gray-200"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="postalCode"
                    className="text-gray-700 font-medium"
                  >
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    value={displayStudent.address.postalCode || ""}
                    onChange={(e) =>
                      handleInputChange("address.postalCode", e.target.value)
                    }
                    readOnly={!isEditing}
                    placeholder="Enter postal code"
                    className={`transition-all duration-300 ${isEditing ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50" : "bg-gray-50/50 border-gray-200"}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
