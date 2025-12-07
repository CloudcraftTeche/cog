import { Loader2 } from "lucide-react";
interface LoadingStateProps {
  message?: string;
}
export default function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-float blur-xl" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-float-delayed blur-xl" />
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col justify-center items-center min-h-[400px] p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 animate-pulse">
            <Loader2 className="animate-spin w-8 h-8 text-white" />
          </div>
          <p className="text-xl text-gray-700 font-medium text-center">{message}</p>
        </div>
      </div>
    </div>
  );
}