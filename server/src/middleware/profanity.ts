import Filter from "bad-words-next";
import { Request, Response, NextFunction } from "express";

const filter = new Filter();

export const profanityFilter = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.content) {
    const isProfane = filter.check(req.body.content);
    if (isProfane) {
      req.body.flagged = true; 
    }
  }
  next();
};

export { filter };
