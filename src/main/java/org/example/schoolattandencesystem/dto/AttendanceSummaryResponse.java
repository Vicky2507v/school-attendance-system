package org.example.schoolattandencesystem.dto;

import java.time.LocalDate;

public class AttendanceSummaryResponse {

    private String className;
    private String section;
    private LocalDate date;

    private Long totalStudents;
    private Long present;
    private Long absent;

    private Double attendancePercentage;

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(Long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public Long getPresent() {
        return present;
    }

    public void setPresent(Long present) {
        this.present = present;
    }

    public Long getAbsent() {
        return absent;
    }

    public void setAbsent(Long absent) {
        this.absent = absent;
    }

    public Double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(Double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

}