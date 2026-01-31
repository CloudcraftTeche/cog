// components/student/profile/AddressInfoCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudentFormData } from "@/types/student/student.types";
import { MapPin } from "lucide-react";

interface AddressInfoCardProps {
  student: StudentFormData;
  isEditing: boolean;
  onFieldChange: (field: string, value: string) => void;
}

export function AddressInfoCard({
  student,
  isEditing,
  onFieldChange,
}: AddressInfoCardProps) {
  return (
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
            value={student.address.street ?? ""}
            onChange={(e) => onFieldChange("address.street", e.target.value)}
            readOnly={!isEditing}
            placeholder="Enter street address"
            className={`transition-all duration-300 ${
              isEditing
                ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50"
                : "bg-gray-50/50 border-gray-200"
            }`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-gray-700 font-medium">
              City
            </Label>
            <Input
              id="city"
              value={student.address.city ?? ""}
              onChange={(e) => onFieldChange("address.city", e.target.value)}
              readOnly={!isEditing}
              placeholder="Enter city"
              className={`transition-all duration-300 ${
                isEditing
                  ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50"
                  : "bg-gray-50/50 border-gray-200"
              }`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state" className="text-gray-700 font-medium">
              State
            </Label>
            <Input
              id="state"
              value={student.address.state ?? ""}
              onChange={(e) => onFieldChange("address.state", e.target.value)}
              readOnly={!isEditing}
              placeholder="Enter state"
              className={`transition-all duration-300 ${
                isEditing
                  ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50"
                  : "bg-gray-50/50 border-gray-200"
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-gray-700 font-medium">
              Country
            </Label>
            <Input
              id="country"
              value={student.address.country ?? ""}
              onChange={(e) => onFieldChange("address.country", e.target.value)}
              readOnly={!isEditing}
              placeholder="Enter country"
              className={`transition-all duration-300 ${
                isEditing
                  ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50"
                  : "bg-gray-50/50 border-gray-200"
              }`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-gray-700 font-medium">
              Postal Code
            </Label>
            <Input
              id="postalCode"
              value={student.address.postalCode ?? ""}
              onChange={(e) => onFieldChange("address.postalCode", e.target.value)}
              readOnly={!isEditing}
              placeholder="Enter postal code"
              className={`transition-all duration-300 ${
                isEditing
                  ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50"
                  : "bg-gray-50/50 border-gray-200"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}