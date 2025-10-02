"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit,
  Video,
  FileText,
  MoreVertical,
  BarChart3,
  TrendingUp,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Chapter {
  _id: string;
  title: string;
  description: string;
  contentType: "video" | "text";
  videoUrl?: string;
  textContent?: string;
  class: string;
  chapterNumber: number;
  unit: string;
  createdAt: Date;
  completedStudents?: string[];
}

const chaptersDown = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  title: `Chapter ${i + 1}`,
}));

export default function TeacherChaptersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [units, setUnits] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [chapter, setChapter] = useState<number | "">("");
  const itemsPerPage = 6;

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const teacherRes = await api.get(`/teacher/${user?.id}`);
      const grade = teacherRes?.data?.data?.classTeacherFor;

      if (!grade) {
        setChapters([]);
        return;
      }

      const chapterRes = await api.get(`/chapter/class/${grade}`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          chapter: chapter,
          unit: selectedUnit || "",
        },
      });
      const { data = [], total = 0 } = chapterRes.data;
      setChapters(data);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (error) {
      toast.error("Something went wrong while fetching chapters.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await api.get("/units/all");
      setUnits(res.data.data || []);
    } catch (error) {
      toast.error("Error fetching units:");
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchChapters();
      fetchUnits();
    }
  }, [user?.id, chapter, currentPage, searchTerm, selectedUnit, chapter]);

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      await api.delete(`/chapter/${chapterId}`);
      setChapters((prev) =>
        prev.filter((chapter) => chapter._id !== chapterId)
      );
      toast.success("Chapter deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete chapter. Try again.");
    }
  };

  const handleViewScores = (chapterId: string) => {
    router.push(`/dashboard/teacher/chapters/${chapterId}/scores`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Chapter Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your chapters and track student progress
              </p>
            </div>
            <Button
              className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => router.push("/dashboard/teacher/upload")}
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Chapter
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-4">
          <div className="max-w-md flex items-center gap-2">
            <Search className="text-gray-500" />
            <Input
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex sm:flex-row flex-col sm:gap-8 gap-4 sm:items-center items-start">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={selectedUnit}
                onValueChange={(value) => setSelectedUnit(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(({ unit }: any) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="chapter"
                className="text-sm font-medium text-slate-700"
              >
                Chapter Number
              </Label>
              <Select
                value={String(chapter)}
                onValueChange={(val) => setChapter(Number(val))}
              >
                <SelectTrigger
                  id="chapter"
                  className=" border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                >
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chaptersDown.map(({ id, title }) => (
                    <SelectItem key={id} value={id}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : chapters.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No chapters found
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first chapter
                </p>
                <Button
                  onClick={() => router.push("/dashboard/teacher/upload")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Chapter
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {chapters.map((chapter) => (
                  <Card
                    key={chapter._id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-white overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div
                        className={`h-2 ${
                          chapter.contentType === "video"
                            ? "bg-gradient-to-r from-red-400 to-pink-500"
                            : "bg-gradient-to-r from-blue-400 to-indigo-500"
                        }`}
                      ></div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                              chapter.contentType === "video"
                                ? "bg-gradient-to-r from-red-500 to-pink-600"
                                : "bg-gradient-to-r from-blue-500 to-indigo-600"
                            }`}
                          >
                            {chapter.contentType === "video" ? (
                              <Video className="h-7 w-7 text-white" />
                            ) : (
                              <FileText className="h-7 w-7 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900 truncate">
                                {chapter.title}
                              </h3>
                              <Badge
                                className={`capitalize text-xs ${
                                  chapter.contentType === "video"
                                    ? "bg-red-100 text-red-700 border-red-200"
                                    : "bg-blue-100 text-blue-700 border-blue-200"
                                }`}
                              >
                                {chapter.contentType}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                              {chapter.description}
                            </p>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Class:</span>
                            <span className="font-medium text-gray-900">
                              {chapter.class}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">unit:</span>
                            <span className="font-medium text-gray-900">
                              {chapter?.unit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Chapter:</span>
                            <span className="font-medium text-gray-900">
                              {chapter?.chapterNumber}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Created:</span>
                            <span className="font-medium text-gray-900">
                              {new Date(chapter.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Students:</span>
                            <span className="font-medium text-gray-900">
                              {chapter.completedStudents?.length || 0} completed
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewScores(chapter._id)}
                            className="flex-1 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Scores
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/teacher/chapters/${chapter._id}/edit`
                              )
                            }
                            className="flex-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="px-3"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleDeleteChapter(chapter._id)}
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                              >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Delete Chapter
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
