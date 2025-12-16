import { uploadToCloudinary } from "@/config/cloudinary";
import { AuthenticatedRequest } from "@/middleware/authenticate";
import { Query } from "@/models/query/Query.model";
import { Admin, SuperAdmin } from "@/models/user/Admin.model";
import { Student } from "@/models/user/Student.model";
import { Teacher } from "@/models/user/Teacher.model";
import { ApiError } from "@/utils/ApiError";
import { Response, NextFunction } from "express";
export const createQuery = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { to, subject, content, queryType, priority, isSensitive, tags } =
      req.body;
    const student = await Student.findById(userId);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    const recipient = await Promise.race([
      Teacher.findOne({ _id: to, gradeId: student.gradeId }),
      Admin.findById(to),
      SuperAdmin.findById(to),
    ]);
    if (!recipient) {
      throw new ApiError(404, "Recipient not found or not authorized");
    }
    const attachments = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const result: any = await uploadToCloudinary(
          file.buffer,
          "queries/attachments"
        );
        attachments.push({
          url: result.secure_url,
          publicId: result.public_id,
          fileType: file.mimetype,
          fileName: file.originalname,
        });
      }
    }
    const query = await Query.create({
      from: userId,
      to,
      subject,
      content,
      queryType: queryType || "general",
      priority: priority || "medium",
      isSensitive: isSensitive || false,
      attachments,
      tags: tags || [],
      status: "open",
      lastActivity: new Date(),
    });
    const populatedQuery = await Query.findById(query._id)
      .populate("from", "name email profilePictureUrl")
      .populate("to", "name email role");
    res.status(201).json({
      success: true,
      message: "Query created successfully",
      data: populatedQuery,
    });
  } catch (err) {
    next(err);
  }
};
export const getStudentQueries = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10, status, queryType } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const filter: any = { from: userId };
    if (status) filter.status = status;
    if (queryType) filter.queryType = queryType;
    const [queries, total] = await Promise.all([
      Query.find(filter)
        .populate("to", "name email role profilePictureUrl")
        .populate("responses.from", "name role")
        .sort({ lastActivity: -1 })
        .skip(skip)
        .limit(limitNum),
      Query.countDocuments(filter),
    ]);
    
    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pageSize: queries.length,
      totalPages: Math.ceil(total / limitNum),
      data: queries,
    });
  } catch (err) {
    next(err);
  }
};
export const getReceivedQueries = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10, status, queryType, priority } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const filter: any = { to: userId };
    if (status) filter.status = status;
    if (queryType) filter.queryType = queryType;
    if (priority) filter.priority = priority;
    const [queries, total] = await Promise.all([
      Query.find(filter)
        .populate("from", "name email rollNumber gradeId profilePictureUrl")
        .populate("assignedTo", "name email")
        .sort({ priority: -1, lastActivity: -1 })
        .skip(skip)
        .limit(limitNum),
      Query.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pageSize: queries.length,
      totalPages: Math.ceil(total / limitNum),
      data: queries,
    });
  } catch (err) {
    next(err);
  }
};
export const getQueryById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const query = await Query.findById(id)
      .populate("from", "name email rollNumber gradeId profilePictureUrl")
      .populate("to", "name email role profilePictureUrl")
      .populate("assignedTo", "name email role")
      .populate("responses.from", "name email role profilePictureUrl")
      .populate("escalatedFrom", "name email role");
    
      
    if (!query) {
      throw new ApiError(404, "Query not found");
    }
    const isAdmin =
      userRole === "admin" ||
      userRole === "superAdmin" ||
      userRole === "teacher";
    const isInvolved =
      query.from._id.toString() === userId?.toString() ||
      query.to._id.toString() === userId?.toString() ||
      query.assignedTo?._id.toString() === userId?.toString();
    if (!isAdmin && !isInvolved) {
      throw new ApiError(403, "Not authorized to view this query");
    }
    res.status(200).json({
      success: true,
      data: query,
    });
  } catch (err) {
    next(err);
  }
};
export const addResponse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { content, responseType } = req.body;
    const query = await Query.findById(id)
      .populate("from", "name email rollNumber gradeId profilePictureUrl")
      .populate("to", "name email role profilePictureUrl")
      .populate("assignedTo", "name email role")
      .populate("responses.from", "name email role profilePictureUrl")
      .populate("escalatedFrom", "name email role");

    if (!query) {
      throw new ApiError(404, "Query not found");
    }
    const isAuthorized =
      query.to.toString() === userId?.toString() ||
      query.assignedTo?.toString() === userId?.toString();
    if (!isAuthorized) {
      throw new ApiError(403, "Not authorized to respond to this query");
    }
    const attachments = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const result: any = await uploadToCloudinary(
          file.buffer,
          "queries/response-attachments"
        );
        attachments.push({
          url: result.secure_url,
          publicId: result.public_id,
          fileType: file.mimetype,
          fileName: file.originalname,
        });
      }
    }
    query.responses.push({
      from: userId,
      content,
      attachments,
      responseType: responseType || "reply",
      createdAt: new Date(),
    } as any);
    if (query.status === "open") {
      query.status = "in_progress";
    }
    query.lastActivity = new Date();
    await query.save();
    const updatedQuery = await Query.findById(id)
      .populate("from", "name email rollNumber gradeId profilePictureUrl")
      .populate("to", "name email role profilePictureUrl")
      .populate("assignedTo", "name email role")
      .populate("responses.from", "name email role profilePictureUrl")
      .populate("escalatedFrom", "name email role");
    res.status(200).json({
      success: true,
      message: "Response added successfully",
      data: updatedQuery,
    });
  } catch (err) {
    next(err);
  }
};
export const updateQueryStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { status, resolvedBy } = req.body;
    const query = await Query.findById(id);
    if (!query) {
      throw new ApiError(404, "Query not found");
    }
    const isAuthorized =
      query.to.toString() === userId?.toString() ||
      query.assignedTo?.toString() === userId?.toString();
    if (!isAuthorized) {
      throw new ApiError(403, "Not authorized to update this query");
    }
    query.status = status;
    if (status === "resolved" || status === "closed") {
      query.resolvedAt = new Date();
      query.resolvedBy = resolvedBy || userId;
    }
    query.lastActivity = new Date();
    await query.save();
    res.status(200).json({
      success: true,
      message: "Query status updated successfully",
      data: query,
    });
  } catch (err) {
    next(err);
  }
};
export const assignQuery = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const query = await Query.findById(id);
    if (!query) {
      throw new ApiError(404, "Query not found");
    }
    query.assignedTo = assignedTo;
    query.status = "in_progress";
    query.lastActivity = new Date();
    await query.save();
    const updatedQuery = await Query.findById(id).populate(
      "assignedTo",
      "name email role"
    );
    res.status(200).json({
      success: true,
      message: "Query assigned successfully",
      data: updatedQuery,
    });
  } catch (err) {
    next(err);
  }
};
export const escalateQuery = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { to, escalationReason } = req.body;
    const query = await Query.findById(id);
    if (!query) {
      throw new ApiError(404, "Query not found");
    }
    const isAuthorized =
      query.to.toString() === userId?.toString() ||
      query.assignedTo?.toString() === userId?.toString();
    if (!isAuthorized) {
      throw new ApiError(403, "Not authorized to escalate this query");
    }
    query.status = "escalated";
    query.escalatedFrom = query.to;
    query.to = to;
    query.escalationReason = escalationReason;
    query.lastActivity = new Date();
    await query.save();
    res.status(200).json({
      success: true,
      message: "Query escalated successfully",
      data: query,
    });
  } catch (err) {
    next(err);
  }
};
export const addSatisfactionRating = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { rating } = req.body;
    const query = await Query.findById(id);
    if (!query) {
      throw new ApiError(404, "Query not found");
    }
    if (query.from.toString() !== userId?.toString()) {
      throw new ApiError(403, "Only query creator can add rating");
    }
    if (query.status !== "resolved" && query.status !== "closed") {
      throw new ApiError(400, "Can only rate resolved or closed queries");
    }
    query.satisfactionRating = rating;
    await query.save();
    res.status(200).json({
      success: true,
      message: "Rating added successfully",
      data: query,
    });
  } catch (err) {
    next(err);
  }
};
export const getQueryStatistics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const filter: any = {};
    if (userRole === "teacher") {
      filter.to = userId;
    }
    const [
      totalQueries,
      openQueries,
      inProgressQueries,
      resolvedQueries,
      escalatedQueries,
      averageRating,
      byPriority,
      byType,
    ] = await Promise.all([
      Query.countDocuments(filter),
      Query.countDocuments({ ...filter, status: "open" }),
      Query.countDocuments({ ...filter, status: "in_progress" }),
      Query.countDocuments({ ...filter, status: "resolved" }),
      Query.countDocuments({ ...filter, status: "escalated" }),
      Query.aggregate([
        { $match: { ...filter, satisfactionRating: { $exists: true } } },
        { $group: { _id: null, avgRating: { $avg: "$satisfactionRating" } } },
      ]),
      Query.aggregate([
        { $match: filter },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Query.aggregate([
        { $match: filter },
        { $group: { _id: "$queryType", count: { $sum: 1 } } },
      ]),
    ]);
    res.status(200).json({
      success: true,
      data: {
        total: totalQueries,
        byStatus: {
          open: openQueries,
          inProgress: inProgressQueries,
          resolved: resolvedQueries,
          escalated: escalatedQueries,
        },
        averageRating: averageRating[0]?.avgRating || 0,
        byPriority,
        byType,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getAvailableRecipients = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const student = await Student.findById(userId);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    const [teachers, admins, superAdmins] = await Promise.all([
      Teacher.find({ gradeId: student.gradeId }).select(
        "name email profilePictureUrl role gradeId"
      ),
      Admin.find({ role: "admin" }).select("name email profilePictureUrl role"),
      SuperAdmin.find({ role: "superAdmin" }).select(
        "name email profilePictureUrl role"
      ),
    ]);
    res.status(200).json({
      success: true,
      data: {
        teachers,
        admins,
        superAdmins,
      },
    });
  } catch (err) {
    next(err);
  }
};
