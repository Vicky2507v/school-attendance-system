import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/school.models';

/**
 * Backend error shapes (GlobalExceptionHandler):
 *  - 404 / 400 / 500 : { status: number, message: string }
 *  - 400 validation  : { "<fieldName>": "<message>", ... }   (plain map, no status/message keys)
 */
export function toApiError(err: unknown): ApiError {
  if (!(err instanceof HttpErrorResponse)) {
    return { status: -1, message: 'Unexpected error. Please try again.' };
  }
  if (err.status === 0) {
    return {
      status: 0,
      message: 'Cannot reach the server. Make sure the Spring Boot backend is running (port 8282).',
    };
  }
  const body = err.error;
  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.length > 0) {
      return { status: err.status, message: body.message };
    }
    const entries = Object.entries(body).filter(([, v]) => typeof v === 'string') as [string, string][];
    if (err.status === 400 && entries.length > 0) {
      return {
        status: 400,
        message: entries.map(([, m]) => m).join(' '),
        fieldErrors: Object.fromEntries(entries),
      };
    }
  }
  const fallback: Record<number, string> = {
    400: 'The request was not valid.',
    404: 'The requested record was not found.',
    500: 'Something went wrong on the server. Please try again later.',
  };
  return { status: err.status, message: fallback[err.status] ?? `Request failed (${err.status}).` };
}

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(catchError((err) => throwError(() => toApiError(err))));
