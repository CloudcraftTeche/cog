export interface ValidationError {
  field: string;
  message: string;
}
export const validateDateRange = (
  startDate: string,
  endDate: string
): ValidationError | null => {
  if (!startDate || !endDate) {
    return null;
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  if (isNaN(start.getTime())) {
    return { field: "startDate", message: "Invalid start date format" };
  }
  if (isNaN(end.getTime())) {
    return { field: "endDate", message: "Invalid end date format" };
  }
  if (start > end) {
    return { field: "dateRange", message: "Start date must be before end date" };
  }
  if (start > today) {
    return { field: "startDate", message: "Start date cannot be in the future" };
  }
  if (end > today) {
    return { field: "endDate", message: "End date cannot be in the future" };
  }
  return null;
};
export const validateAttendanceStatus = (
  status: string
): ValidationError | null => {
  const validStatuses = ["present", "absent", "late", "excused", "all"];
  if (!validStatuses.includes(status)) {
    return { 
      field: "status", 
      message: `Status must be one of: ${validStatuses.join(", ")}` 
    };
  }
  return null;
};
export const validateMongoId = (id: string, fieldName: string): ValidationError | null => {
  const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!mongoIdRegex.test(id)) {
    return { 
      field: fieldName, 
      message: `Invalid ${fieldName} format` 
    };
  }
  return null;
};
