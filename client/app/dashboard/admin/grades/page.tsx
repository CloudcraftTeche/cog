"use client";
import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  GraduationCap,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useGrades,
  useCreateGrade,
  useUpdateGrade,
  useDeleteGrade,
} from "@/hooks/admin/useGrades";
import {
  Grade,
  Unit,
  GradeFormData,
  ValidationErrors,
} from "@/types/admin/grade.types";
import {
  validateGradeForm,
  hasValidationErrors,
} from "@/lib/admin/validators/grade.validators";
import { getGradeGradient } from "@/utils/admin/grade.utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
export default function GradesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    view: false,
    delete: false,
    deleteId: null as string | null,
  });
  const [formData, setFormData] = useState<GradeFormData>({
    grade: "",
    description: "",
    academicYear: "",
    isActive: true,
    units: [],
  });
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [viewingGrade, setViewingGrade] = useState<Grade | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const {
    data: gradesData,
    isLoading,
    error,
  } = useGrades(searchQuery, page, 8);
  const createMutation = useCreateGrade();
  const updateMutation = useUpdateGrade();
  const deleteMutation = useDeleteGrade();
  const grades = gradesData?.data || [];
  const pagination = gradesData?.meta || {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  };
  const resetForm = () => {
    setFormData({
      grade: "",
      description: "",
      academicYear: "",
      isActive: true,
      units: [],
    });
    setValidationErrors({});
    setEditingGrade(null);
  };
  const handleOpenAdd = () => {
    resetForm();
    setModalState((prev) => ({ ...prev, add: true }));
  };
  const handleOpenEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setFormData({
      grade: grade.grade,
      description: grade.description || "",
      academicYear: grade.academicYear || "",
      isActive: grade.isActive ?? true,
      units: grade.units || [],
    });
    setValidationErrors({});
    setModalState((prev) => ({ ...prev, edit: true }));
  };
  const handleOpenView = (grade: Grade) => {
    setViewingGrade(grade);
    setModalState((prev) => ({ ...prev, view: true }));
  };
  const handleAddGrade = async () => {
    const errors = validateGradeForm(formData);
    setValidationErrors(errors);
    if (hasValidationErrors(errors)) {
      return;
    }
    await createMutation.mutateAsync(formData);
    setModalState((prev) => ({ ...prev, add: false }));
    resetForm();
  };
  const handleUpdateGrade = async () => {
    if (!editingGrade) return;
    const errors = validateGradeForm(formData);
    setValidationErrors(errors);
    if (hasValidationErrors(errors)) {
      return;
    }
    await updateMutation.mutateAsync({
      id: editingGrade._id,
      formData,
    });
    setModalState((prev) => ({ ...prev, edit: false }));
    resetForm();
  };
  const handleDeleteGrade = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setModalState((prev) => ({ ...prev, delete: false, deleteId: null }));
  };
  const addUnit = () => {
    setFormData((prev) => ({
      ...prev,
      units: [...prev.units, { name: "", description: "" }],
    }));
  };
  const updateUnit = (index: number, field: keyof Unit, value: string) => {
    setFormData((prev) => ({
      ...prev,
      units: prev.units.map((unit, i) =>
        i === index ? { ...unit, [field]: value } : unit
      ),
    }));
  };
  const removeUnit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      units: prev.units.filter((_, i) => i !== index),
    }));
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < pagination.totalPages) setPage(page + 1);
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-3xl shadow-lg">
          <p className="text-red-600 mb-4">Failed to load grades</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-8 mb-8 rounded-3xl shadow-2xl">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-12 w-12 mr-4" />
            <h1 className="text-5xl font-bold">Grade Management</h1>
          </div>
          <p className="text-indigo-100 text-lg">
            Manage academic grade levels, units, and classifications
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 pb-8">
        {}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="relative w-full md:max-w-md">
            <Input
              type="text"
              placeholder="Search grades..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-12 pr-4 py-3 h-12 border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <Button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 h-12 rounded-xl shadow-lg hover:shadow-xl"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Grade
          </Button>
        </div>
        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {grades.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <GraduationCap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-xl">No grades found</p>
              <p className="text-slate-400 text-sm mt-2">
                Create your first grade to get started
              </p>
            </div>
          ) : (
            grades.map((grade, index) => {
              const gradient = getGradeGradient(index);
              return (
                <div
                  key={grade._id}
                  className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => handleOpenView(grade)}
                >
                  <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}
                      >
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-800">
                            Grade {grade.grade}
                          </h2>
                          {grade.isActive ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {grade.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    {grade.academicYear && (
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        {grade.academicYear}
                      </div>
                    )}
                    {grade.units && grade.units.length > 0 && (
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {grade.units.length} Unit
                        {grade.units.length !== 1 ? "s" : ""}
                      </div>
                    )}
                    {grade.students && grade.students.length > 0 && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Users className="h-4 w-4 mr-2" />
                        {grade.students.length} Student
                        {grade.students.length !== 1 ? "s" : ""}
                      </div>
                    )}
                    <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 mt-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(grade);
                        }}
                        className="h-10 w-10 border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalState((prev) => ({
                            ...prev,
                            delete: true,
                            deleteId: grade._id,
                          }));
                        }}
                        className="h-10 w-10 border-2 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={page === 1}
              className="rounded-xl"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Prev
            </Button>
            <span className="text-sm text-slate-600 font-medium">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={page === pagination.totalPages}
              className="rounded-xl"
            >
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
        {}
        <Dialog
          open={modalState.add || modalState.edit}
          onOpenChange={(open) => {
            if (!open) {
              setModalState((prev) => ({ ...prev, add: false, edit: false }));
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {modalState.add ? "Add New Grade" : "Edit Grade"}
              </DialogTitle>
              <DialogDescription>
                {modalState.add
                  ? "Create a new grade with optional units and details"
                  : "Update grade information including units and status"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="grade">
                  Grade Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, grade: e.target.value }))
                  }
                  placeholder="e.g., Grade 10, Year 5, Class A"
                  maxLength={50}
                  className={validationErrors.grade ? "border-red-500" : ""}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.grade.length}/50 characters
                </p>
                {validationErrors.grade && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.grade}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of this grade level..."
                  maxLength={500}
                  rows={3}
                  className={
                    validationErrors.description ? "border-red-500" : ""
                  }
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.description.length}/500 characters
                </p>
                {validationErrors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.description}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      academicYear: e.target.value,
                    }))
                  }
                  placeholder="e.g., 2024-2025"
                  className={
                    validationErrors.academicYear ? "border-red-500" : ""
                  }
                />
                {validationErrors.academicYear && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.academicYear}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active Status
                </Label>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${formData.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {formData.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Units</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addUnit}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Unit
                  </Button>
                </div>
                {validationErrors.units && (
                  <p className="text-xs text-red-500 mb-2">
                    {validationErrors.units}
                  </p>
                )}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {formData.units.map((unit, index) => (
                    <div
                      key={unit._id || index}
                      className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          Unit {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeUnit(index)}
                          className="h-6 w-6 text-red-500 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        value={unit.name}
                        onChange={(e) =>
                          updateUnit(index, "name", e.target.value)
                        }
                        placeholder="Unit name"
                        maxLength={100}
                        className="mb-2"
                      />
                      <Textarea
                        value={unit.description || ""}
                        onChange={(e) =>
                          updateUnit(index, "description", e.target.value)
                        }
                        placeholder="Unit description (optional)"
                        maxLength={500}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setModalState((prev) => ({
                    ...prev,
                    add: false,
                    edit: false,
                  }));
                  resetForm();
                }}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={modalState.add ? handleAddGrade : handleUpdateGrade}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-gradient-to-r from-indigo-500 to-purple-500"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {modalState.add ? "Adding..." : "Updating..."}
                  </>
                ) : modalState.add ? (
                  "Add Grade"
                ) : (
                  "Update Grade"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {}
        <Dialog
          open={modalState.view}
          onOpenChange={(open) => {
            if (!open) {
              setModalState((prev) => ({ ...prev, view: false }));
              setViewingGrade(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {viewingGrade?.grade}
                {viewingGrade?.isActive ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
              </DialogTitle>
              <DialogDescription>Grade details and information</DialogDescription>
            </DialogHeader>
            {viewingGrade && (
              <div className="space-y-4 py-4">
                {viewingGrade.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-slate-700 mt-1">
                      {viewingGrade.description}
                    </p>
                  </div>
                )}
                {viewingGrade.academicYear && (
                  <div>
                    <Label className="text-sm font-medium">Academic Year</Label>
                    <p className="text-sm text-slate-700 mt-1">
                      {viewingGrade.academicYear}
                    </p>
                  </div>
                )}
                {viewingGrade.units && viewingGrade.units.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">
                      Units ({viewingGrade.units.length})
                    </Label>
                    <div className="space-y-2 mt-2">
                      {viewingGrade.units.map((unit, index) => (
                        <div
                          key={unit._id || index}
                          className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                        >
                          <p className="font-medium text-slate-800">
                            {index + 1}. {unit.name}
                          </p>
                          {unit.description && (
                            <p className="text-sm text-slate-600 mt-1">
                              {unit.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <p className="text-sm text-slate-700 mt-1">
                      {viewingGrade.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-slate-700 mt-1">
                      {new Date(viewingGrade.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setModalState((prev) => ({ ...prev, view: false }));
                  setViewingGrade(null);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {}
        <Dialog
          open={modalState.delete}
          onOpenChange={(open) => {
            if (!open) {
              setModalState((prev) => ({
                ...prev,
                delete: false,
                deleteId: null,
              }));
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Grade</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this grade? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  setModalState((prev) => ({
                    ...prev,
                    delete: false,
                    deleteId: null,
                  }))
                }
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  modalState.deleteId && handleDeleteGrade(modalState.deleteId)
                }
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}