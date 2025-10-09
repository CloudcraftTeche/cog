"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PlusIcon,
  SearchIcon,
  EditIcon,
  Trash2Icon,
  Loader2Icon,
  GraduationCap,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api";
import GradeFormModal from "@/components/ui/grade-form-modal";

interface Grade {
  _id: string;
  grade: string;
  createdAt: string;
  updatedAt: string;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    editData: null as Grade | null,
    delete: false,
    deleteId: null as string | null,
  });

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { page, limit } = pagination;
      const response = await api.get("/grades", {
        params: { q: searchQuery, page, limit },
      });
      setGrades(response.data.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.meta.total,
        totalPages: response.data.meta.totalPages,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch grades.";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery]);

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAddGrade = async (gradeValue: string) => {
    try {
      await api.post("/grades", { grade: gradeValue });
      toast.success("Grade added successfully.");
      setModalState((prev) => ({ ...prev, add: false }));
      fetchGrades();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add grade.");
    }
  };

  const handleUpdateGrade = async (id: string, gradeValue: string) => {
    try {
      await api.put(`/grades/${id}`, { grade: gradeValue });
      toast.success("Grade updated successfully.");
      setModalState({ ...modalState, edit: false, editData: null });
      fetchGrades();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update grade.");
    }
  };

  const handleDeleteGrade = async (id: string) => {
    try {
      await api.delete(`/grades/${id}`);
      toast.success("Grade deleted successfully.");
      setModalState({ ...modalState, delete: false, deleteId: null });
      fetchGrades();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete grade.");
    }
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };
  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-8 mb-8 rounded-3xl">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-10 w-10 mr-4" />
            <h1 className="text-4xl font-bold">Grade Management</h1>
          </div>
          <p className="text-indigo-100 text-lg">
            Manage academic grade levels and classifications
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="relative w-full md:max-w-md">
            <Input
              type="text"
              placeholder="Search grades..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-12 pr-4 py-3 h-12 border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl transition-all duration-300"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <Dialog
            open={modalState.add}
            onOpenChange={(open) =>
              setModalState((prev) => ({ ...prev, add: open }))
            }
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <PlusIcon className="mr-2 h-5 w-5" />
                Add New Grade
              </Button>
            </DialogTrigger>
            <GradeFormModal
              title="Add New Grade"
              onSubmit={async (value) => handleAddGrade(value)}
              onClose={() => setModalState((prev) => ({ ...prev, add: false }))}
            />
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2Icon className="h-12 w-12 animate-spin text-indigo-500" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg py-8 bg-red-50 rounded-2xl border border-red-200">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {grades.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-slate-500 text-xl">No grades found</p>
                </div>
              ) : (
                grades.map((grade, index) => {
                  const gradients = [
                    "from-indigo-500 to-purple-500",
                    "from-purple-500 to-pink-500",
                    "from-pink-500 to-rose-500",
                    "from-blue-500 to-indigo-500",
                    "from-cyan-500 to-blue-500",
                    "from-teal-500 to-cyan-500",
                  ];
                  const gradient = gradients[index % gradients.length];

                  return (
                    <div
                      key={grade._id}
                      className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
                    >
                      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div
                            className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mr-4`}
                          >
                            <Award className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-slate-800">
                              {grade.grade}
                            </h2>
                            <p className="text-sm text-slate-500">
                              Academic Level
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setModalState({
                                ...modalState,
                                edit: true,
                                editData: grade,
                              })
                            }
                            className="h-10 w-10 border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleDeleteGrade(grade?._id)
                            }
                            className="h-10 w-10 border-2 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Prev
                </Button>
                <span className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}

        <Dialog
          open={modalState.edit}
          onOpenChange={(open) =>
            setModalState((prev) => ({
              ...prev,
              edit: open,
              editData: open ? prev.editData : null,
            }))
          }
        >
          <GradeFormModal
            title="Edit Grade"
            initialData={modalState.editData}
            onSubmit={async (value) =>
              modalState.editData
                ? handleUpdateGrade(modalState.editData._id, value)
                : Promise.resolve()
            }
            onClose={() =>
              setModalState((prev) => ({ ...prev, edit: false, editData: null }))
            }
          />
        </Dialog>
      </div>
    </div>
  );
}
