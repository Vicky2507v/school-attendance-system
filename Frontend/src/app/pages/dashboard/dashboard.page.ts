import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, catchError, finalize, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { percent, sum, todayIso } from '../../core/utils';
import { ApiError, AttendanceSummary, SchoolClass, Student, Teacher } from '../../models/school.models';
import { AttendanceService } from '../../services/attendance.service';
import { SchoolClassService } from '../../services/school-class.service';
import { StudentService } from '../../services/student.service';
import { TeacherService } from '../../services/teacher.service';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [DecimalPipe, RouterLink, IconComponent, EmptyStateComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  private readonly studentApi = inject(StudentService);
  private readonly teacherApi = inject(TeacherService);
  private readonly classApi = inject(SchoolClassService);
  private readonly attendanceApi = inject(AttendanceService);

  readonly classNote = !environment.classListEndpoint;
  readonly today = todayIso();

  readonly students = signal<Student[]>([]);
  readonly teachers = signal<Teacher[]>([]);
  readonly classes = signal<SchoolClass[]>([]);
  readonly summaries = signal<AttendanceSummary[]>([]);
  readonly date = signal(todayIso());

  readonly loading = signal(true);
  readonly summaryLoading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly reloadSummaries$ = new Subject<void>();

  readonly totalPresent = computed(() => sum(this.summaries().map((s) => s.present)));
  readonly totalAbsent = computed(() => sum(this.summaries().map((s) => s.absent)));
  readonly markedClasses = computed(() => this.summaries().filter((s) => s.present + s.absent > 0));
  /** Present ÷ enrolled students, counted only for classes that have attendance marked on the chosen date. */
  readonly overallPercentage = computed(() =>
    percent(this.totalPresent(), sum(this.markedClasses().map((s) => s.totalStudents))),
  );

  constructor() {
    this.reloadSummaries$
      .pipe(
        tap(() => this.summaryLoading.set(true)),
        // switchMap: changing the date quickly cancels the previous batch of requests.
        switchMap(() => {
          const classes = this.classes();
          if (classes.length === 0) return of([] as AttendanceSummary[]);
          return forkJoin(
            classes.map((c) => this.attendanceApi.summary(c.id, this.date()).pipe(catchError(() => of(null)))),
          ).pipe(map((all) => all.filter((x): x is AttendanceSummary => x !== null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((summaries) => {
        this.summaries.set(summaries);
        this.summaryLoading.set(false);
      });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ students: this.studentApi.getAll(), teachers: this.teacherApi.getAll() })
      .pipe(
        switchMap(({ students, teachers }) =>
          this.classApi.list(students).pipe(map((classes) => ({ students, teachers, classes }))),
        ),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: ({ students, teachers, classes }) => {
          this.students.set(students);
          this.teachers.set(teachers);
          this.classes.set(classes);
          this.reloadSummaries$.next();
        },
        error: (e: ApiError) => this.error.set(e.message),
      });
  }

  onDate(value: string): void {
    if (!value) return;
    this.date.set(value);
    this.reloadSummaries$.next();
  }

  rowPercent(s: AttendanceSummary): number | null {
    return percent(s.present, s.totalStudents);
  }
  notMarked(s: AttendanceSummary): number {
    return Math.max(0, s.totalStudents - s.present - s.absent);
  }
}
