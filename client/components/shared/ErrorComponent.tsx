import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
interface ErrorStateProps {
  message: string;
  backLink?: string;
  backLabel?: string;
}
export default function ErrorState({
  message,
  backLink = "/dashboard",
  backLabel = "Back to Dashboard",
}: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full animate-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-red-400/20 rounded-full animate-float-delayed" />
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col justify-center items-center min-h-[400px] p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-xl text-gray-700 font-medium mb-6">{message}</p>
          <Link href={backLink}>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}