import { Response } from 'express';

export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  message: string = 'Error',
  details?: string,
  errors?: any[]
) => {
  return {
    success: false,
    message,
    ...(details && { details }),
    ...(errors && { errors }),
  };
};