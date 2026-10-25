package org.example.schoolattandencesystem.controller;

import jakarta.validation.Valid;
import org.example.schoolattandencesystem.dto.*;
import org.example.schoolattandencesystem.entity.Attendance;
import org.example.schoolattandencesystem.entity.MarkAttendanceRequest;
import org.example.schoolattandencesystem.entity.UpdateAttendanceRequest;
import org.example.schoolattandencesystem.repository.AttendanceRepository;
import org.example.schoolattandencesystem.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // Mark Attendance for a class
    @PostMapping("/mark")
    public boolean markAttendance(@Valid  @RequestBody MarkAttendanceRequest markAttendanceRequest) {

        return attendanceService.markAttendance(markAttendanceRequest);

    }

    // Display attendance of a class on a particular date
    @GetMapping("/class/{classId}/date/{date}")
    public List<Attendance> getAttendanceByClassAndDate(@PathVariable Long classId, @PathVariable LocalDate date) {

        return attendanceService.getAttendanceByClassAndDate(classId, date);

    }

    // Delete attendance by ID
    @DeleteMapping("/{id}")
    public boolean deleteAttendance(@PathVariable Long id) {

        return attendanceService.deleteAttendance(id);
    }

    @GetMapping("/summary/{classId}")
    public ResponseEntity<AttendanceSummaryResponse> getAttendanceByClass(@PathVariable Long classId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
            AttendanceSummaryResponse response = attendanceService.getAttendanceSummary(classId, date);

            return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attendance> updateAttendance(@PathVariable Long id, @RequestBody UpdateAttendanceRequest updateAttendanceRequest) {

        Attendance attendance = attendanceService.updateAttendance(id, updateAttendanceRequest);

        return ResponseEntity.ok(attendance);

    }

    @GetMapping("/history/{studentId}")
    public ResponseEntity<StudentAttendanceHistoryResponse> getStudentAttendanceHistory(@PathVariable Long studentId) {

        StudentAttendanceHistoryResponse response = attendanceService.getStudentAttendanceHistory(studentId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly/{studentId}")
    public ResponseEntity<MonthlyAttendanceResponse> getMonthlyAttendance(@PathVariable Long studentId, @RequestParam int month, @RequestParam int year) {

        MonthlyAttendanceResponse response = attendanceService.getMonthlyAttendanceHistory(studentId, month, year);

        return ResponseEntity.ok(response);

    }

    @GetMapping("/class/monthly/{classId}")
    public ResponseEntity<ClassMonthlyAttendanceResponse> getClassMonthAttendance(@PathVariable Long classId, @RequestParam int month, @RequestParam int year) {

       ClassMonthlyAttendanceResponse response = attendanceService.getClassMonthlyAttendanceHistory(classId, month, year);

       return ResponseEntity.ok(response);

    }

    @GetMapping("/student/{studentId}/range")
    public ResponseEntity<DateRangeAttendanceResponse> getDateRangeAttendance(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        DateRangeAttendanceResponse response =
                attendanceService.getDateRangeAttendance(
                        studentId,
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(response);
    }

}