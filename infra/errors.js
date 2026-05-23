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
