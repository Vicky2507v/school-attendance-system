import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { applyServerErrors, requiredTrimmed } from '../../core/utils';
import { ApiError, Teacher, TeacherPayload } from '../../models/school.models';
import { TeacherService } from '../../services/teacher.service';
import { ConfirmService } from '../../shared/confirm.service';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { FieldErrorComponent } from '../../shared/field-error.component';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-teachers-page',
  imports: [ReactiveFormsModule, FormsModule, IconComponent, ModalComponent, FieldErrorComponent, EmptyStateComponent],
  templateUrl: './teachers.page.html',
})
export class TeachersPage implements OnInit {
  private readonly api = inject(TeacherService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly fb = inject(FormBuilder);

  readonly teachers = signal<Teacher[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly subjectFilter = signal('');

  readonly formOpen = signal(false);
  readonly editing = signal<Teacher | null>(null);
  readonly saving = signal(false);

  readonly form = this.fb.group({
    name: ['', [requiredTrimmed]],
    email: ['', [requiredTrimmed, Validators.email]],
    subject: ['', [requiredTrimmed]],
    phoneNo: ['', [requiredTrimmed]],
  });

  readonly subjects = computed(() =>
    [...new Set(this.teachers().map((t) => t.subject).filter((s) => !!s))].sort((a, b) => a.localeCompare(b)),
  );

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const subject = this.subjectFilter();
    return this.teachers()
      .filter(
        (t) =>
          (!q || t.name.toLowerCase().includes(q) || (t.email ?? '').toLowerCase().includes(q) || (t.subject ?? '').toLowerCase().includes(q)) &&
          (!subject || t.subject === subject),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (list) => this.teachers.set(list),
        error: (e: ApiError) => this.error.set(e.message),
      });
  }

  clearFilters(): void {
    this.search.set('');
    this.subjectFilter.set('');
  }

  openAdd(): void {
    this.editing.set(null);
    this.form.enable();
    this.form.reset({ name: '', email: '', subject: '', phoneNo: '' });
    this.formOpen.set(true);
  }

  openEdit(t: Teacher): void {
    this.editing.set(t);
    this.form.enable();
    this.form.reset({ name: t.name, email: t.email, subject: t.subject, phoneNo: t.phoneNo });
    // The backend update endpoint only persists the subject.
    this.form.controls.name.disable();
    this.form.controls.email.disable();
    this.form.controls.phoneNo.disable();
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
    const payload: TeacherPayload = {
      name: (v.name ?? '').trim(),
      email: (v.email ?? '').trim(),
      subject: (v.subject ?? '').trim(),
      phoneNo: (v.phoneNo ?? '').trim(),
    };
    const editing = this.editing();

    this.saving.set(true);
    (editing ? this.api.update(editing.id, payload) : this.api.add(payload))
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (ok) => {
          if (!ok) {
            this.toast.error('The server did not save the teacher. Please try again.');
            return;
          }
          this.toast.success(editing ? 'Teacher subject updated.' : 'Teacher added.');
          this.closeForm();
          this.load();
        },
        error: (e: ApiError) => {
          if (!applyServerErrors(this.form, e.fieldErrors)) this.toast.error(e.message);
        },
      });
  }

  async remove(t: Teacher): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Delete teacher',
      message: `Delete ${t.name}? This cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    this.api.delete(t.id).subscribe({
      next: () => {
        this.teachers.update((list) => list.filter((x) => x.id !== t.id));
        this.toast.success('Teacher deleted.');
      },
      error: (e: ApiError) =>
        this.toast.error(
          e.status === 500
            ? 'The teacher could not be deleted. They probably have attendance records that block deletion.'
            : e.message,
        ),
    });
  }
}
