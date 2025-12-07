"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, BookOpen } from "lucide-react";
import { FormErrors, TeacherFormData } from "@/lib/teacherProfileValidation";

interface AddressInfoSectionProps {
  formData: TeacherFormData;
  errors: FormErrors;
  onFieldUpdate: (field: string, value: string) => void;
}

export const AddressInfoSection: React.FC<AddressInfoSectionProps> = ({
  formData,
  errors,
  onFieldUpdate,
}) => {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center text-xl font-bold">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-3">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Address Information
          </span>
          <BookOpen className="h-5 w-5 text-orange-500 ml-2" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative">
        <div className="space-y-2">
          <Label htmlFor="street" className="text-gray-700 font-semibold">
            Street Address *
          </Label>
          <Input
            id="street"
            value={formData.address?.street || ""}
            onChange={(e) => onFieldUpdate("address.street", e.target.value)}
            placeholder="Enter street address"
            className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-orange-500/20 ${
              errors["address.street"]
                ? "border-red-500 focus:border-red-500"
                : "border-orange-200 focus:border-orange-500"
            }`}
          />
          {errors["address.street"] && (
            <p className="text-sm text-red-500 flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors["address.street"]}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-gray-700 font-semibold">
              City *
            </Label>
            <Input
              id="city"
              value={formData.address?.city || ""}
              onChange={(e) => onFieldUpdate("address.city", e.target.value)}
              placeholder="Enter city"
              className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-orange-500/20 ${
                errors["address.city"]
                  ? "border-red-500 focus:border-red-500"
                  : "border-orange-200 focus:border-orange-500"
              }`}
            />
            {errors["address.city"] && (
              <p className="text-sm text-red-500 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors["address.city"]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-gray-700 font-semibold">
              State *
            </Label>
            <Input
              id="state"
              value={formData.address?.state || ""}
              onChange={(e) => onFieldUpdate("address.state", e.target.value)}
              placeholder="Enter state"
              className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-orange-500/20 ${
                errors["address.state"]
                  ? "border-red-500 focus:border-red-500"
                  : "border-orange-200 focus:border-orange-500"
              }`}
            />
            {errors["address.state"] && (
              <p className="text-sm text-red-500 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors["address.state"]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-gray-700 font-semibold">
              Country
            </Label>
            <Input
              id="country"
              value={formData.address?.country || "India"}
              onChange={(e) => onFieldUpdate("address.country", e.target.value)}
              placeholder="Enter country"
              className="border-2 border-orange-200 focus:border-orange-500 transition-all duration-200 focus:ring-4 focus:ring-orange-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-gray-700 font-semibold">
              Postal Code *
            </Label>
            <Input
              id="postalCode"
              value={formData.address?.postalCode || ""}
              onChange={(e) => onFieldUpdate("address.postalCode", e.target.value)}
              placeholder="Enter postal code"
              className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-orange-500/20 ${
                errors["address.postalCode"]
                  ? "border-red-500 focus:border-red-500"
                  : "border-orange-200 focus:border-orange-500"
              }`}
            />
            {errors["address.postalCode"] && (
              <p className="text-sm text-red-500 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors["address.postalCode"]}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};