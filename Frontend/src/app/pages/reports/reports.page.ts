import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, finalize, map, switchMap } from 'rxjs';
import { MONTHS, applyServerErrors, classLabel, dateOrder, firstOfMonthIso, sum, todayIso } from '../../core/utils';
import {
  ApiError,
  ClassMonthlyAttendance,
  DateRangeAttendance,
  MonthlyAttendance,
  SchoolClass,
  Student,
  StudentAttendanceHistory,
} from '../../models/school.models';
import { AttendanceService } from '../../services/attendance.service';
import { SchoolClassService } from '../../services/school-class.service';
import { StudentService } from '../../services/student.service';
import { AttendanceStatsComponent } from '../../shared/attendance-stats.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { FieldErrorComponent } from '../../shared/field-error.component';
import { ToastService } from '../../shared/toast.service';

type Tab = 'history' | 'monthly' | 'class' | 'range';

@Component({
  selector: 'app-reports-page',
  imports: [ReactiveFormsModule, DecimalPipe, FieldErrorComponent, EmptyStateComponent, AttendanceStatsComponent],
  templateUrl: './reports.page.html',
})
export class ReportsPage implements OnInit {
  private readonly attendanceApi = inject(AttendanceService);
  private readonly studentApi = inject(StudentService);
  private readonly classApi = inject(SchoolClassService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly months = MONTHS;
  readonly classLabel = classLabel;

  readonly tab = signal<Tab>('history');
  readonly students = signal<Student[]>([]);
  readonly classes = signal<SchoolClass[]>([]);
  readonly setupLoading = signal(true);
  readonly setupError = signal<string | null>(null);
  readonly running = signal(false);

  readonly history = signal<StudentAttendanceHistory | null>(null);
  readonly monthly = signal<MonthlyAttendance | null>(null);
  readonly classMonthly = signal<ClassMonthlyAttendance | null>(null);
  readonly range = signal<DateRangeAttendance | null>(null);

  private readonly now = new Date();

  readonly historyForm = this.fb.group({ studentId: [null as number | null, [Validators.required]] });
  readonly monthlyForm = this.fb.group({
    studentId: [null as number | null, [Validators.required]],
    month: [this.now.getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    year: [this.now.getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
  });
  readonly classForm = this.fb.group({
    classId: [null as number | null, [Validators.required]],
    month: [this.now.getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    year: [this.now.getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
  });
  readonly rangeForm = this.fb.group(
    {
      studentId: [null as number | null, [Validators.required]],
      startDate: [firstOfMonthIso(), [Validators.required]],
      endDate: [todayIso(), [Validators.required]],
    },
    { validators: [dateOrder] },
  );

  /** History rows, newest first. */
  readonly historyRows = computed(() =>
    [...(this.history()?.attendanceHistoryItem ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
  );
  readonly classRows = computed(() =>
    [...(this.classMonthly()?.students ?? [])].sort((a, b) => a.studentName.localeCompare(b.studentName)),
  );
  readonly classTotals = computed(() => {
    const rows = this.classRows();
    const present = sum(rows.map((r) => r.presentDays));
    const total = sum(rows.map((r) => r.totalDays));
    return { present, absent: sum(rows.map((r) => r.absentDays)), total, pct: total > 0 ? (present / total) * 100 : 0 };
  });

  ngOnInit(): void {
    this.studentApi
      .getAll()
      .pipe(
        switchMap((students) => this.classApi.list(students).pipe(map((classes) => ({ students, classes })))),
        finalize(() => this.setupLoading.set(false)),
      )
      .subscribe({
        next: ({ students, classes }) => {
          this.students.set(students);
          this.classes.set(classes);
          const id = Number(this.route.snapshot.queryParamMap.get('studentId'));
          if (Number.isInteger(id) && id > 0 && students.some((s) => s.id === id)) {
            this.historyForm.patchValue({ studentId: id });
            this.monthlyForm.patchValue({ studentId: id });
            this.rangeForm.patchValue({ studentId: id });
            this.runHistory();
          }
        },
        error: (e: ApiError) => this.setupError.set(e.message),
      });
  }

  studentLabel(s: Student): string {
    return `${s.rollNo} · ${s.name}${s.schoolClass ? ' (' + classLabel(s.schoolClass) + ')' : ''}`;
  }

  rowTone(pct: number): string {
    return pct >= 90 ? 'good' : pct >= 75 ? 'warn' : 'bad';
  }

  setTab(tab: Tab): void {
    this.tab.set(tab);
  }

  private run<T>(form: { markAllAsTouched(): void; invalid: boolean; value: unknown }, request: () => Observable<T>, onResult: (r: T) => void, formGroup: Parameters<typeof applyServerErrors>[0]): void {
    if (this.running()) return;
    form.markAllAsTouched();
    if (form.invalid) return;
    this.running.set(true);
    request()
      .pipe(finalize(() => this.running.set(false)))
      .subscribe({
        next: onResult,
        error: (e: ApiError) => {
          if (!applyServerErrors(formGroup, e.fieldErrors)) this.toast.error(e.message);
        },
      });
  }

  runHistory(): void {
    this.run(this.historyForm, () => this.attendanceApi.history(Number(this.historyForm.value.studentId)), (r) => this.history.set(r), this.historyForm);
  }

  runMonthly(): void {
    const v = this.monthlyForm.value;
    this.run(this.monthlyForm, () => this.attendanceApi.monthly(Number(v.studentId), Number(v.month), Number(v.year)), (r) => this.monthly.set(r), this.monthlyForm);
  }

  runClass(): void {
    const v = this.classForm.value;
    this.run(this.classForm, () => this.attendanceApi.classMonthly(Number(v.classId), Number(v.month), Number(v.year)), (r) => this.classMonthly.set(r), this.classForm);
  }

  runRange(): void {
    const v = this.rangeForm.value;
    this.run(this.rangeForm, () => this.attendanceApi.range(Number(v.studentId), String(v.startDate), String(v.endDate)), (r) => this.range.set(r), this.rangeForm);
  }
}
