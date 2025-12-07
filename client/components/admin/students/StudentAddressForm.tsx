"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormErrors, StudentFormData } from "@/lib/studentValidation"
import { MapPin } from "lucide-react"
interface StudentAddressFormProps {
  formData: StudentFormData
  errors: FormErrors
  onFieldChange: (field: string, value: string) => void
}
export const StudentAddressForm = ({
  formData,
  errors,
  onFieldChange
}: StudentAddressFormProps) => {
  return (
    <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <CardTitle className="flex items-center text-xl font-bold">
          <div className="p-2 bg-white/20 rounded-xl mr-3">
            <MapPin className="h-6 w-6" />
          </div>
          Address Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-8 bg-gradient-to-br from-white to-gray-50">
        {}
        <div className="space-y-3">
          <Label htmlFor="street" className="text-sm font-bold text-gray-700">
            Street Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="street"
            value={formData.address.street}
            onChange={(e) => onFieldChange("address.street", e.target.value)}
            placeholder="Enter street address"
            className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-orange-100 ${
              errors["address.street"]
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-orange-400"
            }`}
          />
          {errors["address.street"] && (
            <p className="text-sm text-red-500 font-medium">{errors["address.street"]}</p>
          )}
        </div>
        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="city" className="text-sm font-bold text-gray-700">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              value={formData.address.city}
              onChange={(e) => onFieldChange("address.city", e.target.value)}
              placeholder="Enter city"
              className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-amber-100 ${
                errors["address.city"]
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-amber-400"
              }`}
            />
            {errors["address.city"] && (
              <p className="text-sm text-red-500 font-medium">{errors["address.city"]}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="state" className="text-sm font-bold text-gray-700">
              State <span className="text-red-500">*</span>
            </Label>
            <Input
              id="state"
              value={formData.address.state}
              onChange={(e) => onFieldChange("address.state", e.target.value)}
              placeholder="Enter state"
              className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-yellow-100 ${
                errors["address.state"]
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-yellow-400"
              }`}
            />
            {errors["address.state"] && (
              <p className="text-sm text-red-500 font-medium">{errors["address.state"]}</p>
            )}
          </div>
        </div>
        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="country" className="text-sm font-bold text-gray-700">
              Country
            </Label>
            <Input
              id="country"
              value={formData.address.country}
              onChange={(e) => onFieldChange("address.country", e.target.value)}
              placeholder="Enter country"
              className="rounded-xl border-2 border-gray-200 focus:border-lime-400 transition-all duration-200 focus:ring-4 focus:ring-lime-100"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="postalCode" className="text-sm font-bold text-gray-700">
              Postal Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="postalCode"
              value={formData.address.postalCode}
              onChange={(e) => onFieldChange("address.postalCode", e.target.value)}
              placeholder="Enter postal code"
              className={`rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-green-100 ${
                errors["address.postalCode"]
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-green-400"
              }`}
            />
            {errors["address.postalCode"] && (
              <p className="text-sm text-red-500 font-medium">{errors["address.postalCode"]}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}