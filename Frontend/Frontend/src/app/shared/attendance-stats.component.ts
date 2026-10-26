import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

/** Totals + percentage block reused by the report tabs. */
@Component({
  selector: 'app-attendance-stats',
  imports: [DecimalPipe],
  template: `
    <section class="stat-grid">
      <div class="stat-card"><div><p class="stat-label">Days recorded</p><p class="stat-value">{{ total() }}</p></div></div>
      <div class="stat-card"><div><p class="stat-label">Present</p><p class="stat-value text-success">{{ present() }}</p></div></div>
      <div class="stat-card"><div><p class="stat-label">Absent</p><p class="stat-value text-danger">{{ absent() }}</p></div></div>
      <div class="stat-card">
        <div class="grow">
          <p class="stat-label">Attendance</p>
          <p class="stat-value" [class]="tone()">{{ percentage() | number: '1.0-2' }}%</p>
          <div class="bar"><span [style.width.%]="percentage()" [class]="'fill-' + tone()"></span></div>
        </div>
      </div>
    </section>`,
})
export class AttendanceStatsComponent {
  readonly total = input.required<number>();
  readonly present = input.required<number>();
  readonly absent = input.required<number>();
  readonly percentage = input.required<number>();
  readonly tone = computed(() => (this.percentage() >= 90 ? 'good' : this.percentage() >= 75 ? 'warn' : 'bad'));
}
