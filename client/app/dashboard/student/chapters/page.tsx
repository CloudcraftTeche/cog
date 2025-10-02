"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  Play,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
  isCompleted: boolean;
  isAccessible: boolean;
  isInProgress: boolean;
  isLocked: boolean;
  createdAt: Date;
}

const chaptersDown = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  title: `Chapter ${i + 1}`,
}));

const ChaptersPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [units, setUnits] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [chapter, setChapter] = useState<number | "">("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchChapters = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const res = await api.get(`/chapter/student/${user?.id}`, {
        params: {
          page:currentPage,
          limit,
          query: query || "",
          unit: selectedUnit || "",
          chapter
        },
      });
      const data = res.data;
      setChapters(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError("Failed to load chapters. Please try again later.");
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
    Promise.all([fetchChapters(), fetchUnits()]);
  }, [user?.id, currentPage, query, selectedUnit, chapter]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">Loading chapters...</div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full animate-float-delayed"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">
              Learning Chapters
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Complete chapters in order to unlock the next ones and advance
              your learning journey
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-4">
            <div className="max-w-md flex items-center gap-2">
              <Search className="text-gray-500" />
              <Input
                placeholder="Search chapters..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
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
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {chapters?.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600 font-medium">No chapters found</p>
                <p className="text-gray-500 text-sm mt-1">
                  Try adjusting your search terms
                </p>
              </div>
            </div>
          ) : (
            chapters.map((chapter, index) => {
              const statusIcon = chapter.isCompleted ? (
                <CheckCircle className="h-5 w-5 text-white" />
              ) : chapter.isInProgress ? (
                <Play className="h-5 w-5 text-white" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              );

              const gradientClass = chapter.isCompleted
                ? "from-green-400 to-emerald-500"
                : chapter.isInProgress
                ? "from-orange-400 to-red-500"
                : chapter.isAccessible
                ? "from-purple-400 to-pink-500"
                : "from-gray-300 to-gray-400";

              return (
                <Card
                  key={chapter?._id}
                  className={`group border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br ${gradientClass} p-[2px] rounded-2xl ${
                    chapter.isAccessible ? "cursor-pointer" : "opacity-60"
                  }`}
                >
                  <CardContent className="bg-white rounded-2xl p-5 h-full">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Chapter {index + 1}
                          </span>
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${gradientClass} shadow-lg`}
                          >
                            {statusIcon}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {chapter.isCompleted && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-2 py-1">
                              Completed
                            </Badge>
                          )}
                          {chapter.isInProgress && (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs px-2 py-1">
                              Available
                            </Badge>
                          )}
                          {chapter.isLocked && (
                            <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs px-2 py-1">
                              Locked
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-gray-900 transition-colors">
                          {chapter.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                          {chapter.description}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Created:
                          {new Date(chapter.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="pt-2">
                        {chapter.isAccessible ? (
                          <Button
                            className={`w-full bg-gradient-to-r ${gradientClass} hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-white font-medium py-2.5 rounded-xl`}
                            onClick={() =>
                              router.push(
                                `/dashboard/student/chapters/${chapter?._id}`
                              )
                            }
                          >
                            {chapter.isCompleted ? (
                              <>
                                <Award className="h-4 w-4 mr-2" />
                                Review Chapter
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Start Learning
                              </>
                            )}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        ) : (
                          <Button
                            disabled
                            variant="outline"
                            className="w-full bg-gray-50 border-gray-200 text-gray-500 py-2.5 rounded-xl"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Complete Previous Chapters
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </section>

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
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
      </div>
    </div>
  );
};

export default ChaptersPage;
