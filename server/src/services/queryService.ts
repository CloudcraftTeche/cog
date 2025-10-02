import { uploadToCloudinary } from "../config/cloudinary";
import { Types } from "mongoose";
import { IQuery, Query } from "../models/query";
import { publishToQueue, QUEUE_NAMES } from "./rabbitmqServices";

export class QueryService {
  async createQuery(queryData: Partial<IQuery>, files?: Express.Multer.File[]): Promise<IQuery> {
    try {
      if (files && files.length > 0) {
        const attachments: Array<any> = [];
        for (const file of files) {
          const result = await uploadToCloudinary(file.path, "query-attachments", "raw");
          attachments.push({
            url: result.secure_url,
            publicId: result.public_id,
            fileType: file.mimetype,
            fileName: file.originalname,
          });
        }
        queryData.attachments = attachments;
      }

      const query = await Query.create(queryData);

      await query.populate("from", "name email role profilePictureUrl");
      await query.populate("to", "name email role");
      await query.populate("assignedTo", "name email role");
      await query.populate("responses.from", "name email role");

      await publishToQueue(QUEUE_NAMES.QUERY_EVENTS, {
        type: "QUERY_CREATED",
        queryId: query._id,
        from: query.from?._id || queryData.from,
        to: query.to?._id || queryData.to,
        priority: query.priority || queryData.priority,
        isSensitive: query.isSensitive || queryData.isSensitive || false,
        subject: query.subject || queryData.subject,
      });

      return query;
    } catch (error) {
      throw new Error(`Failed to create query: ${error}`);
    }
  }

  async getQueries(userId: string, role: string, filters: any = {}): Promise<IQuery[]> {
    let queryFilter: any = {};

    if (role === "student") {
      queryFilter.from = userId;
    } else if (role === "teacher") {
      queryFilter.$or = [{ to: userId }, { assignedTo: userId }, { from: userId }];
    } else if (role === "admin" || role === "superAdmin") {
    }

    if (filters.status) queryFilter.status = filters.status;
    if (filters.priority) queryFilter.priority = filters.priority;
    if (filters.queryType) queryFilter.queryType = filters.queryType;

    return await Query.find(queryFilter)
      .populate("from", "name email role profilePictureUrl")
      .populate("to", "name email role")
      .populate("assignedTo", "name email role")
      .populate("responses.from", "name email role")
      .sort({ createdAt: -1 });
  }

  async respondToQuery(
    queryId: string,
    responseData: any,
    files?: Express.Multer.File[]
  ): Promise<IQuery> {
    try {
      if (files && files.length > 0) {
        const attachments: Array<any> = [];
        for (const file of files) {
          const result = await uploadToCloudinary(file.path, "query-responses", "raw");
          attachments.push({
            url: result.secure_url,
            publicId: result.public_id,
            fileType: file.mimetype,
            fileName: file.originalname,
          });
        }
        responseData.attachments = attachments;
      }

      const query = await Query.findByIdAndUpdate(
        queryId,
        {
          $push: { responses: responseData },
          status: "in_progress",
        },
        { new: true }
      )
        .populate("from", "name email role profilePictureUrl")
        .populate("to", "name email role")
        .populate("assignedTo", "name email role")
        .populate("responses.from", "name email role");

      if (!query) throw new Error("Query not found");

      await publishToQueue(QUEUE_NAMES.QUERY_EVENTS, {
        type: "QUERY_RESPONSE",
        queryId,
        responseFrom: responseData.from,
        responseType: responseData.responseType,
        responseContent: responseData.content || responseData.text || null,
        queryOwner: query.from?._id || query.from,
      });

      return query;
    } catch (error) {
      throw new Error(`Failed to respond to query: ${error}`);
    }
  }

  async escalateQuery(
    queryId: string,
    escalatedTo: string,
    escalationReason: string,
    escalatedBy: string
  ): Promise<IQuery> {
    const query = await Query.findByIdAndUpdate(
      queryId,
      {
        assignedTo: escalatedTo,
        status: "escalated",
        escalatedFrom: escalatedBy,
        escalationReason,
      },
      { new: true }
    )
      .populate("from", "name email role profilePictureUrl")
      .populate("to", "name email role")
      .populate("assignedTo", "name email role")
      .populate("responses.from", "name email role");

    if (!query) throw new Error("Query not found");

    await publishToQueue(QUEUE_NAMES.QUERY_EVENTS, {
      type: "QUERY_ESCALATED",
      queryId,
      escalatedTo,
      escalatedBy,
      escalationReason,
      originalQueryFrom: query.from?._id || query.from,
      priority: "urgent",
    });

    return query;
  }

  async resolveQuery(queryId: string, resolvedBy: string): Promise<IQuery> {
    const query = await Query.findByIdAndUpdate(
      queryId,
      {
        status: "resolved",
        resolvedAt: new Date(),
        resolvedBy,
      },
      { new: true }
    )
      .populate("from", "name email role profilePictureUrl")
      .populate("to", "name email role")
      .populate("assignedTo", "name email role")
      .populate("responses.from", "name email role");

    if (!query) throw new Error("Query not found");

    await publishToQueue(QUEUE_NAMES.QUERY_EVENTS, {
      type: "QUERY_RESOLVED",
      queryId,
      resolvedBy,
      originalQueryFrom: query.from?._id || query.from,
    });

    return query;
  }

  async getQueryAnalytics(userId: string, role: string, timeframe: string = "month") {
    const startDate = new Date();
    if (timeframe === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeframe === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    let matchFilter: any = { createdAt: { $gte: startDate } };

    if (role === "teacher") {
      matchFilter.$or = [{ to: new Types.ObjectId(userId) }, { assignedTo: new Types.ObjectId(userId) }];
    } else if (role === "student") {
      matchFilter.from = new Types.ObjectId(userId);
    }

    const analytics = await Query.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalQueries: { $sum: 1 },
          resolvedQueries: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
          },
          escalatedQueries: {
            $sum: { $cond: [{ $eq: ["$status", "escalated"] }, 1, 0] }
          },
          avgResponseTime: {
            $avg: {
              $cond: [
                { $gt: ["$resolvedAt", null] },
                { $subtract: ["$resolvedAt", "$createdAt"] },
                0
              ]
            }
          },
          querysByType: {
            $push: "$queryType"
          },
          querysByPriority: {
            $push: "$priority"
          }
        }
      }
    ]);

    return analytics[0] || {};
  }
}

export const queryService = new QueryService();
