import type { ConnectOptions } from "mongoose";
import mongoose from "mongoose";
import config from "../config/config";
const connectOptions: ConnectOptions = {
  dbName: "scriptureschool",
  appName: "scriptureschool",
  serverApi: {
    strict: true,
    deprecationErrors: true,
    version: "1",
  },
};
const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.DB_URL, connectOptions);
    console.log("Connected to MongoDB successfully.");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error connecting to MongoDB: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while connecting to MongoDB.");
    }
  }
};
const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB successfully.");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error disconnecting from MongoDB: ${error.message}`);
    }
  }
};
export { connectToDatabase, disconnectFromDatabase };
