import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body) as any;
      next();
    } catch (err: any) {
      return res.status(400).json({ code: 'INVALID_BODY', message: 'Invalid request body', details: err?.issues || String(err) });
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (err: any) {
      return res.status(400).json({ code: 'INVALID_QUERY', message: 'Invalid query params', details: err?.issues || String(err) });
    }
  };
}
