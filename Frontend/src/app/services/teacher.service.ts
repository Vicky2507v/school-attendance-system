import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl, seg } from '../core/api.config';
import { Teacher, TeacherPayload } from '../models/school.models';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private readonly http = inject(HttpClient);

  /** GET /getTeachers */
  getAll(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(apiUrl('/getTeachers'));
  }

  /** POST /addTeacher → boolean */
  add(teacher: TeacherPayload): Observable<boolean> {
    return this.http.post<boolean>(apiUrl('/addTeacher'), teacher);
  }

  /** PUT /updateTeacher/{id} → boolean. Backend only persists the SUBJECT. */
  update(id: number, teacher: TeacherPayload): Observable<boolean> {
    return this.http.put<boolean>(apiUrl(`/updateTeacher/${seg(id)}`), teacher);
  }

  /** DELETE /deletebyId/{id} → boolean (404 when missing) */
  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(apiUrl(`/deletebyId/${seg(id)}`));
  }
}
