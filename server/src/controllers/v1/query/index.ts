import {  Response } from "express";
import { Types } from "mongoose";
import { publishToQueue, QUEUE_NAMES } from "../../../services/rabbitmqServices";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Query } from "../../../models/query/Query.model";
import { User } from "../../../models/user/User.model";

export const createQuery = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      to,
      subject,
      content,
      queryType,
      priority,
      isSensitive,
      attachments,
      tags,
    } = req.body;

    const query = new Query({
      from: req.user.id,
      to,
      subject,
      content,
      queryType: queryType || "general",
      priority: priority || "medium",
      isSensitive: isSensitive || false,
      attachments: attachments || [],
      tags: tags || [],
    });

    await query.save();
    await query.populate([
      { path: "from", select: "name email role avatar department" },
      { path: "to", select: "name email role avatar department subject" },
    ]);

    await publishToQueue(QUEUE_NAMES.QUERY_EVENTS, {
      type: "QUERY_CREATED",
      queryId: query._id,
      from: query.from,
      to: query.to,
      subject: query.subject,
      priority: query.priority,
      queryType: query.queryType,
    });

    res.status(201).json(query);
  } catch (error: any) {
    console.error("Create query error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create query",
      error: error.message,
    });
  }
};

export const getStudentQueries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, queryType, page = 1, limit = 10, search } = req.query;
    const userId = req.user.id;

    const filter: any = { from: userId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (queryType) filter.queryType = queryType;
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const queries = await Query.find(filter)
      .populate([
        { path: "from", select: "name email role avatar" },
        { path: "to", select: "name email role avatar subject department" },
        { path: "responses.from", select: "name email role avatar" },
      ])
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Query.countDocuments(filter);

    res.json(queries);
  } catch (error) {
    console.error("Get student queries error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch queries",
    });
  }
};

export const getTeacherQueries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const filter: any = { to: userId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const queries = await Query.find(filter)
      .populate([
        { path: "from", select: "name email role avatar" },
        { path: "to", select: "name email role avatar" },
        { path: "responses.from", select: "name email role avatar" },
      ])
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Query.countDocuments(filter);

    res.json(queries);
  } catch (error) {
    console.error("Get teacher queries error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch queries",
    });
  }
};

export const getAdminMyQueries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, queryType } = req.query;
    const userId = req.user.id;

    const filter: any = { assignedTo: userId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (queryType) filter.queryType = queryType;

    const queries = await Query.find(filter)
      .populate([
        { path: "from", select: "name email role department" },
        { path: "to", select: "name email role department" },
        { path: "assignedTo", select: "name email role" },
        { path: "responses.from", select: "name email role" },
      ])
      .sort({ priority: -1, updatedAt: -1 });

    res.json(queries);
  } catch (error) {
    console.error("Get admin my queries error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch queries",
    });
  }
};

export const getAdminDepartmentQueries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, queryType } = req.query;
    const user = await User.findById(req.user.id);

  

    const filter: any = {
      $or: [
        { assignedTo: null },
        { assignedTo: { $exists: false } },
      ],
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (queryType) filter.queryType = queryType;

    const queries = await Query.find(filter)
      .populate([
        { path: "from", select: "name email role department" },
        { path: "to", select: "name email role department" },
        { path: "responses.from", select: "name email role" },
      ])
      .sort({ priority: -1, createdAt: -1 });

    res.json(queries);
  } catch (error) {
    console.error("Get department queries error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch queries",
    });
  }
};

export const assignQueryToMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = await Query.findByIdAndUpdate(
      id,
      {
        assignedTo: userId,
        status: "in_progress",
      },
      { new: true }
    ).populate([
      { path: "from", select: "name email role department" },
      { path: "to", select: "name email role department" },
      { path: "assignedTo", select: "name email role" },
    ]);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    await publishToQueue(QUEUE_NAMES.NOTIFICATION_EVENTS, {
      type: "QUERY_ASSIGNED",
      queryId: query._id,
      assignedTo: userId,
      queryOwner: query.from,
    });

    res.json(query);
  } catch (error) {
    console.error("Assign query error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign query",
    });
  }
};

export const getTeachers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("name email subject department avatar")
      .sort({ name: 1 });

    res.json(teachers);
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers",
    });
  }
};

