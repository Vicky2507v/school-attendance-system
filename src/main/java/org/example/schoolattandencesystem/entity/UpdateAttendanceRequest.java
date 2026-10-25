package org.example.schoolattandencesystem.entity;

public class UpdateAttendanceRequest {

    private AttendanceStatus attendanceStatus;


    public AttendanceStatus getAttendanceStatus() {
        return attendanceStatus;
    }

    public void setAttendanceStatus(AttendanceStatus attendanceStatus) {
        this.attendanceStatus = attendanceStatus;
    }

}