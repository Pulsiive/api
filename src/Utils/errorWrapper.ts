import { ApiError } from '../Errors/ApiError';
import express from 'express';

export function errorWrapper(e: any, res: express.Response) {
  let message = 'Error: Internal server error';
  let statusCode = 500;

  if (e instanceof ApiError) {
    message = e.message;
    statusCode = e.statusCode;
  }

  console.log(e.message);
  return res.status(statusCode).json({ message });
}
