export interface ValidationDetail {
  field: string;
  message: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ValidationDetail[];

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: ValidationDetail[],
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, ApiError);
  }

  static validation(details: ValidationDetail[]): ApiError {
    return new ApiError(422, "VALIDATION_ERROR", "Invalid request body", details);
  }

  static conflict(code: string, message: string): ApiError {
    return new ApiError(409, code, message);
  }

  static notFound(code: string, message: string): ApiError {
    return new ApiError(404, code, message);
  }

  static unauthorized(message = "Authentication token is missing or invalid"): ApiError {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(
    message = "Your role does not have permission to perform this action",
  ): ApiError {
    return new ApiError(403, "FORBIDDEN", message);
  }
}
