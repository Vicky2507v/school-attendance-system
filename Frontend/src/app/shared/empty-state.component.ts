import { Component, input } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-empty-state',
  imports: [IconComponent],
  template: `
    <div class="empty">
      <div class="empty-icon"><app-icon [name]="icon()" /></div>
      <h4>{{ title() }}</h4>
      @if (message()) { <p class="muted">{{ message() }}</p> }
      <ng-content />
    </div>`,
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input.required<string>();
  readonly message = input('');
}
