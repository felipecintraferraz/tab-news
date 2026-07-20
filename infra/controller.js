import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "infra/errors.js";
import * as cookie from "cookie";
import session from "models/session.js";

function onErrorHandler(error, req, res) {
  if (error instanceof UnauthorizedError) {
    clearSessionCookie(res);
  }
  if (
    [ValidationError, NotFoundError, UnauthorizedError].some(
      (ErrorClass) => error instanceof ErrorClass,
    )
  ) {
    return res.status(error.statusCode).json(error);
  }
  const publicError = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });
  console.error(publicError.cause);
  res.status(publicError.statusCode).json(publicError);
}

function onNoMatchHandler(req, res) {
  const publicError = new MethodNotAllowedError();
  res.status(publicError.statusCode).json(publicError.toJSON());
}

async function setSessionCookie(sessionToken, res) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.SESSION_EXPIRATION_TIME_MS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  res.setHeader("Set-Cookie", setCookie);
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
}

async function clearSessionCookie(res) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  res.setHeader("Set-Cookie", setCookie);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
};

export default controller;
