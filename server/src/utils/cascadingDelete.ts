import { deleteFromCloudinary } from "../config/cloudinary";
export async function batchDeleteCloudinaryFiles(
  files: Array<{ publicId: string; resourceType?: "video" | "raw" | "image" }>
): Promise<void> {
  if (!files || files.length === 0) return;
  const deletePromises = files.map(({ publicId, resourceType = "raw" }) =>
    deleteFromCloudinary(publicId, resourceType).catch((err) => {
      console.error(`Failed to delete file ${publicId}:`, err);
      return null;
    })
  );
  await Promise.allSettled(deletePromises);
}
export function extractCloudinaryFiles(
  contentItems: Array<{
    type: string;
    publicId?: string;
  }>
): Array<{ publicId: string; resourceType: "video" | "raw" }> {
  const files: Array<{ publicId: string; resourceType: "video" | "raw" }> = [];
  for (const item of contentItems) {
    if (item.publicId) {
      const resourceType = item.type === "video" ? "video" : "raw";
      files.push({ publicId: item.publicId, resourceType });
    }
  }
  return files;
}
export function extractSubmissionFiles(
  submissions: Array<{
    type: string;
    filePublicId?: string;
  }>
): Array<{ publicId: string; resourceType: "video" | "raw" }> {
  const files: Array<{ publicId: string; resourceType: "video" | "raw" }> = [];
  for (const submission of submissions) {
    if (submission.filePublicId) {
      const resourceType = submission.type === "video" ? "video" : "raw";
      files.push({ publicId: submission.filePublicId, resourceType });
    }
  }
  return files;
}
export async function batchDeleteDocuments(
  model: any,
  filter: any,
  batchSize: number = 100
): Promise<number> {
  let totalDeleted = 0;
  let hasMore = true;
  while (hasMore) {
    const batch = await model.find(filter).limit(batchSize).lean();
    if (batch.length === 0) {
      hasMore = false;
      break;
    }
    const ids = batch.map((doc: any) => doc._id);
    await model.deleteMany({ _id: { $in: ids } });
    totalDeleted += batch.length;
    if (batch.length < batchSize) {
      hasMore = false;
    }
  }
  return totalDeleted;
}
export async function safeDeleteOperation(
  operationName: string,
  operation: () => Promise<any>
): Promise<void> {
  try {
    await operation();
  } catch (error) {
    console.error(`Failed to execute ${operationName}:`, error);
  }
}
export async function parallelDeleteOperations(
  operations: Array<{ name: string; operation: () => Promise<any> }>
): Promise<void> {
  const promises = operations.map(({ name, operation }) =>
    safeDeleteOperation(name, operation)
  );
  await Promise.all(promises);
}
export async function cleanupOrphanedChatRooms(): Promise<number> {
  const { ChatRoom } = await import("../models/chat/Chat.model");
  const result = await ChatRoom.deleteMany({
    $or: [
      { participants: { $size: 0 } },
      { participants: { $exists: false } },
      { participants: null },
    ],
  });
  return result.deletedCount || 0;
}
export async function removeUserReferences(
  model: any,
  fieldPath: string,
  userId: any
): Promise<void> {
  await model.updateMany(
    { [fieldPath]: userId },
    { $pull: { [fieldPath]: userId } }
  );
}
export async function verifyDeletionComplete(
  checks: Array<{ name: string; count: () => Promise<number> }>
): Promise<{ success: boolean; results: Record<string, number> }> {
  const results: Record<string, number> = {};
  for (const check of checks) {
    results[check.name] = await check.count();
  }
  const success = Object.values(results).every((count) => count === 0);
  return { success, results };
}
