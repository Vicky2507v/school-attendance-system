import { environment } from '../../environments/environment';

/** Backend base URL, configured once in src/environments/environment.ts. */
export const API_BASE_URL: string = environment.apiBaseUrl;

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

/** Encode a free-text value for use as a URL path segment. */
export function seg(value: string | number): string {
  return encodeURIComponent(String(value));
}
