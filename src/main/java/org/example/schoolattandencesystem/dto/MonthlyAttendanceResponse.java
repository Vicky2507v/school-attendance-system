package org.example.schoolattandencesystem.dto;

public class MonthlyAttendanceResponse {

    private Long studentId;
    private String studentName;

    private int month;
    private int year;

    private long totalDays;
    private long presentDays;
    private long absentDays;

    private Double attendancePercentage;

    public Double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(Double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public long getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(long totalDays) {
        this.totalDays = totalDays;
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
}
