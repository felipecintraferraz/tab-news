import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  ValidationError,
} from "infra/errors.js";

function onErrorHandler(error, req, res) {
  if (
    [ValidationError, NotFoundError].some(
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

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
