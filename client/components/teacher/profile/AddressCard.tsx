"use client";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Teacher } from "@/types/teacher/profile";

interface AddressCardProps {
  teacher: Teacher;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

export function AddressCard({
  teacher,
  isEditing,
  onInputChange,
}: AddressCardProps) {
  return (
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
            value={teacher.address?.street || ""}
            onChange={(e) => onInputChange("address.street", e.target.value)}
            readOnly={!isEditing}
            placeholder="Enter street address"
            className={`transition-all duration-300 ${
              isEditing
                ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50"
                : "bg-gray-50/50 border-gray-200"
            }`}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {["city", "state", "country", "postalCode"].map((field) => (
            <div key={field} className="space-y-2">
              <Label
                htmlFor={field}
                className="text-gray-700 font-medium capitalize"
              >
                {field === "postalCode" ? "Postal Code" : field}
              </Label>
              <Input
                id={field}
                value={teacher.address?.[field as keyof typeof teacher.address] || ""}
                onChange={(e) =>
                  onInputChange(`address.${field}`, e.target.value)
                }
                readOnly={!isEditing}
                placeholder={`Enter ${field}`}
                className={`transition-all duration-300 ${
                  isEditing
                    ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50"
                    : "bg-gray-50/50 border-gray-200"
                }`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}