import * as express from 'express';
import { Schema, Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      userId?: Types.ObjectId | string;
      userRole?: string;
      user?:any
    }
  }
}
