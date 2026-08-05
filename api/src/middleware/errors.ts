import type { NextFunction, Request, Response } from "express";

import { config } from "../config/env.js";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: "not_found", message: "No such endpoint." } });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields && { fields: error.fields }),
      },
    });
    return;
  }

  console.error("[api] unhandled error:", error);
  res.status(500).json({
    error: {
      code: "server_error",
      message: "Something went wrong.",
      ...(config.isProd ? {} : { detail: error instanceof Error ? error.message : String(error) }),
    },
  });
}
