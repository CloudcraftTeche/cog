import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          {}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-amber-500 shadow-lg animate-pulse">
            <AlertTriangle className="h-10 w-10 text-white drop-shadow-sm" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Access Denied
          </CardTitle>
          <CardDescription className="text-gray-600 mt-4 text-base leading-relaxed">
            Oops! You don't have permission to access this page. This area is restricted to authorized users only.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pt-4">
          <div className="space-y-4">
            {}
            <Button
              asChild
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Link href="/login" className="flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </Button>
            {}
            <Button
              asChild
              variant="outline"
              className="w-full border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 font-medium py-3 px-6 rounded-lg transition-all duration-200 bg-transparent"
            >
              <Link href="/" className="flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
          {}
          <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-sm text-orange-700 font-medium">Need help?</p>
            <p className="text-xs text-orange-600 mt-1">
              Contact your administrator if you believe this is an error, or if you need access to this resource.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
