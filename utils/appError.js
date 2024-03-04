class AppError extends Error {
  constructor(message, statusCode, options) {
    super(message);

    // this.message = message;
    this._message = message;
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith('4') ? 'failed' : 'error';
    this.code = options?.code || null;
    this.textCode = options?.textCode || null;
    this.url = options?.url || null;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
