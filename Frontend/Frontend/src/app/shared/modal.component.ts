import { Component, HostListener, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-modal',
  imports: [IconComponent],
  template: `
    <div class="modal-backdrop" (click)="closed.emit()">
      <div class="modal" [class.modal-lg]="wide()" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
        <header class="modal-head">
          <h3>{{ title() }}</h3>
          <button type="button" class="icon-btn" aria-label="Close" (click)="closed.emit()"><app-icon name="x" /></button>
        </header>
        <div class="modal-body"><ng-content /></div>
      </div>
    </div>`,
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly wide = input(false);
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }
}
