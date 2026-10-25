import { Component, computed, input } from '@angular/core';

const ICONS: Record<string, string[]> = {
  menu: ['M3 12h18', 'M3 6h18', 'M3 18h18'],
  x: ['M18 6L6 18', 'M6 6l12 12'],
  plus: ['M12 5v14', 'M5 12h14'],
  search: ['M11 3a8 8 0 100 16 8 8 0 000-16z', 'M21 21l-4.35-4.35'],
  edit: ['M12 20h9', 'M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z'],
  trash: ['M3 6h18', 'M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2', 'M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6'],
  eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 100 6 3 3 0 000-6z'],
  dashboard: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  students: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 3a4 4 0 100 8 4 4 0 000-8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  teachers: ['M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z', 'M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16'],
  classes: ['M4 19.5A2.5 2.5 0 016.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z'],
  attendance: ['M9 11l3 3L22 4', 'M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11'],
  reports: ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
  check: ['M20 6L9 17l-5-5'],
  alert: ['M12 9v4', 'M12 17h.01', 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'],
  inbox: ['M22 12h-6l-2 3h-4l-2-3H2', 'M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z'],
};

@Component({
  selector: 'app-icon',
  template: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @for (d of paths(); track $index) { <path [attr.d]="d" /> }
    </svg>`,
  styles: [':host{display:inline-flex;align-items:center;line-height:1}'],
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly paths = computed(() => ICONS[this.name()] ?? []);
}
