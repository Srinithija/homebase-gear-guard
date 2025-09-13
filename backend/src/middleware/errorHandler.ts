import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/responses';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json(errorResponse('Validation error', err.message));
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(errorResponse('Unauthorized', err.message));
  }

  // Default error response
  res.status(500).json(
    errorResponse(
      'Internal server error',
      process.env.NODE_ENV === 'development' ? err.message : undefined
    )
  );
};