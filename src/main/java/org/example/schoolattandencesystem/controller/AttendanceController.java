package org.example.schoolattandencesystem.contoller;

import org.example.schoolattandencesystem.dto.AttendanceSummaryResponse;
import org.example.schoolattandencesystem.entity.Attendance;
import org.example.schoolattandencesystem.entity.MarkAttendanceRequest;
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
    public boolean markAttendance(@RequestBody MarkAttendanceRequest markAttendanceRequest) {

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

}