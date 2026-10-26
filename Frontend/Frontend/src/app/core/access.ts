import { Role } from '../models/auth.models';

/**
 * Which roles may OPEN each page in the UI. This only shapes navigation and routes; the Spring Boot backend
 * remains the real authority and will answer 403 for anything the role may not do. Adjust to match your
 * SecurityConfig rules.
 */
export const ACCESS: Record<'dashboard' | 'students' | 'teachers' | 'classes' | 'attendance' | 'reports', Role[]> = {
  dashboard: ['ADMIN', 'TEACHER'],
  students: ['ADMIN', 'TEACHER'], // TEACHER: read-only in the UI
  teachers: ['ADMIN'],
  classes: ['ADMIN'],
  attendance: ['ADMIN', 'TEACHER'],
  reports: ['ADMIN', 'TEACHER'],
};
