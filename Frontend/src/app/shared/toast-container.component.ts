import { Component, inject } from '@angular/core';
import { IconComponent } from './icon.component';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [IconComponent],
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (t of toastService.toasts(); track t.id) {
        <div class="toast" [class.toast-success]="t.type === 'success'" [class.toast-error]="t.type === 'error'"
             [class.toast-info]="t.type === 'info'" role="status">
          <app-icon [name]="t.type === 'success' ? 'check' : 'alert'" />
          <span class="toast-msg">{{ t.message }}</span>
          <button type="button" class="icon-btn" aria-label="Dismiss" (click)="toastService.dismiss(t.id)"><app-icon name="x" /></button>
        </div>
      }
    </div>`,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
