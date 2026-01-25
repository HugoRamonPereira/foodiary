import { ErrorCode } from "../ErrorCode";

export abstract class ApplicationError extends Error {
  // Added statusCode as optional because whenever I wish to display a custom error with the status code
  // we can now use statusCode and specify the error number
  public statusCode?: number;
  public abstract code: ErrorCode;
}
