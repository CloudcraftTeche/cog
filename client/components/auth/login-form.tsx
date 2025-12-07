"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "../ui/alert";
import axios from "axios";
import api from "@/lib/api";
import Link from "next/link";
import { toast } from "sonner";
export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    try {
      const rememberMeStored = localStorage.getItem("rememberMe");
      if (rememberMeStored === "true") {
        setRememberMe(true);
        const savedEmail = localStorage.getItem("savedEmail");
        if (savedEmail) setEmail(savedEmail);
      }
    } catch (err) {
      console.error("LocalStorage read error:", err);
    }
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    if (!email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please provide a valid email address");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.post(
        "/auth/login",
        {
          email: email.trim().toLowerCase(),
          password,
        },
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const { user, accessToken } = res.data.data;
        const rememberDuration = rememberMe ? 7 : 1;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + rememberDuration);
        document.cookie = `rememberMe=${encodeURIComponent(
          rememberMe.toString()
        )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("rememberMe", rememberMe.toString());
        const expiry = Date.now() + 15 * 60 * 1000;
        localStorage.setItem("tokenExpiry", expiry.toString());
        if (rememberMe) {
          localStorage.setItem("savedEmail", email);
        } else {
          localStorage.removeItem("savedEmail");
        }
        toast.success("Login successful!");
        router.replace("/dashboard");
      }
    } catch (err) {
      let message = "An unexpected error occurred. Please try again.";
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const status = err.response.status;
          const errorData = err.response.data;
          message = errorData?.message || message;
          switch (status) {
            case 400:
              message = errorData?.message || "Invalid input. Please check your credentials.";
              break;
            case 401:
              message = errorData?.message || "Invalid email or password";
              break;
            case 429:
              message = "Too many login attempts. Please try again later.";
              break;
            case 500:
              message = "Server error. Please try again later.";
              break;
            case 503:
              message = "Service temporarily unavailable. Please try again later.";
              break;
          }
        } else if (err.request) {
          message = "Unable to connect to server. Please check your internet connection.";
        }
      }
      console.error("Login error:", err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto px-4 sm:px-6 py-8 bg-transparent">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
          Login
        </h2>
        <p className="text-sm sm:text-base text-white">
          Enter your credentials to login to your account
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label
            htmlFor="email"
            className="text-xs sm:text-sm font-medium text-white"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="example@scripture.edu"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={isLoading}
            className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400 text-white bg-white/10"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1">
          <Label
            htmlFor="password"
            className="text-xs sm:text-sm font-medium text-white"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={isLoading}
              className="w-full px-3 py-2 sm:py-2.5 pr-10 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400 text-white bg-white/10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-white hover:text-gray-200"
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
              disabled={isLoading}
              className="h-4 w-4 border border-gray-300 rounded bg-white/10 text-orange-500 focus:ring-2 focus:ring-offset-0 focus:ring-orange-500"
              aria-checked={rememberMe ? "true" : "false"}
              aria-label="Remember me"
              value="true"
              name="remember"
            />
            <Label
              htmlFor="remember"
              className="text-xs sm:text-sm text-white cursor-pointer"
            >
              Remember me
            </Label>
          </div>
          <Link
            href="/forget-password"
            className="text-xs sm:text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
        {error && (
          <Alert variant="destructive" className="border-red-500 bg-red-500/10">
            <AlertDescription className="text-white text-xs sm:text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-medium py-2 sm:py-2.5 px-4 text-sm sm:text-base rounded-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}