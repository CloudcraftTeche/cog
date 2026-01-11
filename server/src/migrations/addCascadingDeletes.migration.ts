import mongoose from "mongoose";
import { config } from "dotenv";
config();

async function runMigration() {
  try {
    console.log("🚀 Starting cascading delete migration...");
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("✅ Connected to database");

    await import("../models/user/User.model");
    await import("../models/user/Student.model");
    await import("../models/user/Teacher.model");
    await import("../models/user/Admin.model");
    await import("../models/academic/Grade.model");
    await import("../models/academic/Chapter.model");
    await import("../models/academic/TeacherChapter.model");
    await import("../models/assignment/Assignment.schema");
    await import("../models/assignment/Submission.schema");
    await import("../models/attendance/Attendance.schema");
    await import("../models/attendance/TeacherAttendance.schema");
    await import("../models/chat/Chat.model");
    await import("../models/chat/Message.model");
    await import("../models/query/Query.model");
    await import("../models/announcement");
    console.log("✅ All models imported");

    console.log("\n📋 Step 1: Cleaning up orphaned chat rooms...");
    const { ChatRoom } = await import("../models/chat/Chat.model");
    const orphanedRooms = await ChatRoom.deleteMany({
      $or: [
        { participants: { $size: 0 } },
        { participants: { $exists: false } },
        { participants: null },
      ],
    });
    console.log(
      `   Deleted ${orphanedRooms.deletedCount || 0} orphaned chat rooms`
    );

    console.log("\n📋 Step 2: Cleaning up message recipients...");
    const { Message } = await import("../models/chat/Message.model");
    const { User } = await import("../models/user/User.model");

    const allUserIds = await User.find().distinct("_id");
    const userIdStrings = allUserIds.map((id) => id.toString());

    const messages = await Message.find().lean();
    let messagesUpdated = 0;

    for (const message of messages) {
      const validRecipients = message.recipients.filter((r: any) =>
        userIdStrings.includes(r.userId.toString())
      );

      if (validRecipients.length !== message.recipients.length) {
        await Message.findByIdAndUpdate(message._id, {
          recipients: validRecipients,
        });
        messagesUpdated++;
      }
    }
    console.log(
      `   Updated ${messagesUpdated} messages with invalid recipients`
    );

    console.log("\n📋 Step 3: Cleaning up grade references...");
    const { Grade } = await import("../models/academic/Grade.model");
    const { Student } = await import("../models/user/Student.model");
    const { Teacher } = await import("../models/user/Teacher.model");

    const validGradeIds = await Grade.find().distinct("_id");

    const studentsWithInvalidGrade = await Student.find({
      gradeId: { $nin: validGradeIds, $ne: null },
    });

    if (studentsWithInvalidGrade.length > 0) {
      await Student.updateMany(
        { gradeId: { $nin: validGradeIds, $ne: null } },
        { $unset: { gradeId: "" } }
      );
      console.log(
        `   Fixed ${studentsWithInvalidGrade.length} students with invalid grade references`
      );
    }

    const teachersWithInvalidGrade = await Teacher.find({
      gradeId: { $nin: validGradeIds },
    });

    if (teachersWithInvalidGrade.length > 0) {
      console.log(
        `   ⚠️  Found ${teachersWithInvalidGrade.length} teachers with invalid grade references`
      );
      console.log(
        "   These need manual intervention as gradeId is required for teachers"
      );
    }

    console.log("\n📋 Step 4: Resolving index conflicts and syncing indexes...");
    const db = mongoose.connection.db;
    
    if (db) {
      // Drop ALL email-related indexes from users collection
      const indexes = await db.collection("users").indexes();
      console.log(`   Found ${indexes.length} existing indexes`);
      
      const emailIndexes = indexes.filter(idx => 
        idx.key && idx.key.email && idx.name !== "_id_"
      );
      
      console.log(`   Found ${emailIndexes.length} email-related indexes to drop`);
      
      for (const idx of emailIndexes) {
        if (idx.name) {
          try {
            console.log(`   Dropping index: ${idx.name}`);
            await db.collection("users").dropIndex(idx.name);
            console.log(`   ✅ Dropped ${idx.name}`);
          } catch (err: any) {
            console.log(`   ⚠️  Could not drop ${idx.name}: ${err.message}`);
          }
        }
      }
      
      // Also drop composite indexes that might conflict
      const compositeIndexes = indexes.filter(idx => 
        idx.name && 
        idx.name !== "_id_" && 
        (idx.name.includes("email") || idx.name.includes("role"))
      );
      
      for (const idx of compositeIndexes) {
        if (idx.name && !emailIndexes.find(e => e.name === idx.name)) {
          try {
            console.log(`   Dropping composite index: ${idx.name}`);
            await db.collection("users").dropIndex(idx.name);
            console.log(`   ✅ Dropped ${idx.name}`);
          } catch (err: any) {
            console.log(`   ⚠️  Could not drop ${idx.name}: ${err.message}`);
          }
        }
      }
    }

    // Now sync indexes
    console.log("\n   Synchronizing indexes...");
    await Promise.all([
      User.syncIndexes(),
      Grade.syncIndexes(),
      Message.syncIndexes(),
      ChatRoom.syncIndexes(),
    ]);
    console.log("   ✅ All indexes synchronized");

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📊 Summary:");
    console.log(
      `   - Orphaned chat rooms deleted: ${orphanedRooms.deletedCount || 0}`
    );
    console.log(
      `   - Messages with invalid recipients updated: ${messagesUpdated}`
    );
    console.log(
      `   - Students with invalid grades fixed: ${studentsWithInvalidGrade.length}`
    );
    console.log(
      `   - Teachers with invalid grades: ${teachersWithInvalidGrade.length} (manual review needed)`
    );

    if (teachersWithInvalidGrade.length > 0) {
      console.log("\n⚠️  ACTION REQUIRED:");
      console.log("   Some teachers have invalid grade references.");
      console.log(
        "   Please review and assign valid grades to these teachers:"
      );
      teachersWithInvalidGrade.forEach((t) => {
        console.log(
          `   - Teacher ID: ${t._id}, Name: ${t.name}, Invalid Grade: ${t.gradeId}`
        );
      });
    }

    console.log("\n🎉 Cascading delete hooks are now active!");
    console.log(
      "   All future deletions will automatically clean up related data."
    );
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Database connection closed");
  }
}

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Migration error:", error);
      process.exit(1);
    });
}

export { runMigration };