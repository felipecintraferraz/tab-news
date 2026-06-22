class BaseError extends Error {
  constructor(message, { cause, action, statusCode, name }) {
    super(message, {
      cause,
    });
    this.statusCode = statusCode;
    this.action = action;
    this.name = name;
  }
  toJSON() {
    return {
      statusCode: this.statusCode,
      name: this.name,
      message: this.message,
      action: this.action,
    };
  }
}

export class ValidationError extends BaseError {
  constructor({ message, action }) {
    super(message || "Validation error.", {
      name: "ValidationError",
      statusCode: 400,
      action: action || "Check the input data.",
    });
  }
}

export class UnauthorizedError extends BaseError {
  constructor({ message, action }) {
    super(message || "Unauthorized.", {
      name: "UnauthorizedError",
      statusCode: 401,
      action: action || "Check the credentials.",
    });
  }
}

export class NotFoundError extends BaseError {
  constructor({ message, action }) {
    super(message || "Resource not found", {
      name: "ResourceNotFoundError",
      statusCode: 404,
      action: action || "Check provided parameters.",
    });
  }
}

export class MethodNotAllowedError extends BaseError {
  constructor() {
    super("Method not allowed.", {
      name: "MethodNotAllowedError",
      statusCode: 405,
      action: "Use an allowed method.",
    });
  }
}

export class InternalServerError extends BaseError {
  constructor({ cause, statusCode }) {
    super("Unexpected error.", {
      cause,
      name: "InternalServerError",
      statusCode: statusCode || 500,
      action: "Contact support.",
    });
  }
}

export class ServiceError extends BaseError {
  constructor({ cause, message }) {
    super(message || "Unavailable service.", {
      cause,
      name: "ServiceError",
      statusCode: 503,
      action: "Contact support.",
    });
  }
}
