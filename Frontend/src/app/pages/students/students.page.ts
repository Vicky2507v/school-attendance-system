import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, map, switchMap } from 'rxjs';
import { applyServerErrors, classLabel, positiveInt, requiredTrimmed } from '../../core/utils';
import { ApiError, CLASS_SECTIONS, SchoolClass, Student, StudentPayload } from '../../models/school.models';
import { SchoolClassService } from '../../services/school-class.service';
import { StudentService } from '../../services/student.service';
import { ConfirmService } from '../../shared/confirm.service';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { FieldErrorComponent } from '../../shared/field-error.component';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-students-page',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, IconComponent, ModalComponent, FieldErrorComponent, EmptyStateComponent],
  templateUrl: './students.page.html',
})
export class StudentsPage implements OnInit {
  private readonly api = inject(StudentService);
  private readonly classApi = inject(SchoolClassService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly fb = inject(FormBuilder);

  readonly sections = CLASS_SECTIONS;
  readonly classLabel = classLabel;

  readonly students = signal<Student[]>([]);
  readonly classes = signal<SchoolClass[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly search = signal('');
  readonly sectionFilter = signal('');
  readonly classFilter = signal<number | null>(null);
  readonly rollQuery = signal<number | null>(null);
  readonly lookingUp = signal(false);

  readonly formOpen = signal(false);
  readonly editing = signal<Student | null>(null);
  readonly saving = signal(false);
  readonly detail = signal<Student | null>(null);

  readonly form = this.fb.group({
    name: ['', [requiredTrimmed]],
    rollNo: [null as number | null, [Validators.required, positiveInt]],
    email: ['', [requiredTrimmed, Validators.email]],
    classId: [null as number | null, [Validators.required]],
  });

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const section = this.sectionFilter();
    const classId = this.classFilter();
    return this.students()
      .filter(
        (s) =>
          (!q || s.name.toLowerCase().includes(q) || String(s.rollNo).includes(q) || (s.email ?? '').toLowerCase().includes(q)) &&
          (!section || s.schoolClass?.classSection === section) &&
          (classId === null || s.schoolClass?.id === classId),
      )
      .sort((a, b) => a.rollNo - b.rollNo);
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .getAll()
      .pipe(
        switchMap((students) => this.classApi.list(students).pipe(map((classes) => ({ students, classes })))),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: ({ students, classes }) => {
          this.students.set(students);
          this.classes.set(classes);
        },
        error: (e: ApiError) => this.error.set(e.message),
      });
  }

  clearFilters(): void {
    this.search.set('');
    this.sectionFilter.set('');
    this.classFilter.set(null);
  }

  /* ---------- add / edit ---------- */
  openAdd(): void {
    this.editing.set(null);
    this.form.reset({ name: '', rollNo: null, email: '', classId: null });
    this.form.enable();
    this.formOpen.set(true);
  }

  openEdit(student: Student): void {
    this.editing.set(student);
    this.form.enable();
    this.form.reset({ name: student.name, rollNo: student.rollNo, email: student.email, classId: student.schoolClass?.id ?? null });
    // The backend update endpoint only persists the email, so the other fields are read-only here.
    this.form.controls.name.disable();
    this.form.controls.rollNo.disable();
    this.form.controls.classId.disable();
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  submit(): void {
    if (this.saving()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const payload: StudentPayload = {
      name: (v.name ?? '').trim(),
      rollNo: Number(v.rollNo),
      email: (v.email ?? '').trim(),
      schoolClass: { id: Number(v.classId) },
    };
    const editing = this.editing();

    this.saving.set(true);
    (editing ? this.api.update(editing.id, payload) : this.api.add(payload))
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (ok) => {
          if (!ok) {
            this.toast.error('The server did not save the student. Check the selected class and try again.');
            return;
          }
          this.toast.success(editing ? 'Student email updated.' : 'Student added.');
          this.closeForm();
          this.load();
        },
        error: (e: ApiError) => {
          if (applyServerErrors(this.form, e.fieldErrors)) return;
          const hint = e.status === 500 && !editing ? ' A student with the same roll number or email may already exist.' : '';
          this.toast.error(e.message + hint);
        },
      });
  }

  /* ---------- details / lookup ---------- */
  view(student: Student): void {
    this.api.getById(student.id).subscribe({
      next: (fresh) => (fresh ? this.detail.set(fresh) : this.toast.error('Student not found. The list may be out of date.')),
      error: (e: ApiError) => this.toast.error(e.message),
    });
  }

  lookupRoll(): void {
    const roll = this.rollQuery();
    if (roll === null || !Number.isInteger(roll) || roll < 1) {
      this.toast.error('Enter a positive whole roll number.');
      return;
    }
    this.lookingUp.set(true);
    this.api
      .findByRollNo(roll)
      .pipe(finalize(() => this.lookingUp.set(false)))
      .subscribe({
        next: (s) => this.detail.set(s),
        error: (e: ApiError) => this.toast.error(e.status === 404 ? `No student with roll number ${roll}.` : e.message),
      });
  }

  /* ---------- delete ---------- */
  async remove(student: Student): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Delete student',
      message: `Delete ${student.name} (roll no. ${student.rollNo})? This cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    this.api.delete(student.id).subscribe({
      next: () => {
        this.students.update((list) => list.filter((s) => s.id !== student.id));
        this.toast.success('Student deleted.');
      },
      error: (e: ApiError) =>
        this.toast.error(
          e.status === 500
            ? 'The student could not be deleted. They probably have attendance records that block deletion.'
            : e.message,
        ),
    });
  }
}
