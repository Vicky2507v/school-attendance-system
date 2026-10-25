package org.example.schoolattandencesystem.dto;

import org.example.schoolattandencesystem.entity.AttendanceStatus;

import java.time.LocalDate;

public class AttendanceHistoryItem {

    private LocalDate date;
    private AttendanceStatus status;

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }
}
