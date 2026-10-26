import { Component, HostListener, inject } from '@angular/core';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    @if (confirm.pending(); as c) {
      <div class="modal-backdrop" (click)="confirm.answer(false)">
        <div class="modal modal-sm" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()">
          <header class="modal-head"><h3>{{ c.title }}</h3></header>
          <div class="modal-body">
            <p>{{ c.message }}</p>
            <div class="form-actions">
              <button type="button" class="btn btn-ghost" (click)="confirm.answer(false)">Cancel</button>
              <button type="button" class="btn" [class.btn-danger]="c.danger" [class.btn-primary]="!c.danger"
                      (click)="confirm.answer(true)">{{ c.confirmText || 'Confirm' }}</button>
            </div>
          </div>
        </div>
      </div>
    }`,
})
export class ConfirmDialogComponent {
  readonly confirm = inject(ConfirmService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.confirm.answer(false);
  }
}
