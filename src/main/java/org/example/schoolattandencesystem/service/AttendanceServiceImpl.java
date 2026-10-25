package org.example.schoolattandencesystem.service;

import jakarta.transaction.Transactional;
import org.example.schoolattandencesystem.dto.*;
import org.example.schoolattandencesystem.entity.*;
import org.example.schoolattandencesystem.exception.ResourceNotFoundException;
import org.example.schoolattandencesystem.repository.AttendanceRepository;
import org.example.schoolattandencesystem.repository.SchoolClassRepository;
import org.example.schoolattandencesystem.repository.StudentRepository;
import org.example.schoolattandencesystem.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Override
    @Transactional
    public boolean markAttendance(MarkAttendanceRequest markAttendanceRequest) {

        // 1. validate markAttendanceRequest

        if(markAttendanceRequest == null ||
                markAttendanceRequest.getClassId() == null ||
                markAttendanceRequest.getTeacherId() == null ||
                markAttendanceRequest.getDate() == null ||
                markAttendanceRequest.getAttendance().isEmpty()) {

            throw new IllegalArgumentException("Invalid mark attendance request");

        }

        // 2. Find Class
        SchoolClass schoolClass = schoolClassRepository
                .findById(markAttendanceRequest.getClassId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Class not found"));

        // 3. Find Teacher
        Teachers teacher = teacherRepository
                .findById(markAttendanceRequest.getTeacherId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Teacher not found"));

        // 4. Prevent duplicate student IDs in request
        Set<Long> studentIds = new HashSet<>();

        for (StudentAttendanceRequest item : markAttendanceRequest.getAttendance()) {

            if (item.getStudentId() == null ||
                    item.getStatus() == null) {
                throw new IllegalArgumentException(
                        "Student ID and status are required");
            }

            if (!studentIds.add(item.getStudentId())) {
                throw new IllegalArgumentException(
                        "Duplicate student in attendance request");
            }
        }

        // 5. Prepare attandence record
        List<Attendance> records = markAttendanceRequest.getAttendance()
                .stream()
                .map(item -> {

                    Student student =
                            studentRepository.findById(item.getStudentId())
                                    .orElseThrow(() ->
                                            new IllegalArgumentException(
                                                    "Student not found"));

                    // Ensure student belongs to selected class
                    if (!student.getSchoolClass().getId()
                            .equals(schoolClass.getId())) {

                        throw new IllegalArgumentException(
                                "Student does not belong to selected class");
                    }

                    // Prevent duplicate attendance for same date
                    if (attendanceRepository
                            .existsByStudent_IdAndDate(
                                    student.getId(), markAttendanceRequest.getDate())) {

                        throw new IllegalArgumentException(
                                "Attendance already exists for student: "
                                        + student.getId());
                    }

                    Attendance attendance = new Attendance();

                    attendance.setDate(markAttendanceRequest.getDate());
                    attendance.setStatus(item.getStatus());
                    attendance.setStudent(student);
                    attendance.setSchoolClass(schoolClass);
                    attendance.setTeacher(teacher);

                    return attendance;
                })
                .toList();

        // 6. Save all attendance records together
        attendanceRepository.saveAll(records);

        return true;
    }

    @Override
    public List<Attendance> getAttendanceByClassAndDate(
            Long classId, LocalDate date) {

        return attendanceRepository
                .findBySchoolClass_IdAndDate(classId, date);
    }

    @Override
    public List<Attendance> getAttendanceByStudent(Long studentId) {

        return attendanceRepository.findByStudent_Id(studentId);
    }

    @Override
    public boolean deleteAttendance(Long id) {

        if (!attendanceRepository.existsById(id)) {
            return false;
        }

        attendanceRepository.deleteById(id);

        return true;
    }

    @Override
    public AttendanceSummaryResponse getAttendanceSummary(Long classId, LocalDate date) {

        // 1. find the class
        if(classId == null || date == null) {
            throw new IllegalArgumentException("Class Id & Date are required");
        }

        // 2. Find the class
        SchoolClass schoolClass = schoolClassRepository.findById(classId).orElseThrow(()->new  IllegalArgumentException("Class not found"));

        // 3. Get Total students enrolled in the class
        long totalStudents = studentRepository.countBySchoolClass_Id(classId);

        // 4. count present students for this class and date
        long present = attendanceRepository.countBySchoolClass_IdAndDateAndStatus(classId, date, AttendanceStatus.PRESENT);

        // 5. count absent students for this class and date
        long absent = attendanceRepository.countBySchoolClass_IdAndDateAndStatus(classId, date, AttendanceStatus.ABSENT);

        // 6. calculate attendance percentage (%)
        double attendancePercentage = 0.0;

        if(totalStudents>0) {
            attendancePercentage = Math.round((present * 10000.0) / totalStudents) / 100;
        }

        // 7. prepare response
        AttendanceSummaryResponse attendanceSummaryResponse = new AttendanceSummaryResponse();

        attendanceSummaryResponse.setSection(schoolClass.getClassSection().name());
        attendanceSummaryResponse.setClassName(schoolClass.getClassName());
        attendanceSummaryResponse.setDate(date);
        attendanceSummaryResponse.setTotalStudents(totalStudents);
        attendanceSummaryResponse.setAbsent(absent);
        attendanceSummaryResponse.setPresent(present);
        attendanceSummaryResponse.setAttendancePercentage(attendancePercentage);

        return attendanceSummaryResponse;
    }

    @Override
    public Attendance updateAttendance(Long id, UpdateAttendanceRequest updateAttendanceRequest) {

        if(id == null || updateAttendanceRequest == null) {
            throw new IllegalArgumentException("ID or UpdateAttendanceRequest are required");
        }

        Attendance attendance = attendanceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));

        attendance.setStatus(updateAttendanceRequest.getAttendanceStatus());

        return attendanceRepository.save(attendance);

    }

    // Attendance History
    @Override
    public StudentAttendanceHistoryResponse getStudentAttendanceHistory(Long studentId) {

        // 1. validate student ID
        if(studentId == null) {
            throw new IllegalArgumentException("Student id is required");
        }

        // 2. Find Student
        Student std = studentRepository.findById(studentId).orElseThrow(() -> new ResourceNotFoundException("Student record not found"));

        // 3. Get attendance history
        List<Attendance> attendanceList = attendanceRepository.findByStudent_Id(studentId);

        // 4. total Days
        long totalDays = attendanceList.size();

        // 5. present days
        long presentDays = attendanceList.stream().filter(attendance ->attendance.getStatus() == AttendanceStatus.PRESENT).count();

        // 6. absent days
        long absentDays = attendanceList.stream().filter(attendance -> attendance.getStatus() == AttendanceStatus.ABSENT).count();

        // 7. Calculate percentage
        double attendancePercentage = 0.0;

        if (totalDays > 0) {
            attendancePercentage = Math.round((presentDays * 10000.0) / totalDays) / 100.0;
        }

        // 8. Create response
        StudentAttendanceHistoryResponse response =
                new StudentAttendanceHistoryResponse();

        response.setStudentId(std.getId());
        response.setStudentName(std.getName());
        response.setTotalDays(totalDays);
        response.setPresentDays(presentDays);
        response.setAbsentDays(absentDays);
        response.setAttendancePercentage(attendancePercentage);

        // 9. Convert attendance entities into history items
        List<AttendanceHistoryItem> historyItems =
                attendanceList.stream()
                        .map(attendance -> {

                            AttendanceHistoryItem item =
                                    new AttendanceHistoryItem();

                            item.setDate(attendance.getDate());
                            item.setStatus(attendance.getStatus());

                            return item;
                        })
                        .toList();

        response.setAttendanceHistoryItem(historyItems);

        return response;
    }

    public MonthlyAttendanceResponse getMonthlyAttendanceHistory(Long studentId, int month, int year) {

        if(studentId == null) {
            throw new IllegalArgumentException("Student id is required");
        }

        if(month < 1 || month > 12) {
            throw new IllegalArgumentException("Invalid month");
        }

        if(year < 1 || year > 9999) {
            throw new IllegalArgumentException("Invalid year");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Student record not found"));

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(
                startDate.lengthOfMonth()
        );

        List<Attendance> attendanceList =
                attendanceRepository.findByStudent_IdAndDateBetween(
                        studentId,
                        startDate,
                        endDate
                );

        long totalDays = attendanceList.size();

        long presentDays = attendanceList.stream()
                .filter(attendance ->
                        attendance.getStatus() == AttendanceStatus.PRESENT)
                .count();

        long absentDays = attendanceList.stream()
                .filter(attendance ->
                        attendance.getStatus() == AttendanceStatus.ABSENT)
                .count();

        double attendancePercentage = 0.0;

        if (totalDays > 0) {
            attendancePercentage =
                    Math.round((presentDays * 10000.0) / totalDays) / 100.0;
        }

        MonthlyAttendanceResponse response =
                new MonthlyAttendanceResponse();

        response.setStudentId(student.getId());
        response.setStudentName(student.getName());

        response.setMonth(month);
        response.setYear(year);

        response.setTotalDays(totalDays);
        response.setPresentDays(presentDays);
        response.setAbsentDays(absentDays);

        response.setAttendancePercentage(attendancePercentage);

        return response;

    }

    @Override
    public ClassMonthlyAttendanceResponse getClassMonthlyAttendanceHistory(Long classId, int month, int year) {

        if(classId == null) {
            throw new IllegalArgumentException("Class id is required");
        }

        if(month < 1 || month > 12) {
            throw new IllegalArgumentException("Invalid month");
        }

        if(year < 1 || year > 9999) {
            throw new IllegalArgumentException("Invalid year");
        }

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Attendance> attendanceList =
                attendanceRepository.findBySchoolClass_IdAndDateBetween(
                        classId,
                        startDate,
                        endDate
                );

        Map<Long, List<Attendance>> attendanceByStudent =
                attendanceList.stream()
                        .collect(Collectors.groupingBy(
                                attendance -> attendance.getStudent().getId()
                        ));

        List<Student> students =
                studentRepository.findBySchoolClass_Id(classId);

        List<MonthlyAttendanceResponse> studentReports =
                new ArrayList<>();

        for (Student student : students) {

            List<Attendance> studentAttendance =
                    attendanceByStudent.getOrDefault(
                            student.getId(),
                            List.of()
                    );

            long totalDays = studentAttendance.size();

            long presentDays = studentAttendance.stream()
                    .filter(attendance ->
                            attendance.getStatus() == AttendanceStatus.PRESENT)
                    .count();

            long absentDays = studentAttendance.stream()
                    .filter(attendance ->
                            attendance.getStatus() == AttendanceStatus.ABSENT)
                    .count();

            double attendancePercentage = 0.0;

            if (totalDays > 0) {
                attendancePercentage =
                        Math.round(
                                (presentDays * 10000.0) / totalDays
                        ) / 100.0;
            }

            MonthlyAttendanceResponse studentResponse =
                    new MonthlyAttendanceResponse();

            studentResponse.setStudentId(student.getId());
            studentResponse.setStudentName(student.getName());

            studentResponse.setMonth(month);
            studentResponse.setYear(year);

            studentResponse.setTotalDays(totalDays);
            studentResponse.setPresentDays(presentDays);
            studentResponse.setAbsentDays(absentDays);

            studentResponse.setAttendancePercentage(
                    attendancePercentage
            );

            studentReports.add(studentResponse);
        }

        ClassMonthlyAttendanceResponse response =
                new ClassMonthlyAttendanceResponse();

        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Class not found"));

        response.setClassId(schoolClass.getId());

        response.setClassName(
                schoolClass.getClassName()
        );

        response.setSection(
                schoolClass.getClassSection().name()
        );

        response.setMonth(month);
        response.setYear(year);

        response.setStudents(studentReports);

        return response;

    }

    public DateRangeAttendanceResponse getDateRangeAttendance(Long studentId, LocalDate startDate, LocalDate endDate) {

        if (studentId == null) {
            throw new IllegalArgumentException("Student id is required");
        }

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Student record not found"
                        ));

        List<Attendance> attendanceList =
                attendanceRepository.findByStudent_IdAndDateBetween(
                        studentId,
                        startDate,
                        endDate
                );

        long totalDays = attendanceList.size();

        long presentDays = attendanceList.stream()
                .filter(attendance ->
                        attendance.getStatus() == AttendanceStatus.PRESENT)
                .count();

        long absentDays = attendanceList.stream()
                .filter(attendance ->
                        attendance.getStatus() == AttendanceStatus.ABSENT)
                .count();

        double attendancePercentage = 0.0;

        if (totalDays > 0) {
            attendancePercentage =
                    Math.round(
                            (presentDays * 10000.0) / totalDays
                    ) / 100.0;
        }

        DateRangeAttendanceResponse response =
                new DateRangeAttendanceResponse();

        response.setStudentId(student.getId());
        response.setStudentName(student.getName());

        response.setStartDate(startDate);
        response.setEndDate(endDate);

        response.setTotalDays(totalDays);
        response.setPresentDays(presentDays);
        response.setAbsentDays(absentDays);

        response.setAttendancePercentage(
                attendancePercentage
        );

        return response;

    }


}