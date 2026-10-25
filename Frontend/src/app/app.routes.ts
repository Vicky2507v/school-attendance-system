import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · School Attendance',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'students',
        title: 'Students · School Attendance',
        loadComponent: () => import('./pages/students/students.page').then((m) => m.StudentsPage),
      },
      {
        path: 'teachers',
        title: 'Teachers · School Attendance',
        loadComponent: () => import('./pages/teachers/teachers.page').then((m) => m.TeachersPage),
      },
      {
        path: 'classes',
        title: 'Classes · School Attendance',
        loadComponent: () => import('./pages/classes/classes.page').then((m) => m.ClassesPage),
      },
      {
        path: 'attendance',
        title: 'Attendance · School Attendance',
        loadComponent: () => import('./pages/attendance/attendance.page').then((m) => m.AttendancePage),
      },
      {
        path: 'reports',
        title: 'Reports · School Attendance',
        loadComponent: () => import('./pages/reports/reports.page').then((m) => m.ReportsPage),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
