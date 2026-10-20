"use client";
import { useMemo } from "react";
import { GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import { Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/shared/DataTable";
import { getInitials } from "@/lib/teacherValidation";
import { ITeacher } from "@/types/admin/teacher.types";

interface TeachersTableProps {
  teachers: ITeacher[];
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const gradeOf = (teacher: ITeacher) =>
  typeof teacher.gradeId === "object" ? teacher.gradeId?.grade ?? "" : "";

export function TeachersTable({ teachers, loading, onEdit, onDelete }: TeachersTableProps) {
  const columns = useMemo<GridColDef<ITeacher>[]>(
    () => [
      {
        field: "name",
        headerName: "Teacher",
        flex: 1.2,
        minWidth: 220,
        renderCell: ({ row }) => (
          <div className="flex items-center gap-3 h-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={row.profilePictureUrl} alt={row.name} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-400 text-white text-sm font-bold">
                {getInitials(row.name)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-gray-900">{row.name}</span>
          </div>
        ),
      },
      { field: "email", headerName: "Email", flex: 1.4, minWidth: 220 },
      {
        field: "phone",
        headerName: "Phone",
        flex: 0.8,
        minWidth: 150,
        valueFormatter: (value?: string) => value || "Not provided",
      },
      {
        field: "grade",
        headerName: "Assigned Grade",
        flex: 0.8,
        minWidth: 150,
        valueGetter: (_value, row) => gradeOf(row),
        valueFormatter: (value: string) => value || "Not assigned",
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 90,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit"
            icon={<Edit className="h-4 w-4 text-green-600" />}
            label="Edit"
            onClick={() => onEdit(row._id)}
            showInMenu
          />,
          <GridActionsCellItem
            key="delete"
            icon={<Trash2 className="h-4 w-4 text-red-600" />}
            label="Delete"
            onClick={() => onDelete(row._id)}
            showInMenu
          />,
        ],
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <DataTable
      rows={teachers}
      columns={columns}
      getRowId={(row) => row._id}
      loading={loading}
      rowHeight={60}
      localeText={{ noRowsLabel: "No teachers found" }}
    />
  );
}
