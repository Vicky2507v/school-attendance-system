import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { apiUrl, seg } from '../core/api.config';
import { environment } from '../../environments/environment';
import { NewSchoolClass, SchoolClass, Student } from '../models/school.models';
import { StudentService } from './student.service';

const STORAGE_KEY = 'sas.knownClassNames';

/**
 * The backend exposes only:
 *   POST /createClass (returns boolean, not the new id)
 *   GET  /displayDataByClass/{className} (exact name, 404 when none)
 * There is no "list all classes" endpoint, so `list()` rebuilds the list from
 *   (a) the classes referenced by students, and
 *   (b) class names this browser has created/looked up before (resolved via displayDataByClass).
 * If you add GET /getAllClasses to the backend, set environment.classListEndpoint and this workaround is bypassed.
 */
@Injectable({ providedIn: 'root' })
export class SchoolClassService {
  private readonly http = inject(HttpClient);
  private readonly students = inject(StudentService);

  create(newClass: NewSchoolClass): Observable<boolean> {
    return this.http.post<boolean>(apiUrl('/createClass'), newClass).pipe(
      tap((ok) => ok && this.remember(newClass.className)),
    );
  }

  /** GET /displayDataByClass/{className}; remembers the name when something is found. */
  findByName(className: string): Observable<SchoolClass[]> {
    return this.http
      .get<SchoolClass[]>(apiUrl(`/displayDataByClass/${seg(className)}`))
      .pipe(tap((list) => list.length > 0 && this.remember(className)));
  }

  list(knownStudents?: Student[]): Observable<SchoolClass[]> {
    if (environment.classListEndpoint) {
      return this.http.get<SchoolClass[]>(apiUrl(environment.classListEndpoint));
    }
    const students$ = knownStudents ? of(knownStudents) : this.students.getAll();
    return students$.pipe(
      switchMap((students) => {
        const byId = new Map<number, SchoolClass>();
        for (const s of students) {
          if (s.schoolClass?.id != null) byId.set(s.schoolClass.id, s.schoolClass);
        }
        const names = new Set<string>([...this.knownNames(), ...[...byId.values()].map((c) => c.className)]);
        if (names.size === 0) return of(this.sorted(byId.values()));
        const lookups = [...names].map((n) =>
          this.http.get<SchoolClass[]>(apiUrl(`/displayDataByClass/${seg(n)}`)).pipe(catchError(() => of([] as SchoolClass[]))),
        );
        return forkJoin(lookups).pipe(
          map((groups) => {
            groups.flat().forEach((c) => byId.set(c.id, c));
            return this.sorted(byId.values());
          }),
        );
      }),
    );
  }

  private sorted(classes: Iterable<SchoolClass>): SchoolClass[] {
    return [...classes].sort(
      (a, b) =>
        a.className.localeCompare(b.className, undefined, { numeric: true }) ||
        a.classSection.localeCompare(b.classSection),
    );
  }

  private knownNames(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }

  private remember(className: string): void {
    const name = className.trim();
    if (!name) return;
    try {
      const names = new Set(this.knownNames());
      names.add(name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...names]));
    } catch {
      /* storage unavailable – the list simply won't persist */
    }
  }
}
