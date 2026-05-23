class BaseError extends Error {
  constructor(message, { cause, action, statusCode }) {
    super(message, {
      cause,
    });
    this.statusCode = statusCode;
    this.action = action;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}

export class InternalServerError extends BaseError {
  constructor({ cause }) {
    super("Unexpected error.", {
      cause,
      name: "InternalServerError",
      statusCode: 500,
      action: "Contact support.",
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
