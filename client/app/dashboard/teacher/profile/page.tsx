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
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Edit2,
  Save,
  X,
  Loader2,
  Mail,
  User,
  Sparkles,
  Award,
  BookOpen,
  Camera,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
interface Teacher {
  name: string;
  email: string;
  phone?: string;
  qualifications?: string;
  specializations?: string[];
  gradeId?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  profilePictureUrl?: string;
}
export default function TeacherDetailsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [teacher, setTeacher] = useState<Teacher>({
    name: "",
    email: "",
    phone: "",
    qualifications: "",
    specializations: [],
    gradeId: "",
    gender: undefined,
    dateOfBirth: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
    },
    profilePictureUrl: "",
  });
  const [editedTeacher, setEditedTeacher] = useState<Teacher>(teacher);
  const [specializationInput, setSpecializationInput] = useState("");
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/teachers/${user?.id}`);
        const teacherData = response.data.data;
        const formattedTeacher = {
          name: teacherData.name || "",
          email: teacherData.email || "",
          phone: teacherData.phone || "",
          qualifications: teacherData.qualifications || "",
          specializations: teacherData.specializations || [],
          gradeId: teacherData.gradeId || "",
          gender: teacherData.gender,
          dateOfBirth: teacherData.dateOfBirth
            ? teacherData.dateOfBirth.split("T")[0]
            : "",
          address: {
            street: teacherData.address?.street || "",
            city: teacherData.address?.city || "",
            state: teacherData.address?.state || "",
            country: teacherData.address?.country || "India",
            postalCode: teacherData.address?.postalCode || "",
          },
          profilePictureUrl: teacherData.profilePictureUrl || "",
        };
        setTeacher(formattedTeacher);
        setEditedTeacher(formattedTeacher);
        setProfileImagePreview(teacherData.profilePictureUrl || "");
      } catch (error) {
        toast.error("Failed to fetch teacher data");
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.id) {
      fetchTeacherData();
    }
  }, [user?.id]);
  const handleEdit = () => {
    setIsEditing(true);
    setEditedTeacher(teacher);
  };
  const handleCancel = () => {
    setIsEditing(false);
    setEditedTeacher(teacher);
    setSpecializationInput("");
    setProfileImage(null);
    setProfileImagePreview(teacher.profilePictureUrl || "");
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
      Object.entries(editedTeacher).forEach(([key, value]) => {
        if (key === "address") {
          formData.append(key, JSON.stringify(value));
        } else if (key === "specializations") {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      if (profileImage) {
        formData.append("profilePicture", profileImage);
      }
      await api.put(`/teachers/${user?.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setTeacher(editedTeacher);
      setIsEditing(false);
      setSpecializationInput("");
      setProfileImage(null);
      toast.success("Profile updated successfully");
      const response = await api.get(`/teachers/${user?.id}`);
      const teacherData = response.data.data;
      setTeacher((prev) => ({
        ...prev,
        profilePictureUrl: teacherData.profilePictureUrl,
      }));
      setProfileImagePreview(teacherData.profilePictureUrl || "");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };
  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setEditedTeacher((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setEditedTeacher((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };
  const addSpecialization = () => {
    if (
      specializationInput.trim() &&
      !editedTeacher.specializations?.includes(specializationInput.trim())
    ) {
      setEditedTeacher((prev) => ({
        ...prev,
        specializations: [
          ...(prev.specializations || []),
          specializationInput.trim(),
        ],
      }));
      setSpecializationInput("");
    }
  };
  const removeSpecialization = (index: number) => {
    setEditedTeacher((prev) => ({
      ...prev,
      specializations: prev.specializations?.filter((_, i) => i !== index),
    }));
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <Loader2 className="relative animate-spin w-12 h-12 text-emerald-600" />
        </div>
      </div>
    );
  }
  const displayTeacher = isEditing ? editedTeacher : teacher;
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-green-400 to-cyan-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                  <div className="relative">
                    <Avatar className="h-24 w-24 ring-4 ring-white/50 shadow-2xl">
                      <AvatarImage
                        src={
                          profileImagePreview ||
                          ""
                        }
                        alt={teacher.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-green-500 text-white text-3xl font-bold">
                        {teacher.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all hover:scale-110"
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
                    {teacher.name}
                    <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                  </h1>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors">
                      <Award className="h-3 w-3 mr-1" />
                      Teacher
                    </Badge>
                    {teacher.email && (
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors">
                        <Mail className="h-3 w-3 mr-1" />
                        {teacher.email}
                      </Badge>
                    )}
                    {teacher.gender && (
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors capitalize">
                        {teacher.gender}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
                  value={displayTeacher.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  readOnly={!isEditing}
                  className={`transition-all duration-300 ${isEditing ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50" : "bg-gray-50/50 border-gray-200"}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={displayTeacher.email}
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
                    value={displayTeacher.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    readOnly={!isEditing}
                    placeholder="+91 1234567890"
                    className={`transition-all duration-300 ${isEditing ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50" : "bg-gray-50/50 border-gray-200"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-gray-700 font-medium">
                    Gender
                  </Label>
                  {isEditing ? (
                    <Select
                      value={displayTeacher.gender}
                      onValueChange={(value) =>
                        handleInputChange("gender", value)
                      }
                    >
                      <SelectTrigger className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50 transition-all duration-300">
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
                      value={displayTeacher.gender || ""}
                      readOnly
                      className="capitalize bg-gray-50/50 border-gray-200"
                    />
                  )}
                </div>
              </div>
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
                  value={displayTeacher.dateOfBirth || ""}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  readOnly={!isEditing}
                  className={`transition-all duration-300 ${isEditing ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50" : "bg-gray-50/50 border-gray-200"}`}
                />
              </div>
            </CardContent>
          </Card>
          {}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative pb-4">
              <CardTitle className="flex items-center text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-3 shadow-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 relative">
              <div className="space-y-2">
                <Label
                  htmlFor="qualifications"
                  className="text-gray-700 font-medium"
                >
                  Qualifications
                </Label>
                <Textarea
                  id="qualifications"
                  value={displayTeacher.qualifications || ""}
                  onChange={(e) =>
                    handleInputChange("qualifications", e.target.value)
                  }
                  readOnly={!isEditing}
                  placeholder="e.g., M.Ed., B.Sc. in Mathematics"
                  rows={3}
                  className={`transition-all duration-300 ${isEditing ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50" : "bg-gray-50/50 border-gray-200"}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        {}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] overflow-hidden group">
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
                value={displayTeacher.address.street || ""}
                onChange={(e) =>
                  handleInputChange("address.street", e.target.value)
                }
                readOnly={!isEditing}
                placeholder="Enter street address"
                className={`transition-all duration-300 ${isEditing ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50" : "bg-gray-50/50 border-gray-200"}`}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700 font-medium">
                  City
                </Label>
                <Input
                  id="city"
                  value={displayTeacher.address.city || ""}
                  onChange={(e) =>
                    handleInputChange("address.city", e.target.value)
                  }
                  readOnly={!isEditing}
                  placeholder="Enter city"
                  className={`transition-all duration-300 ${isEditing ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50" : "bg-gray-50/50 border-gray-200"}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-gray-700 font-medium">
                  State
                </Label>
                <Input
                  id="state"
                  value={displayTeacher.address.state || ""}
                  onChange={(e) =>
                    handleInputChange("address.state", e.target.value)
                  }
                  readOnly={!isEditing}
                  placeholder="Enter state"
                  className={`transition-all duration-300 ${isEditing ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50" : "bg-gray-50/50 border-gray-200"}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-gray-700 font-medium">
                  Country
                </Label>
                <Input
                  id="country"
                  value={displayTeacher.address.country || ""}
                  onChange={(e) =>
                    handleInputChange("address.country", e.target.value)
                  }
                  readOnly={!isEditing}
                  placeholder="Enter country"
                  className={`transition-all duration-300 ${isEditing ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50" : "bg-gray-50/50 border-gray-200"}`}
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
                  value={displayTeacher.address.postalCode || ""}
                  onChange={(e) =>
                    handleInputChange("address.postalCode", e.target.value)
                  }
                  readOnly={!isEditing}
                  placeholder="Enter postal code"
                  className={`transition-all duration-300 ${isEditing ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50" : "bg-gray-50/50 border-gray-200"}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
