import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl, seg } from '../core/api.config';
import { Student, StudentPayload } from '../models/school.models';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);

  /** GET /getAllStudents */
  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(apiUrl('/getAllStudents'));
  }

  /** GET /getStudent/{id}  (backend returns Optional<Student>: empty body when missing) */
  getById(id: number): Observable<Student | null> {
    return this.http.get<Student | null>(apiUrl(`/getStudent/${seg(id)}`));
  }

  /** GET /displayByRollNo/{rollNo}  (404 when not found) */
  findByRollNo(rollNo: number): Observable<Student> {
    return this.http.get<Student>(apiUrl(`/displayByRollNo/${seg(rollNo)}`));
  }

  /** POST /addStudent  → boolean */
  add(student: StudentPayload): Observable<boolean> {
    return this.http.post<boolean>(apiUrl('/addStudent'), student);
  }

  /**
   * PUT /updateStudents/{id}  → boolean.
   * The body is validated as a full Student, but the backend only persists the EMAIL.
   */
  update(id: number, student: StudentPayload): Observable<boolean> {
    return this.http.put<boolean>(apiUrl(`/updateStudents/${seg(id)}`), student);
  }

  /** DELETE /delete/{id}  → empty body (404 when missing) */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`/delete/${seg(id)}`));
  }
}
