/* TypeScript shapes taken from the Spring Boot entities / DTOs (see docs/BACKEND_API_NOTES.md). */

export type ClassSection = 'A' | 'B' | 'C';
export const CLASS_SECTIONS: ClassSection[] = ['A', 'B', 'C'];
export type AttendanceStatus = 'PRESENT' | 'ABSENT';

export interface SchoolClass {
  id: number;
  className: string; // e.g. "8th", "10th"
  classSection: ClassSection;
}
export interface NewSchoolClass {
  className: string;
  classSection: ClassSection;
}

export interface Student {
  id: number;
  name: string;
  rollNo: number;
  email: string;
  schoolClass: SchoolClass;
}
/** Body for POST /addStudent and PUT /updateStudents/{id}. */
export interface StudentPayload {
  name: string;
  rollNo: number;
  email: string;
  schoolClass: { id: number };
}

/** Backend entity is named "Teachers"; JSON fields below. */
export interface Teacher {
  id: number;
  name: string;
  email: string;
  subject: string;
  phoneNo: string;
}
export type TeacherPayload = Omit<Teacher, 'id'>;

/** GET /attendance/class/{classId}/date/{date} returns the raw entity with nested objects. */
export interface AttendanceRecord {
  id: number;
  date: string; // yyyy-MM-dd
  status: AttendanceStatus;
  student: Student;
  teacher: Teacher;
  schoolClass: SchoolClass;
}

export interface MarkAttendanceRequest {
  classId: number;
  teacherId: number;
  date: string;
  attendance: { studentId: number; status: AttendanceStatus }[];
}

export interface AttendanceSummary {
  className: string;
  section: string;
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  attendancePercentage: number;
}

export interface AttendanceHistoryItem {
  date: string;
  status: AttendanceStatus;
}
export interface StudentAttendanceHistory {
  studentId: number;
  studentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
  attendanceHistoryItem: AttendanceHistoryItem[]; // (sic) singular name in backend DTO
}

export interface MonthlyAttendance {
  studentId: number;
  studentName: string;
  month: number;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
}
export interface ClassMonthlyAttendance {
  classId: number;
  className: string;
  section: string;
  month: number;
  year: number;
  students: MonthlyAttendance[];
}
export interface DateRangeAttendance {
  studentId: number;
  studentName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
}

/** Normalised error produced by the HTTP interceptor. */
export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}