export const getMyQueries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, queryType, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const filter: any = {
      $or: [{ from: userId }, { to: userId }],
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (queryType) filter.queryType = queryType;

    const skip = (Number(page) - 1) * Number(limit);

    const queries = await Query.find(filter)
      .populate([
        { path: "from", select: "name email role avatar" },
        { path: "to", select: "name email role avatar" },
        { path: "assignedTo", select: "name email role avatar" },
        { path: "responses.from", select: "name email role avatar" },
      ])
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Query.countDocuments(filter);

    res.json({
      success: true,
      data: {
        queries,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get queries error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch queries",
    });
  }
};

export const getQueryById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = await Query.findOne({
      _id: id,
      $or: [{ from: userId }, { to: userId }, { assignedTo: userId }],
    }).populate([
      { path: "from", select: "name email role avatar" },
      { path: "to", select: "name email role avatar" },
      { path: "assignedTo", select: "name email role avatar" },
      { path: "responses.from", select: "name email role avatar" },
    ]);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found or access denied",
      });
    }

    res.json({
      success: true,
      data: query,
    });
  } catch (error) {
    console.error("Get query error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch query",
    });
  }
};

export const addResponse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, responseType = "reply", attachments, from } = req.body;
    const userId = req.user.id;

    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    const canRespond =
      query.from.toString() === userId ||
      query.to.toString() === userId ||
      query.assignedTo?.toString() === userId;

    if (!canRespond) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to respond to this query",
      });
    }

    const response = {
      from: new Types.ObjectId(userId),
      content,
      responseType,
      attachments: attachments || [],
      createdAt: new Date(),
    };

    query.responses.push(response);

    if (query.status === "open") {
      query.status = "in_progress";
    }

    query.lastActivity = new Date();

    await query.save();
    await query.populate([
      { path: "from", select: "name email role avatar" },
      { path: "to", select: "name email role avatar" },
      { path: "responses.from", select: "name email role avatar" },
    ]);

    await publishToQueue(QUEUE_NAMES.QUERY_EVENTS, {
      type: "QUERY_RESPONSE",
      queryId: query._id,
      responseFrom: userId,
      queryOwner: query.from,
      subject: query.subject,
      responseContent: content.substring(0, 100),
    });

    res.json({
      success: true,
      data: query,
      response: response,
      message: "Response added successfully",
    });
  } catch (error) {
    console.error("Add response error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add response",
    });
  }
};

export const updateQueryStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, escalationReason } = req.body;
    const userId = req.user.id;

    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    const canUpdate =
      query.to.toString() === userId ||
      query.assignedTo?.toString() === userId ||
      req.user.role === "admin" ||
      req.user.role === "super_admin";

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this query",
      });
    }

    query.status = status;

    if (assignedTo) {
      query.assignedTo = new Types.ObjectId(assignedTo);
    }

    if (status === "escalated" && escalationReason) {
      query.escalatedFrom = query.to;
      query.escalationReason = escalationReason;
    }

    if (status === "resolved") {
      query.resolvedAt = new Date();
      query.resolvedBy = new Types.ObjectId(userId);
    }

    query.lastActivity = new Date();

    await query.save();
    await query.populate([
      { path: "from", select: "name email role avatar" },
      { path: "to", select: "name email role avatar" },
      { path: "assignedTo", select: "name email role avatar" },
    ]);

    await publishToQueue(QUEUE_NAMES.QUERY_EVENTS, {
      type: "QUERY_STATUS_UPDATED",
      queryId: query._id,
      status: status,
      updatedBy: userId,
      queryOwner: query.from,
    });

    res.json({
      success: true,
      data: query,
      message: "Query status updated successfully",
    });
  } catch (error) {
    console.error("Update query status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update query status",
    });
  }
};

export const getAllQueries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const {
      status,
      priority,
      queryType,
      page = 1,
      limit = 10,
      search,
    } = req.query;

    const filter: any = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (queryType) filter.queryType = queryType;
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const queries = await Query.find(filter)
      .populate([
        { path: "from", select: "name email role avatar" },
        { path: "to", select: "name email role avatar" },
        { path: "assignedTo", select: "name email role avatar" },
      ])
      .sort({ priority: -1, updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Query.countDocuments(filter);

    const stats = await Query.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        queries,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total,
        },
        statistics: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Get all queries error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch queries",
    });
  }
};

export const deleteQuery = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    const canDelete =
      query.from.toString() === userId ||
      req.user.role === "admin" ||
      req.user.role === "super_admin";

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this query",
      });
    }

    query.status = "closed";
    await query.save();

    res.json({
      success: true,
      message: "Query deleted successfully",
    });
  } catch (error) {
    console.error("Delete query error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete query",
    });
  }
};