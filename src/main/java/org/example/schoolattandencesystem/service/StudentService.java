package org.example.schoolattandencesystem.service;

import org.example.schoolattandencesystem.entity.ClassSection;
import org.example.schoolattandencesystem.entity.SchoolClass;
import org.example.schoolattandencesystem.entity.Student;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


public interface StudentService {

    // +-+-+- Student +-+-+-
    public boolean addStudent(Student student);
    public Optional<Student> getStudentByRollNo(Long id);
    public List<Student> displayAllStudents();
    public boolean updateStudent(Long id, String email);
    public boolean deleteStudent(Long id);
    public void deleteAllStudent();
    public List<Student> findByName(String name);
    public Student findByRollNo(Integer rollNo);
    public Student findByEmail(String email);
    public List<Student> findByClassSection(ClassSection classSection);

}