"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  BookOpen,
  GripVertical,
  Save,
  Calendar,
  Layers,
  ArrowUpDown,
} from "lucide-react";
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
import { toast } from "sonner";
import api from "@/lib/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
interface Unit {
  _id: string;
  name: string;
  description?: string;
  orderIndex?: number;
}
interface TeacherGradeData {
  gradeId: string;
  gradeName: string;
  academicYear?: string;
  units: Unit[];
}
interface ValidationErrors {
  name?: string;
  description?: string;
}
export default function TeacherUnitsPage() {
  const [gradeData, setGradeData] = useState<TeacherGradeData | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    delete: false,
    deleteId: null as string | null,
  });
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/grades/teacher/unit/all");
      const data = response.data.data;
      console.log(response);
      setGradeData(data);
      setUnits(data.units || []);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch units.";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    if (!formData.name.trim()) {
      errors.name = "Unit name is required";
    } else if (
      formData.name.trim().length < 1 ||
      formData.name.trim().length > 100
    ) {
      errors.name = "Unit name must be between 1-100 characters";
    }
    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must not exceed 500 characters";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
    setValidationErrors({});
    setEditingUnit(null);
  };
  const handleOpenAdd = () => {
    resetForm();
    setModalState((prev) => ({ ...prev, add: true }));
  };
  const handleOpenEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      description: unit.description || "",
    });
    setValidationErrors({});
    setModalState((prev) => ({ ...prev, edit: true }));
  };
  const handleAddUnit = async () => {
    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };
      await api.post("/grades/teacher/unit", payload);
      toast.success("Unit added successfully");
      setModalState((prev) => ({ ...prev, add: false }));
      resetForm();
      fetchUnits();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add unit");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUpdateUnit = async () => {
    if (!validateForm() || !editingUnit) {
      toast.error("Please fix validation errors");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };
      await api.put(`/grades/teacher/unit/${editingUnit._id}`, payload);
      toast.success("Unit updated successfully");
      setModalState((prev) => ({ ...prev, edit: false }));
      resetForm();
      fetchUnits();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update unit");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteUnit = async (id: string) => {
    try {
      await api.delete(`/grades/teacher/unit/${id}`);
      toast.success("Unit deleted successfully");
      setModalState((prev) => ({ ...prev, delete: false, deleteId: null }));
      fetchUnits();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete unit");
    }
  };
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const items = Array.from(units);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setUnits(items);
    setIsReordering(true);
    try {
      const unitIds = items.map((unit) => unit._id);
      await api.patch("/grades/teacher/unit/reorder", { unitIds });
      toast.success("Units reordered successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reorder units");
      fetchUnits();
    } finally {
      setIsReordering(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-10 shadow-2xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-14 w-14 mr-4" />
            <h1 className="text-5xl font-bold">My Units</h1>
          </div>
          {gradeData && (
            <div className="text-center space-y-2">
              <p className="text-emerald-100 text-xl font-medium">
                {gradeData.gradeName}
              </p>
              {gradeData.academicYear && (
                <div className="flex items-center justify-center text-emerald-100">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{gradeData.academicYear}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-md">
            <Layers className="h-6 w-6 text-teal-600" />
            <div>
              <p className="text-sm text-slate-500">Total Units</p>
              <p className="text-2xl font-bold text-slate-800">
                {units.length}
              </p>
            </div>
          </div>
          <Button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Unit
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg py-8 bg-red-50 rounded-2xl border border-red-200">
            {error}
          </div>
        ) : (
          <>
            {units.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
                <BookOpen className="h-20 w-20 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-slate-700 mb-2">
                  No Units Yet
                </h3>
                <p className="text-slate-500 mb-6">
                  Create your first unit to get started organizing your
                  curriculum
                </p>
                <Button
                  onClick={handleOpenAdd}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create First Unit
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <ArrowUpDown className="h-6 w-6 text-teal-500" />
                    Units (Drag to Reorder)
                  </h2>
                  {isReordering && (
                    <div className="flex items-center gap-2 text-sm text-teal-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving order...
                    </div>
                  )}
                </div>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="units">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {units.map((unit, index) => (
                          <Draggable
                            key={unit._id}
                            draggableId={unit._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group relative bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-5 transition-all duration-200 ${
                                  snapshot.isDragging
                                    ? "shadow-2xl scale-105 rotate-2"
                                    : "shadow-md hover:shadow-lg"
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  {}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-1 cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-6 w-6 text-slate-400 group-hover:text-teal-500 transition-colors" />
                                  </div>
                                  {}
                                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg">
                                      {index + 1}
                                    </span>
                                  </div>
                                  {}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                                      {unit.name}
                                    </h3>
                                    {unit.description && (
                                      <p className="text-sm text-slate-600 line-clamp-2">
                                        {unit.description}
                                      </p>
                                    )}
                                  </div>
                                  {}
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleOpenEdit(unit)}
                                      className="h-10 w-10 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() =>
                                        setModalState((prev) => ({
                                          ...prev,
                                          delete: true,
                                          deleteId: unit._id,
                                        }))
                                      }
                                      className="h-10 w-10 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}
          </>
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-teal-500" />
                {modalState.add ? "Add New Unit" : "Edit Unit"}
              </DialogTitle>
              <DialogDescription>
                {modalState.add
                  ? "Create a new unit for your grade curriculum"
                  : "Update unit information"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Unit Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Introduction to Algebra, World History"
                  maxLength={100}
                  className={`mt-1 ${validationErrors.name ? "border-red-500" : ""}`}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.name.length}/100 characters
                </p>
                {validationErrors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of what this unit covers..."
                  maxLength={500}
                  rows={4}
                  className={`mt-1 ${
                    validationErrors.description ? "border-red-500" : ""
                  }`}
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={modalState.add ? handleAddUnit : handleUpdateUnit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {modalState.add ? "Adding..." : "Updating..."}
                  </>
                ) : (
                  <>
                    {modalState.add ? (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Unit
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Unit
                      </>
                    )}
                  </>
                )}
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
              <DialogTitle className="text-xl flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete Unit
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this unit? This action cannot be
                undone and may affect related content.
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
                  modalState.deleteId && handleDeleteUnit(modalState.deleteId)
                }
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
