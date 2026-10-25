package org.example.schoolattandencesystem.dto;

import org.example.schoolattandencesystem.entity.SchoolClass;

import java.util.List;

public class ClassMonthlyAttendanceResponse {

    private Long classId;
    private String className;
    private String section;

    private int month;
    private int year;
    private SchoolClass schoolClass;

    private List<MonthlyAttendanceResponse> students;

    public SchoolClass getSchoolClass() {
        return schoolClass;
    }

    public void setSchoolClass(SchoolClass schoolClass) {
        this.schoolClass = schoolClass;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

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

    public List<MonthlyAttendanceResponse> getStudents() {
        return students;
    }

    public void setStudents(List<MonthlyAttendanceResponse> students) {
        this.students = students;
    }
}
