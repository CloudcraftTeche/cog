import { Request, Response } from "express";
import { Types } from "mongoose";
import { Query } from "../../../models/query";
import { publishToQueue, QUEUE_NAMES } from "../../../services/rabbitmqServices";

export class QueryController {
  async createQuery(req: Request, res: Response) {
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
        queryType,
        priority,
        isSensitive,
        attachments: attachments || [],
        tags: tags || [],
      });

      await query.save();
      await query.populate([
        { path: "from", select: "name email role" },
        { path: "to", select: "name email role" },
      ]);

      await publishToQueue(QUEUE_NAMES.NOTIFICATION_EVENTS, {
        type: "QUERY_CREATED",
        queryId: query._id,
        from: query.from,
        to: query.to,
        subject: query.subject,
        priority: query.priority,
        queryType: query.queryType,
      });

      res.status(201).json({
        success: true,
        data: query,
        message: "Query created successfully",
      });
    } catch (error:any) {
      console.error("Create query error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create query",
        error: error.message,
      });
    }
  }

  async getMyQueries(req: Request, res: Response) {
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
  }

  async getQueryById(req: Request, res: Response) {
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
  }

  async addResponse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content, responseType = "reply", attachments } = req.body;
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

      await query.save();
      await query.populate([
        { path: "from", select: "name email role avatar" },
        { path: "to", select: "name email role avatar" },
        { path: "responses.from", select: "name email role avatar" },
      ]);

      await publishToQueue(QUEUE_NAMES.NOTIFICATION_EVENTS, {
        type: "QUERY_RESPONSE",
        queryId: query._id,
        responseFrom: userId,
        queryOwner: query.from,
        subject: query.subject,
        responseContent: content.substring(0, 100),
      });

      const notifyUsers = [query.from.toString(), query.to.toString()]
        .filter(id => id !== userId);
      
   

      res.json({
        success: true,
        data: query,
        message: "Response added successfully",
      });
    } catch (error) {
      console.error("Add response error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add response",
      });
    }
  }

  async updateQueryStatus(req: Request, res: Response) {
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
        req.user.role === "admin";

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

      await query.save();
      await query.populate([
        { path: "from", select: "name email role avatar" },
        { path: "to", select: "name email role avatar" },
        { path: "assignedTo", select: "name email role avatar" },
      ]);

      await publishToQueue(QUEUE_NAMES.NOTIFICATION_EVENTS, {
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
  }

  async getAllQueries(req: Request, res: Response) {
    try {
      if (req.user.role !== "admin") {
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
  }

  async deleteQuery(req: Request, res: Response) {
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
        req.user.role === "admin";

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
  }
}