import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl, seg } from '../core/api.config';
import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummary,
  ClassMonthlyAttendance,
  DateRangeAttendance,
  MarkAttendanceRequest,
  MonthlyAttendance,
  StudentAttendanceHistory,
} from '../models/school.models';

/** All dates are ISO yyyy-MM-dd strings, as expected by the backend's LocalDate parameters. */
@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);

  /** POST /attendance/mark → true. All-or-nothing; fails if ANY listed student already has a record that day. */
  mark(request: MarkAttendanceRequest): Observable<boolean> {
    return this.http.post<boolean>(apiUrl('/attendance/mark'), request);
  }

  /** GET /attendance/class/{classId}/date/{date} → [] when nothing is marked */
  byClassAndDate(classId: number, date: string): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(apiUrl(`/attendance/class/${seg(classId)}/date/${seg(date)}`));
  }

  /** PUT /attendance/{id}  body: { attendanceStatus } */
  update(id: number, status: AttendanceStatus): Observable<AttendanceRecord> {
    return this.http.put<AttendanceRecord>(apiUrl(`/attendance/${seg(id)}`), { attendanceStatus: status });
  }

  /** DELETE /attendance/{id} → true, or false when the record does not exist */
  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(apiUrl(`/attendance/${seg(id)}`));
  }

  /** GET /attendance/summary/{classId}?date= */
  summary(classId: number, date: string): Observable<AttendanceSummary> {
    return this.http.get<AttendanceSummary>(apiUrl(`/attendance/summary/${seg(classId)}`), { params: { date } });
  }

  /** GET /attendance/history/{studentId} */
  history(studentId: number): Observable<StudentAttendanceHistory> {
    return this.http.get<StudentAttendanceHistory>(apiUrl(`/attendance/history/${seg(studentId)}`));
  }

  /** GET /attendance/monthly/{studentId}?month=&year= */
  monthly(studentId: number, month: number, year: number): Observable<MonthlyAttendance> {
    return this.http.get<MonthlyAttendance>(apiUrl(`/attendance/monthly/${seg(studentId)}`), { params: { month, year } });
  }

  /** GET /attendance/class/monthly/{classId}?month=&year= */
  classMonthly(classId: number, month: number, year: number): Observable<ClassMonthlyAttendance> {
    return this.http.get<ClassMonthlyAttendance>(apiUrl(`/attendance/class/monthly/${seg(classId)}`), { params: { month, year } });
  }

  /** GET /attendance/student/{studentId}/range?startDate=&endDate= */
  range(studentId: number, startDate: string, endDate: string): Observable<DateRangeAttendance> {
    return this.http.get<DateRangeAttendance>(apiUrl(`/attendance/student/${seg(studentId)}/range`), {
      params: { startDate, endDate },
    });
  }
}
