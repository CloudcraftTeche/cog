"use client";
import {
  DataGrid,
  type DataGridProps,
  type GridColDef,
  type GridValidRowModel,
} from "@mui/x-data-grid";

export const DATA_TABLE_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

export interface DataTableProps<R extends GridValidRowModel>
  extends Omit<DataGridProps<R>, "rows" | "columns"> {
  rows: readonly R[];
  columns: GridColDef<R>[];
}

/**
 * Shared list table built on MUI X Data Grid: sorting, column filters,
 * toolbar quick search, column visibility and pagination out of the box.
 * Defaults to client-side mode; pass `paginationMode="server"` etc. through
 * props when the data is paged by the API.
 */
export function DataTable<R extends GridValidRowModel>({
  rows,
  columns,
  initialState,
  slotProps,
  sx,
  ...props
}: DataTableProps<R>) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        showToolbar
        disableRowSelectionOnClick
        pageSizeOptions={DATA_TABLE_PAGE_SIZE_OPTIONS}
        initialState={{
          ...initialState,
          pagination: {
            paginationModel: { page: 0, pageSize: DEFAULT_PAGE_SIZE },
            ...initialState?.pagination,
          },
        }}
        slotProps={{
          ...slotProps,
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 300 },
            csvOptions: { disableToolbarButton: true },
            printOptions: { disableToolbarButton: true },
            ...slotProps?.toolbar,
          },
        }}
        sx={[
          {
            border: 0,
            fontFamily: "inherit",
            "& .MuiDataGrid-columnHeader": { backgroundColor: "#faf5ff", color: "#581c87" },
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600 },
            "& .MuiDataGrid-row:hover": { backgroundColor: "rgba(250, 245, 255, 0.6)" },
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        {...props}
      />
    </div>
  );
}
