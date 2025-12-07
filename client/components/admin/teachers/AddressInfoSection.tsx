"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormErrors } from "@/lib/teacherValidation";
import { MapPin } from "lucide-react";

interface AddressInfoSectionProps {
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  errors: FormErrors;
  onFieldChange: (field: string, value: string) => void;
}

export function AddressInfoSection({ address, errors, onFieldChange }: AddressInfoSectionProps) {
  return (
    <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardTitle className="flex items-center text-xl font-bold">
          <div className="p-2 bg-white/20 rounded-xl mr-3">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          Address Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <div className="space-y-2">
          <Label htmlFor="street" className="text-gray-700 font-semibold">
            Street Address *
          </Label>
          <Input
            id="street"
            value={address.street}
            onChange={(e) => onFieldChange("address.street", e.target.value)}
            placeholder="Enter street address"
            className={`rounded-2xl border-2 transition-all duration-300 ${
              errors["address.street"]
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"
            } focus:ring-4`}
          />
          {errors["address.street"] && <p className="text-sm text-red-500 font-medium">{errors["address.street"]}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-gray-700 font-semibold">
              City *
            </Label>
            <Input
              id="city"
              value={address.city}
              onChange={(e) => onFieldChange("address.city", e.target.value)}
              placeholder="Enter city"
              className={`rounded-2xl border-2 transition-all duration-300 ${
                errors["address.city"]
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"
              } focus:ring-4`}
            />
            {errors["address.city"] && <p className="text-sm text-red-500 font-medium">{errors["address.city"]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-gray-700 font-semibold">
              State *
            </Label>
            <Input
              id="state"
              value={address.state}
              onChange={(e) => onFieldChange("address.state", e.target.value)}
              placeholder="Enter state"
              className={`rounded-2xl border-2 transition-all duration-300 ${
                errors["address.state"]
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"
              } focus:ring-4`}
            />
            {errors["address.state"] && <p className="text-sm text-red-500 font-medium">{errors["address.state"]}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-gray-700 font-semibold">
              Country
            </Label>
            <Input
              id="country"
              value={address.country}
              onChange={(e) => onFieldChange("address.country", e.target.value)}
              placeholder="Enter country"
              className="rounded-2xl border-2 transition-all duration-300 focus:border-purple-400 focus:ring-purple-100 focus:ring-4"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-gray-700 font-semibold">
              Postal Code *
            </Label>
            <Input
              id="postalCode"
              value={address.postalCode}
              onChange={(e) => onFieldChange("address.postalCode", e.target.value)}
              placeholder="Enter postal code"
              className={`rounded-2xl border-2 transition-all duration-300 ${
                errors["address.postalCode"]
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"
              } focus:ring-4`}
            />
            {errors["address.postalCode"] && (
              <p className="text-sm text-red-500 font-medium">{errors["address.postalCode"]}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}