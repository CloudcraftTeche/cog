"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PlusIcon,
  SearchIcon,
  EditIcon,
  Trash2Icon,
  Loader2Icon,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api";
import UnitFormModal from "@/components/ui/unit-form-modal";

interface Unit {
  _id: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    editData: null as Unit | null,
    delete: false,
    deleteId: null as string | null,
  });

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { page, limit } = pagination;
      const response = await api.get("/units", {
        params: { q: searchQuery, page, limit },
      });
      setUnits(response.data.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.meta.total,
        totalPages: response.data.meta.totalPages,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch units.";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAddUnit = async (unitValue: string) => {
    try {
      await api.post("/units", { unit: unitValue });
      toast.success("Unit added successfully.");
      setModalState((prev) => ({ ...prev, add: false }));
      fetchUnits();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add unit.");
    }
  };

  const handleUpdateUnit = async (id: string, unitValue: string) => {
    try {
      await api.put(`/units/${id}`, { unit: unitValue });
      toast.success("Unit updated successfully.");
      setModalState({ ...modalState, edit: false, editData: null });
      fetchUnits();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update unit.");
    }
  };

  const handleDeleteUnit = async (id: string) => {
    try {
      await api.delete(`/units/${id}`);
      toast.success("Unit deleted successfully.");
      setModalState({ ...modalState, delete: false, deleteId: null });
      fetchUnits();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete unit.");
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
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-8 mb-8 rounded-3xl">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 mr-4" />
            <h1 className="text-4xl font-bold">Unit Management</h1>
          </div>
          <p className="text-emerald-100 text-lg">
            Organize your educational content by units
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="relative w-full md:max-w-md">
            <Input
              type="text"
              placeholder="Search units..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-12 pr-4 py-3 h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-300"
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
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <PlusIcon className="mr-2 h-5 w-5" />
                Add New Unit
              </Button>
            </DialogTrigger>
            <UnitFormModal
              title="Add New Unit"
              onSubmit={async (value) => handleAddUnit(value)}
              onClose={() =>
                setModalState((prev) => ({ ...prev, add: false }))
              }
            />
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2Icon className="h-12 w-12 animate-spin text-emerald-500" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg py-8 bg-red-50 rounded-2xl border border-red-200">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {units.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-12 w-12 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-xl">No units found</p>
                  <p className="text-slate-400 text-sm mt-2">
                    Create your first unit to get started
                  </p>
                </div>
              ) : (
                units.map((unit, index) => {
                  const gradients = [
                    "from-emerald-500 to-teal-500",
                    "from-blue-500 to-cyan-500",
                    "from-purple-500 to-pink-500",
                    "from-orange-500 to-red-500",
                    "from-indigo-500 to-purple-500",
                    "from-teal-500 to-green-500",
                  ];
                  const gradient = gradients[index % gradients.length];

                  return (
                    <div
                      key={unit._id}
                      className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                    >
                      <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div
                            className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mr-4`}
                          >
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-slate-800">
                              {unit.unit}
                            </h2>
                            <p className="text-sm text-slate-500">
                              Educational Unit
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
                                editData: unit,
                              })
                            }
                            className="h-10 w-10 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-all duration-300"
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setModalState({
                                ...modalState,
                                delete: true,
                                deleteId: unit._id,
                              })
                            }
                            className="h-10 w-10 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all duration-300"
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
          <UnitFormModal
            title="Edit Unit"
            initialData={modalState.editData}
            onSubmit={async (value) =>
              modalState.editData
                ? handleUpdateUnit(modalState.editData._id, value)
                : Promise.resolve()
            }
            onClose={() =>
              setModalState((prev) => ({ ...prev, edit: false, editData: null }))
            }
          />
        </Dialog>

        <Dialog
          open={modalState.delete}
          onOpenChange={(open) =>
            setModalState((prev) => ({
              ...prev,
              delete: open,
              deleteId: open ? prev.deleteId : null,
            }))
          }
        >
          <DialogTitle/>
          <DialogContent className="sm:max-w-[400px]">
            <h2 className="text-lg font-semibold mb-4">
              Confirm Delete
            </h2>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this unit? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() =>
                  setModalState((prev) => ({ ...prev, delete: false }))
                }
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  modalState.deleteId
                    ? handleDeleteUnit(modalState.deleteId)
                    : null
                }
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
