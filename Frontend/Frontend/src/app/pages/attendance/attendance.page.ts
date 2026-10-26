import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, catchError, finalize, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { classLabel, todayIso } from '../../core/utils';
import { ApiError, AttendanceStatus, SchoolClass, Student, Teacher } from '../../models/school.models';
import { AttendanceService } from '../../services/attendance.service';
import { SchoolClassService } from '../../services/school-class.service';
import { StudentService } from '../../services/student.service';
import { TeacherService } from '../../services/teacher.service';
import { ConfirmService } from '../../shared/confirm.service';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { IconComponent } from '../../shared/icon.component';
import { ToastService } from '../../shared/toast.service';

interface Row {
  student: Student;
  recordId: number | null; // existing attendance record for the chosen date, if any
  savedStatus: AttendanceStatus | null;
  status: AttendanceStatus | null; // current selection in the UI
}

@Component({
  selector: 'app-attendance-page',
  imports: [FormsModule, IconComponent, EmptyStateComponent],
  templateUrl: './attendance.page.html',
})
export class AttendancePage implements OnInit {
  private readonly attendanceApi = inject(AttendanceService);
  private readonly studentApi = inject(StudentService);
  private readonly classApi = inject(SchoolClassService);
  private readonly teacherApi = inject(TeacherService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly classLabel = classLabel;
  readonly today = todayIso();

  readonly classes = signal<SchoolClass[]>([]);
  readonly teachers = signal<Teacher[]>([]);
  readonly setupLoading = signal(true);
  readonly setupError = signal<string | null>(null);

  readonly classId = signal<number | null>(null);
  readonly teacherId = signal<number | null>(null);
  readonly date = signal(todayIso());

  readonly rows = signal<Row[]>([]);
  readonly loaded = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);

  private readonly load$ = new Subject<{ classId: number; date: string }>();

  readonly pendingNew = computed(() => this.rows().filter((r) => r.recordId === null && r.status !== null));
  readonly pendingUpdates = computed(() => this.rows().filter((r) => r.recordId !== null && r.status !== null && r.status !== r.savedStatus));
  readonly unselected = computed(() => this.rows().filter((r) => r.status === null).length);
  readonly savedCount = computed(() => this.rows().filter((r) => r.recordId !== null).length);
  readonly presentCount = computed(() => this.rows().filter((r) => r.status === 'PRESENT').length);
  readonly absentCount = computed(() => this.rows().filter((r) => r.status === 'ABSENT').length);
  readonly changeCount = computed(() => this.pendingNew().length + this.pendingUpdates().length);

  constructor() {
    // switchMap: a newer class/date selection cancels any in-flight load (no stale overwrites).
    this.load$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.loaded.set(false);
        }),
        switchMap(({ classId, date }) =>
          forkJoin({ students: this.studentApi.getAll(), records: this.attendanceApi.byClassAndDate(classId, date) }).pipe(
            map((data) => ({ ...data, classId })),
            catchError((e: ApiError) => {
              this.toast.error(e.message);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        this.loading.set(false);
        if (!result) return;
        const byStudent = new Map(result.records.map((r) => [r.student.id, r]));
        const rows: Row[] = result.students
          .filter((s) => s.schoolClass?.id === result.classId)
          .sort((a, b) => a.rollNo - b.rollNo)
          .map((s) => {
            const rec = byStudent.get(s.id);
            return { student: s, recordId: rec?.id ?? null, savedStatus: rec?.status ?? null, status: rec?.status ?? null };
          });
        this.rows.set(rows);
        this.loaded.set(true);
      });
  }

  ngOnInit(): void {
    forkJoin({ teachers: this.teacherApi.getAll(), classes: this.classApi.list() })
      .pipe(finalize(() => this.setupLoading.set(false)))
      .subscribe({
        next: ({ teachers, classes }) => {
          this.teachers.set(teachers);
          this.classes.set(classes);
        },
        error: (e: ApiError) => this.setupError.set(e.message),
      });
  }

  onClass(id: number | null): void {
    this.classId.set(id);
    this.reload();
  }

  onDate(value: string): void {
    this.date.set(value);
    this.reload();
  }

  reload(): void {
    const classId = this.classId();
    const date = this.date();
    if (classId === null || !date) {
      this.loaded.set(false);
      this.rows.set([]);
      return;
    }
    this.load$.next({ classId, date });
  }

  setStatus(index: number, status: AttendanceStatus): void {
    this.rows.update((rows) => rows.map((r, i) => (i === index ? { ...r, status } : r)));
  }

  markAll(status: AttendanceStatus): void {
    this.rows.update((rows) => rows.map((r) => ({ ...r, status })));
  }

  save(): void {
    if (this.saving()) return; // guards against double-clicks / duplicate submissions
    const classId = this.classId();
    const date = this.date();
    const newRows = this.pendingNew();
    const updates = this.pendingUpdates();

    if (classId === null || !date) {
      this.toast.error('Select a class and a date first.');
      return;
    }
    if (newRows.length === 0 && updates.length === 0) {
      this.toast.info('Nothing to save: select a status for at least one student.');
      return;
    }
    const teacherId = this.teacherId();
    if (newRows.length > 0 && teacherId === null) {
      this.toast.error('Select the teacher taking attendance.');
      return;
    }

    let marked = false;
    this.saving.set(true);
    const mark$ =
      newRows.length > 0
        ? this.attendanceApi.mark({
            classId,
            teacherId: teacherId as number,
            date,
            attendance: newRows.map((r) => ({ studentId: r.student.id, status: r.status as AttendanceStatus })),
          })
        : of(true);

    mark$
      .pipe(
        tap(() => (marked = true)),
        switchMap(() =>
          updates.length > 0
            ? forkJoin(updates.map((r) => this.attendanceApi.update(r.recordId as number, r.status as AttendanceStatus)))
            : of([]),
        ),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => {
          this.toast.success('Attendance saved.');
          this.reload();
        },
        error: (e: ApiError) => {
          this.toast.error(e.message);
          if (marked) this.reload(); // new records were stored but an update failed: show the real state
        },
      });
  }

  async deleteRecord(index: number): Promise<void> {
    const row = this.rows()[index];
    if (!row || row.recordId === null) return;
    const ok = await this.confirm.ask({
      title: 'Delete attendance record',
      message: `Remove the saved attendance for ${row.student.name} on ${this.date()}?`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    this.attendanceApi.delete(row.recordId).subscribe({
      next: (deleted) => {
        if (deleted) this.toast.success('Attendance record deleted.');
        else this.toast.info('That record no longer exists.');
        this.rows.update((rows) => rows.map((r, i) => (i === index ? { ...r, recordId: null, savedStatus: null, status: null } : r)));
      },
      error: (e: ApiError) => this.toast.error(e.message),
    });
  }
}
