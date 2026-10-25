package org.example.schoolattandencesystem.service;

import org.example.schoolattandencesystem.dto.*;
import org.example.schoolattandencesystem.entity.Attendance;
import org.example.schoolattandencesystem.entity.MarkAttendanceRequest;
import org.example.schoolattandencesystem.entity.UpdateAttendanceRequest;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {

    public boolean markAttendance(MarkAttendanceRequest markAttendanceRequest);
    public List<Attendance> getAttendanceByClassAndDate(Long classId, LocalDate date);
    public List<Attendance> getAttendanceByStudent(Long studentId);
    public boolean deleteAttendance(Long id);

    // Attendance Summary
    AttendanceSummaryResponse getAttendanceSummary(Long classId, LocalDate date);

    // update the attendance
    Attendance updateAttendance(Long id, UpdateAttendanceRequest updateAttendanceRequest);

    // Attendance History page
    StudentAttendanceHistoryResponse getStudentAttendanceHistory(Long studentId);

    // monthly attendance report
    MonthlyAttendanceResponse getMonthlyAttendanceHistory(Long studentId, int month, int year);

    // class monthly attendance report
    ClassMonthlyAttendanceResponse getClassMonthlyAttendanceHistory(Long classId, int month, int year);

    // Get Date range Attendance
    DateRangeAttendanceResponse getDateRangeAttendance(Long studentId, LocalDate startDate, LocalDate endDate);

}