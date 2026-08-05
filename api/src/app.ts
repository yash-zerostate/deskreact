import "express-async-errors"; // must precede the route imports

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { config } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { authRouter } from "./routes/auth.routes.js";
import { ticketsRouter } from "./routes/tickets.routes.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());

  /**
   * The SPA is served from a different origin (a CDN in production), so CORS is
   * an exact allow-list. `credentials` is still true even though the access
   * token travels in a header — the refresh cookie needs it.
   */
  app.use(
    cors({
      origin: [config.webOrigin],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    }),
  );

  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(morgan(config.isProd ? "combined" : "dev"));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "deskdesk-api", time: new Date().toISOString() });
  });

  app.use("/auth", authRouter);
  app.use("/tickets", ticketsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
