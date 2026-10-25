import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { IconComponent } from '../../shared/icon.component';
import { ToastContainerComponent } from '../../shared/toast-container.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe, IconComponent, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  readonly navOpen = signal(false);
  readonly today = new Date();
  readonly links = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/students', label: 'Students', icon: 'students' },
    { path: '/teachers', label: 'Teachers', icon: 'teachers' },
    { path: '/classes', label: 'Classes', icon: 'classes' },
    { path: '/attendance', label: 'Attendance', icon: 'attendance' },
    { path: '/reports', label: 'Reports', icon: 'reports' },
  ];
}
