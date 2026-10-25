package org.example.schoolattandencesystem.dto;

import org.example.schoolattandencesystem.entity.AttendanceStatus;

import java.time.LocalDate;
import java.util.List;

public class StudentAttendanceHistoryResponse {

    private Long studentId;
    private String studentName;
    private long totalDays;
    private long presentDays;
    private long absentDays;
    private double attendancePercentage;
    private List<AttendanceHistoryItem> attendanceHistoryItem;

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public long getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(long totalDays) {
        this.totalDays = totalDays;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public long getPresentDays() {
        return presentDays;
    }

    public void setPresentDays(long presentDays) {
        this.presentDays = presentDays;
    }

    public long getAbsentDays() {
        return absentDays;
    }

    public void setAbsentDays(long absentDays) {
        this.absentDays = absentDays;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public List<AttendanceHistoryItem> getAttendanceHistoryItem() {
        return attendanceHistoryItem;
    }

    public void setAttendanceHistoryItem(List<AttendanceHistoryItem> attendanceHistoryItem) {
        this.attendanceHistoryItem = attendanceHistoryItem;
    }

}
