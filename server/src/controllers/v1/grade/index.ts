import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError";
import { Grade } from "../../../models/academic/Grade.model";
import { Teacher } from "../../../models/user/Teacher.model";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Student } from "../../../models/user/Student.model";
export const createGradeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { grade, description, units, isActive, academicYear } = req.body;
    if (!grade || typeof grade !== "string") {
      throw new ApiError(400, "Invalid grade");
    }
    const existing = await Grade.findOne({ grade: grade.trim() });
    if (existing) {
      throw new ApiError(409, "Grade already exists");
    }
    const unitsData = units && Array.isArray(units)
      ? units.map((unit: any, index: number) => ({
          name: unit.name.trim(),
          description: unit.description?.trim(),
          orderIndex: index,
        }))
      : [];
    const newGrade = await Grade.create({
      grade: grade.trim(),
      description: description?.trim(),
      units: unitsData,
      isActive: isActive !== undefined ? isActive : true,
      academicYear: academicYear?.trim(),
      assignments:[],
      attendanceRecords:[],
      students:[],
      teachers:[],
      submissions:[]
    });
    res.status(201).json({
      message: "Grade created successfully",
      data: newGrade,
    });
  } catch (err) {
    next(err);
  }
};
export const listGradesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const q = (req.query.q as string) || "";
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const filter: any = {};
    if (q.trim()) {
      filter.$or = [
        { grade: { $regex: q.trim(), $options: "i" } },
        { description: { $regex: q.trim(), $options: "i" } },
      ];
    }
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      Grade.countDocuments(filter),
      Grade.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);
    const totalPages = Math.ceil(total / limit) || 1;
    res.status(200).json({
      message: "Grades fetched",
      meta: { total, totalPages, page, limit },
      data,
    });
  } catch (err) {
    next(err);
  }
};
export const getAllGradesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [total, data] = await Promise.all([
      Grade.countDocuments(),
      Grade.find().sort({ createdAt: 1 }).lean(),
    ]);
    res.status(200).json({
      message: "Grades fetched",
      meta: { total },
      data,
    });
  } catch (err) {
    next(err);
  }
};
export const getGradeByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid ID");
    }
    const grade = await Grade.findById(id)
      .select("_id grade description units isActive academicYear createdAt updatedAt")
      .lean();
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const responseData = {
      ...grade,
      units: grade.units || [],
    };
    res.status(200).json({ 
      message: "Grade fetched", 
      data: responseData 
    });
  } catch (err) {
    next(err);
  }
};
export const updateGradeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { grade, description, academicYear, isActive, units } = req.body;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid ID");
    }
    const existingGrade = await Grade.findById(id);
    if (!existingGrade) {
      throw new ApiError(404, "Grade not found");
    }
    if (grade && grade.trim() !== existingGrade.grade) {
      const duplicate = await Grade.findOne({
        grade: grade.trim(),
        _id: { $ne: id },
      });
      if (duplicate) {
        throw new ApiError(409, "Another grade with same name already exists");
      }
    }
    const updateData: any = {};
    if (grade !== undefined && typeof grade === "string") {
      updateData.grade = grade.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim();
    }
    if (academicYear !== undefined) {
      updateData.academicYear = academicYear?.trim();
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    if (units !== undefined && Array.isArray(units)) {
      updateData.units = units.map((unit: any, index: number) => ({
        _id: unit._id && mongoose.isValidObjectId(unit._id) ? unit._id : new mongoose.Types.ObjectId(),
        name: unit.name.trim(),
        description: unit.description?.trim(),
        orderIndex: index,
      }));
    }
    const updated = await Grade.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();
    res.status(200).json({ message: "Grade updated successfully", data: updated });
  } catch (err) {
    next(err);
  }
};
export const deleteGradeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid ID");
    }
    const deleted = await Grade.findByIdAndDelete(id).lean();
    if (!deleted) {
      throw new ApiError(404, "Grade not found");
    }
    res.status(200).json({ message: "Grade deleted successfully", data: deleted });
  } catch (err) {
    next(err);
  }
};
export const addUnitToGradeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid grade ID");
    }
    if (!name || typeof name !== "string") {
      throw new ApiError(400, "Unit name is required");
    }
    const grade = await Grade.findById(id);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const newUnit = {
      _id: new mongoose.Types.ObjectId(),
      name: name.trim(),
      description: description?.trim(),
      orderIndex: grade.units.length,
    };
    grade.units.push(newUnit as any);
    await grade.save();
    res.status(200).json({
      message: "Unit added successfully",
      data: grade,
    });
  } catch (err) {
    next(err);
  }
};
export const updateUnitHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, unitId } = req.params;
    const { name, description } = req.body;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(unitId)) {
      throw new ApiError(400, "Invalid ID");
    }
    const grade = await Grade.findById(id);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const unitIndex = grade.units.findIndex(
      (unit) => unit._id?.toString() === unitId
    );
    if (unitIndex === -1) {
      throw new ApiError(404, "Unit not found");
    }
    if (name !== undefined && typeof name === "string") {
      grade.units[unitIndex].name = name.trim();
    }
    if (description !== undefined) {
      grade.units[unitIndex].description = description?.trim();
    }
    await grade.save();
    res.status(200).json({
      message: "Unit updated successfully",
      data: grade,
    });
  } catch (err) {
    next(err);
  }
};
export const deleteUnitHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, unitId } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(unitId)) {
      throw new ApiError(400, "Invalid ID");
    }
    const grade = await Grade.findById(id);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const unitIndex = grade.units.findIndex(
      (unit) => unit._id?.toString() === unitId
    );
    if (unitIndex === -1) {
      throw new ApiError(404, "Unit not found");
    }
    grade.units.splice(unitIndex, 1);
    grade.units.forEach((unit, index) => {
      unit.orderIndex = index;
    });
    await grade.save();
    res.status(200).json({
      message: "Unit deleted successfully",
      data: grade,
    });
  } catch (err) {
    next(err);
  }
};
export const getGradeBasicInfoHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid ID");
    }
    const grade = await Grade.findById(id)
      .select("_id grade")
      .lean();
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    res.status(200).json({ 
      message: "Grade basic info fetched", 
      data: grade 
    });
  } catch (err) {
    next(err);
  }
};
export const getTeacherUnitsHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacherId = req.user._id; 
    const teacher = await Teacher.findById(teacherId).select("gradeId").lean();
    console.log(teacher);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    if (!teacher.gradeId) {
      throw new ApiError(400, "Teacher is not assigned to any grade");
    }
    const grade = await Grade.findById(teacher.gradeId)
      .select("_id grade units academicYear")
      .lean();
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    res.status(200).json({
      message: "Teacher units fetched successfully",
      data: {
        gradeId: grade._id,
        gradeName: grade.grade,
        academicYear: grade.academicYear,
        units: grade.units || [],
      },
    });
  } catch (err) {
    next(err);
  }
};
export const addTeacherUnitHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacherId = req.user._id;
    const { name, description } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      throw new ApiError(400, "Unit name is required");
    }
    const teacher = await Teacher.findById(teacherId).select("gradeId").lean();
    if (!teacher || !teacher.gradeId) {
      throw new ApiError(400, "Teacher is not assigned to any grade");
    }
    const grade = await Grade.findById(teacher.gradeId);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const newUnit = {
      _id: new mongoose.Types.ObjectId(),
      name: name.trim(),
      description: description?.trim(),
      orderIndex: grade.units.length,
    };
    grade.units.push(newUnit as any);
    await grade.save();
    res.status(201).json({
      message: "Unit added successfully",
      data: newUnit,
    });
  } catch (err) {
    next(err);
  }
};
export const updateTeacherUnitHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacherId = req.user._id;
    const { unitId } = req.params;
    const { name, description } = req.body;
    if (!mongoose.isValidObjectId(unitId)) {
      throw new ApiError(400, "Invalid unit ID");
    }
    const teacher = await Teacher.findById(teacherId).select("gradeId").lean();
    if (!teacher || !teacher.gradeId) {
      throw new ApiError(400, "Teacher is not assigned to any grade");
    }
    const grade = await Grade.findById(teacher.gradeId);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const unitIndex = grade.units.findIndex(
      (unit) => unit._id?.toString() === unitId
    );
    if (unitIndex === -1) {
      throw new ApiError(404, "Unit not found in your grade");
    }
    if (name !== undefined && typeof name === "string") {
      if (!name.trim()) {
        throw new ApiError(400, "Unit name cannot be empty");
      }
      grade.units[unitIndex].name = name.trim();
    }
    if (description !== undefined) {
      grade.units[unitIndex].description = description?.trim();
    }
    await grade.save();
    res.status(200).json({
      message: "Unit updated successfully",
      data: grade.units[unitIndex],
    });
  } catch (err) {
    next(err);
  }
};
export const deleteTeacherUnitHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacherId = req.user._id;
    const { unitId } = req.params;
    if (!mongoose.isValidObjectId(unitId)) {
      throw new ApiError(400, "Invalid unit ID");
    }
    const teacher = await Teacher.findById(teacherId).select("gradeId").lean();
    if (!teacher || !teacher.gradeId) {
      throw new ApiError(400, "Teacher is not assigned to any grade");
    }
    const grade = await Grade.findById(teacher.gradeId);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const unitIndex = grade.units.findIndex(
      (unit) => unit._id?.toString() === unitId
    );
    if (unitIndex === -1) {
      throw new ApiError(404, "Unit not found in your grade");
    }
    const deletedUnit = grade.units[unitIndex];
    grade.units.splice(unitIndex, 1);
    grade.units.forEach((unit, index) => {
      unit.orderIndex = index;
    });
    await grade.save();
    res.status(200).json({
      message: "Unit deleted successfully",
      data: deletedUnit,
    });
  } catch (err) {
    next(err);
  }
};
export const reorderTeacherUnitsHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacherId = req.user._id;
    const { unitIds } = req.body;
    if (!Array.isArray(unitIds) || unitIds.length === 0) {
      throw new ApiError(400, "Unit IDs array is required");
    }
    if (!unitIds.every(id => mongoose.isValidObjectId(id))) {
      throw new ApiError(400, "Invalid unit ID in array");
    }
    const teacher = await Teacher.findById(teacherId).select("gradeId").lean();
    if (!teacher || !teacher.gradeId) {
      throw new ApiError(400, "Teacher is not assigned to any grade");
    }
    const grade = await Grade.findById(teacher.gradeId);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const reorderedUnits = unitIds.map((id, index) => {
      const unit = grade.units.find(u => u._id?.toString() === id);
      if (!unit) {
        throw new ApiError(404, `Unit with ID ${id} not found`);
      }
      unit.orderIndex = index;
      return unit;
    });
    grade.units = reorderedUnits;
    await grade.save();
    res.status(200).json({
      message: "Units reordered successfully",
      data: grade.units,
    });
  } catch (err) {
    next(err);
  }
};
export const getGradesByTeacherHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { teacherId } = req.params;
    if (!mongoose.isValidObjectId(teacherId)) {
      throw new ApiError(400, "Invalid teacher ID");
    }
    const teacher = await Teacher.findById(teacherId).select("gradeId");
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    if (teacher.gradeId) {
      const grade = await Grade.findById(teacher.gradeId)
        .select("_id grade description isActive academicYear")
        .lean();
      if (grade) {
        return res.status(200).json({
          message: "Teacher grades fetched successfully",
          data: [grade],
        });
      }
    }
    res.status(200).json({
      message: "No grades found for this teacher",
      data: [],
    });
  } catch (err) {
    next(err);
  }
};
export const getGradeStudentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId } = req.params;
    const { page = 1, limit = 10, query = "" } = req.query;
    if (!mongoose.isValidObjectId(gradeId)) {
      throw new ApiError(400, "Invalid grade ID");
    }
    const grade = await Grade.findById(gradeId).select("grade");
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;
    const searchRegex = new RegExp(query as string, "i");
    const filter: any = {
      role: "student",
      gradeId: gradeId,
    };
    if (query) {
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { rollNumber: searchRegex },
      ];
    }
    const [students, total] = await Promise.all([
      Student.find(filter)
        .select("-password")
        .skip(skip)
        .limit(limitNum)
        .sort({ name: 1 })
        .lean(),
      Student.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limitNum) || 1;
    res.status(200).json({
      message: "Grade students fetched successfully",
      meta: {
        total,
        totalPages,
        page: pageNum,
        limit: limitNum,
        gradeName: grade.grade,
      },
      data: students,
    });
  } catch (err) {
    next(err);
  }
};