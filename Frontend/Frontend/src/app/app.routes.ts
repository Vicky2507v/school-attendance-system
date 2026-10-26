import { Routes } from '@angular/router';
import { ACCESS } from './core/access';
import { authGuard, guestGuard, roleGuard } from './core/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in · School Attendance',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · School Attendance',
        canActivate: [roleGuard],
        data: { roles: ACCESS.dashboard },
        loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'students',
        title: 'Students · School Attendance',
        canActivate: [roleGuard],
        data: { roles: ACCESS.students },
        loadComponent: () => import('./pages/students/students.page').then((m) => m.StudentsPage),
      },
      {
        path: 'teachers',
        title: 'Teachers · School Attendance',
        canActivate: [roleGuard],
        data: { roles: ACCESS.teachers },
        loadComponent: () => import('./pages/teachers/teachers.page').then((m) => m.TeachersPage),
      },
      {
        path: 'classes',
        title: 'Classes · School Attendance',
        canActivate: [roleGuard],
        data: { roles: ACCESS.classes },
        loadComponent: () => import('./pages/classes/classes.page').then((m) => m.ClassesPage),
      },
      {
        path: 'attendance',
        title: 'Attendance · School Attendance',
        canActivate: [roleGuard],
        data: { roles: ACCESS.attendance },
        loadComponent: () => import('./pages/attendance/attendance.page').then((m) => m.AttendancePage),
      },
      {
        path: 'reports',
        title: 'Reports · School Attendance',
        canActivate: [roleGuard],
        data: { roles: ACCESS.reports },
        loadComponent: () => import('./pages/reports/reports.page').then((m) => m.ReportsPage),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
