package org.example.schoolattandencesystem.entity;

import java.time.LocalDate;
import java.util.List;

public class MarkAttendanceRequest {

    private Long classId;
    private Long teacherId;
    private LocalDate date;

    private List<StudentAttendanceRequest> attendance;

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public List<StudentAttendanceRequest> getAttendance() {
        return attendance;
    }

    public void setAttendance(List<StudentAttendanceRequest> attendance) {
        this.attendance = attendance;
    }
}
