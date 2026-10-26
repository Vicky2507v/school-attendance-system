import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { SchoolClass } from '../models/school.models';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local date as yyyy-MM-dd (the format the backend expects for LocalDate). */
export function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export const todayIso = (): string => toIso(new Date());
export const firstOfMonthIso = (): string => {
  const d = new Date();
  return toIso(new Date(d.getFullYear(), d.getMonth(), 1));
};

export const classLabel = (c: Pick<SchoolClass, 'className' | 'classSection'>): string =>
  `${c.className} – ${c.classSection}`;

export const sum = (values: number[]): number => values.reduce((a, b) => a + b, 0);

export const percent = (part: number, whole: number): number | null =>
  whole > 0 ? Math.round((part / whole) * 1000) / 10 : null;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/* ---------- validators ---------- */

/** Required, and whitespace-only counts as empty (backend uses @NotBlank). */
export function requiredTrimmed(c: AbstractControl): ValidationErrors | null {
  const v = c.value;
  return v === null || v === undefined || String(v).trim() === '' ? { required: true } : null;
}

/** Whole number greater than zero (backend: @Positive on Integer rollNo). */
export function positiveInt(c: AbstractControl): ValidationErrors | null {
  const v = c.value;
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? null : { positiveInt: true };
}

/** Group validator: startDate must not be after endDate. */
export function dateOrder(group: AbstractControl): ValidationErrors | null {
  const s = group.get('startDate')?.value as string | null;
  const e = group.get('endDate')?.value as string | null;
  return s && e && s > e ? { dateOrder: true } : null;
}

/** Show backend field errors (validation map) next to the matching form controls. */
export function applyServerErrors(form: FormGroup, fieldErrors?: Record<string, string>): boolean {
  if (!fieldErrors) return false;
  let applied = false;
  for (const [field, message] of Object.entries(fieldErrors)) {
    const control = form.get(field);
    if (control) {
      control.setErrors({ ...(control.errors ?? {}), server: message });
      control.markAsTouched();
      applied = true;
    }
  }
  return applied;
}
