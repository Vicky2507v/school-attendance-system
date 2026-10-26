import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ACCESS } from '../../core/access';
import { AuthService } from '../../core/auth.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { IconComponent } from '../../shared/icon.component';
import { ToastContainerComponent } from '../../shared/toast-container.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe, IconComponent, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);
  readonly navOpen = signal(false);
  readonly today = new Date();

  private readonly allLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ACCESS.dashboard },
    { path: '/students', label: 'Students', icon: 'students', roles: ACCESS.students },
    { path: '/teachers', label: 'Teachers', icon: 'teachers', roles: ACCESS.teachers },
    { path: '/classes', label: 'Classes', icon: 'classes', roles: ACCESS.classes },
    { path: '/attendance', label: 'Attendance', icon: 'attendance', roles: ACCESS.attendance },
    { path: '/reports', label: 'Reports', icon: 'reports', roles: ACCESS.reports },
  ];
  /** Only links the current role may open (UI convenience – the backend still enforces access). */
  readonly links = computed(() => this.allLinks.filter((l) => this.auth.hasRole(l.roles)));
}
