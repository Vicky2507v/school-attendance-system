# Backend API contract (read from source), limitations, test checklist

Base URL `http://localhost:8282` (no `/api` prefix – the dev proxy adds/strips it). No auth, no CORS config in backend.

## Endpoints used
| Area | Method & URL | Body / params | Response |
|---|---|---|---|
| Student | GET `/getAllStudents` | – | `Student[]` |
| | GET `/getStudent/{id}` | – | `Student` (empty body if missing) |
| | GET `/displayByRollNo/{rollNo}` | – | `Student` (404 if none) |
| | POST `/addStudent` | `{name, rollNo, email, schoolClass:{id}}` | `boolean` |
| | PUT `/updateStudents/{id}` | same body (validated) – **only email is saved** | `boolean` |
| | DELETE `/delete/{id}` | – | empty (404 if missing) |
| Teacher | GET `/getTeachers` | – | `Teacher[]` |
| | POST `/addTeacher` | `{name, email, subject, phoneNo}` | `boolean` |
| | PUT `/updateTeacher/{id}` | same body – **only subject is saved** | `boolean` |
| | DELETE `/deletebyId/{id}` | – | `boolean` (404 if missing) |
| Class | POST `/createClass` | `{className, classSection: A\|B\|C}` | `boolean` (no id returned) |
| | GET `/displayDataByClass/{className}` | exact name | `SchoolClass[]` (404 if none) |
| Attendance | POST `/attendance/mark` | `{classId, teacherId, date, attendance:[{studentId,status}]}` | `true` – all-or-nothing, fails if any listed student already has that date |
| | GET `/attendance/class/{classId}/date/{date}` | – | `Attendance[]` (`[]` if none) |
| | PUT `/attendance/{id}` | `{attendanceStatus}` | `Attendance` |
| | DELETE `/attendance/{id}` | – | `boolean` |
| Reports | GET `/attendance/summary/{classId}?date=` | | `{className, section, date, totalStudents, present, absent, attendancePercentage}` |
| | GET `/attendance/history/{studentId}` | | `{studentId, studentName, totalDays, presentDays, absentDays, attendancePercentage, attendanceHistoryItem[]}` |
| | GET `/attendance/monthly/{studentId}?month=&year=` | | `{…, month, year, totalDays, presentDays, absentDays, attendancePercentage}` |
| | GET `/attendance/class/monthly/{classId}?month=&year=` | | `{classId, className, section, month, year, students[]}` |
| | GET `/attendance/student/{studentId}/range?startDate=&endDate=` | | `{…, startDate, endDate, totals, attendancePercentage}` |

Errors: `{status, message}` for 404/400/500; validation 400 is a plain map `{field: message}`. Both are handled in
`core/error.interceptor.ts`; field messages are shown beside the matching form control.

## Backend limitations that affect the UI (no backend files were changed)
1. **No "list classes" endpoint.** The class dropdowns/list are rebuilt from classes referenced by students plus class
   names created/added in this browser (looked up through `/displayDataByClass/{name}`). A class with no students that was
   created elsewhere only appears after "Add existing class by name". *Smallest fix (needs your approval):*
   `@GetMapping("/getAllClasses")` in `SchoolClassController` returning `schoolClassRepository.findAll()`; then set
   `classListEndpoint: '/getAllClasses'` in the environment file.
2. **Class uniqueness is too strict.** `SchoolClass` marks `className` unique **and** `classSection` unique individually, so
   only one class per name and only A/B/C once overall (e.g. "10th-A" blocks "10th-B"). Duplicate attempts return a generic 500.
   Fix would be a schema change (remove the single-column unique constraints) – not made.
3. **No update/delete for a single class**; `/deleteAllSchoolClass` and delete-all-students endpoints are intentionally **not** exposed.
4. **Student update saves only email; teacher update saves only subject.** The edit forms make other fields read-only.
5. **Section filter endpoint** `/displayByClassSection/{section}` appears broken (path variable name mismatch → 500), so section
   filtering is done client-side on `/getAllStudents`. Name search is also client-side (backend name lookup is exact-match).
6. **Dashboard totals** have no count endpoints: totals are `list.length` of the real lists; attendance numbers come from
   `/attendance/summary/{classId}` per class for the chosen date.
7. **Summary percentage is truncated** server-side (integer division), so the UI recomputes present ÷ enrolled with one decimal. Report endpoints' percentages are used as returned.
8. Deleting a student/teacher who has attendance rows probably fails with a generic 500 (FK constraint); the UI explains this.
9. `application.properties` contains DB credentials in plain text – consider environment variables / rotating them if that file is public.

## Not verified (could not be run in this environment)
- `npm install` / `ng build` (no network, no Angular CLI) – **compilation has not been confirmed**. A TypeScript syntax pass found no syntax errors; type checking against Angular was not possible.
- Nothing was tested against a running backend/MySQL. In particular: whether date path variables (`/date/2026-10-24`) parse without `@DateTimeFormat` (if you see a 400/500 there, that is the cause), and the exact behaviour of `Optional<Student>` for missing IDs.

## Manual test checklist
**Setup**: MySQL up → backend up (8282) → `npm start` → open http://localhost:4200, no red banner on Dashboard.
- [ ] Classes: create "8th" / A → success toast; appears in list. Duplicate → error message. "Add existing class by name" finds an existing class; unknown name → "No class named…".
- [ ] Teachers: add (all fields required, email validated); edit subject; search by name/email/subject; subject filter; delete with confirmation.
- [ ] Students: add (blank name, bad email, roll 0/-1/1.5, no class → inline errors; nothing submitted); add valid; duplicate roll/email → error toast; edit email; view details; find by roll no. (found / not found); search; section & class filters; delete with confirmation.
- [ ] Attendance: select class + date + teacher → students appear sorted by roll; mark some; "All present"; Save → success; reload shows saved badges; change one status → "changed" badge → Save updates; delete a saved record; saving twice quickly submits once; future dates are blocked by the date picker.
- [ ] Dashboard: counts match lists; pick a marked date → present/absent/rate and per-class table; unmarked date → "No attendance marked".
- [ ] Reports: student history; student monthly; class monthly (totals row); date range (start > end blocked); empty results show empty states; "Attendance report" link from student details preselects the student.
- [ ] Stop the backend → pages show "Cannot reach the server…" with Retry.
- [ ] Resize to tablet/phone: sidebar becomes a drawer, tables become stacked rows.

## Files
All files under `Frontend/` are new. Backend: **no files created, modified or deleted.**
