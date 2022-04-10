export class ApiError extends Error {
  statusCode: number;
  constructor(message = 'Error: Internal server error', statusCode = 500) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
