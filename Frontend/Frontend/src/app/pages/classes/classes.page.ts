import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize, forkJoin, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { applyServerErrors, requiredTrimmed } from '../../core/utils';
import { ApiError, CLASS_SECTIONS, SchoolClass, Student } from '../../models/school.models';
import { SchoolClassService } from '../../services/school-class.service';
import { StudentService } from '../../services/student.service';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { FieldErrorComponent } from '../../shared/field-error.component';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-classes-page',
  imports: [ReactiveFormsModule, FormsModule, IconComponent, ModalComponent, FieldErrorComponent, EmptyStateComponent],
  templateUrl: './classes.page.html',
})
export class ClassesPage implements OnInit {
  private readonly classApi = inject(SchoolClassService);
  private readonly studentApi = inject(StudentService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly sections = CLASS_SECTIONS;
  readonly usingWorkaround = !environment.classListEndpoint;

  readonly classes = signal<SchoolClass[]>([]);
  readonly students = signal<Student[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly sectionFilter = signal('');

  readonly formOpen = signal(false);
  readonly saving = signal(false);
  readonly lookupName = signal('');
  readonly lookingUp = signal(false);

  readonly form = this.fb.group({
    className: ['', [requiredTrimmed]],
    classSection: ['A', [requiredTrimmed]],
  });

  readonly studentCounts = computed(() => {
    const counts = new Map<number, number>();
    for (const s of this.students()) {
      const id = s.schoolClass?.id;
      if (id != null) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  });

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const section = this.sectionFilter();
    return this.classes().filter((c) => (!q || c.className.toLowerCase().includes(q)) && (!section || c.classSection === section));
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.studentApi
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

  openCreate(): void {
    this.form.reset({ className: '', classSection: 'A' });
    this.formOpen.set(true);
  }

  submit(): void {
    if (this.saving()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const className = (v.className ?? '').trim();

    this.saving.set(true);
    this.classApi
      .create({ className, classSection: (v.classSection ?? 'A') as SchoolClass['classSection'] })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (ok) => {
          if (!ok) {
            this.toast.error('The class could not be created.');
            return;
          }
          this.toast.success(`Class ${className} created.`);
          this.formOpen.set(false);
          this.load();
        },
        error: (e: ApiError) => {
          if (applyServerErrors(this.form, e.fieldErrors)) return;
          const hint =
            e.status === 500
              ? ' This class name or section may already be in use (the backend currently allows only one class per name and one per section).'
              : '';
          this.toast.error(e.message + hint);
        },
      });
  }

  /** Add an already-existing class to the list by exact name (workaround for the missing list endpoint). */
  lookup(): void {
    const name = this.lookupName().trim();
    if (!name) return;
    this.lookingUp.set(true);
    this.classApi
      .findByName(name)
      .pipe(finalize(() => this.lookingUp.set(false)))
      .subscribe({
        next: () => {
          this.toast.success(`Class "${name}" added to the list.`);
          this.lookupName.set('');
          this.load();
        },
        error: (e: ApiError) => this.toast.error(e.status === 404 ? `No class named "${name}" exists.` : e.message),
      });
  }
}
