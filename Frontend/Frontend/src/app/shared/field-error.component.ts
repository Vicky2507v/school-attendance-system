import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/** Shows the first validation message of a control (client-side or server-supplied). */
@Component({
  selector: 'app-field-error',
  template: `@if (message; as m) { <p class="field-error" role="alert">{{ m }}</p> }`,
})
export class FieldErrorComponent {
  readonly control = input<AbstractControl | null>(null);
  readonly label = input('This field');

  get message(): string | null {
    const c = this.control();
    if (!c || !c.errors || !(c.touched || c.dirty)) return null;
    const e = c.errors;
    if (e['server']) return String(e['server']);
    if (e['required']) return `${this.label()} is required.`;
    if (e['email']) return 'Enter a valid email address.';
    if (e['positiveInt']) return `${this.label()} must be a positive whole number.`;
    if (e['min']) return `${this.label()} must be at least ${e['min'].min}.`;
    if (e['max']) return `${this.label()} must be at most ${e['max'].max}.`;
    return `${this.label()} is invalid.`;
  }
}
