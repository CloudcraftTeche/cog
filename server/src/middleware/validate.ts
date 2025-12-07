import { ApiError } from "../utils/ApiError";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    const message = errorMessages[0]; 
    
    throw new ApiError(400, message);
  }
  
  next();
};