package org.example.schoolattandencesystem.repository;

import org.example.schoolattandencesystem.dto.DateRangeAttendanceResponse;
import org.example.schoolattandencesystem.entity.Attendance;
import org.example.schoolattandencesystem.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Find attendance of a complete class on a particular date
    List<Attendance> findBySchoolClass_IdAndDate(Long classId, LocalDate date);

    // Find all attendance records of a student
    List<Attendance> findByStudent_Id(Long studentId);

    // Check whether attendance already exists
    boolean existsByStudent_IdAndDate(Long studentId, LocalDate date);

    // Total Students
    long countBySchoolClass_Id(Long classId);

    // present & absent students
    long countBySchoolClass_IdAndDateAndStatus(Long classId, LocalDate date, AttendanceStatus status);

    // monthly attendance report
    List<Attendance> findByStudent_IdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);

    // monthly attendance report for class between dates
    List<Attendance> findBySchoolClass_IdAndDateBetween(Long classId, LocalDate startDate, LocalDate endDate);

    // Date range attendance report
//    DateRangeAttendanceResponse getDateRangeAttendanceHistory(Long studentId, LocalDate startDate, LocalDate endDate);

}