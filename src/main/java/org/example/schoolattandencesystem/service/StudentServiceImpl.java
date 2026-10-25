package org.example.schoolattandencesystem.service;

import org.example.schoolattandencesystem.entity.ClassSection;
import org.example.schoolattandencesystem.entity.SchoolClass;
import org.example.schoolattandencesystem.entity.Student;
import org.example.schoolattandencesystem.repository.SchoolClassRepository;
import org.example.schoolattandencesystem.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.example.schoolattandencesystem.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Override
    public boolean addStudent(Student student) {

        if (student.getSchoolClass() == null ||
                student.getSchoolClass().getId() == null) {

            return false;
        }

        SchoolClass schoolClass = schoolClassRepository
                .findById(student.getSchoolClass().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("School class not found"));

        student.setSchoolClass(schoolClass);

        Student savedStudent = studentRepository.save(student);

        return savedStudent.getId() != null;
    }

    @Override
    public Optional<Student> getStudentByRollNo(Long id) {
        return studentRepository.findById(id);
    }

    @Override
    public List<Student> displayAllStudents() {

        return studentRepository.findAll();

    }

    @Override
    public boolean updateStudent(Long id, String email) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Student not found"));

        student.setEmail(email);
        studentRepository.save(student);

        return true;
    }

    @Override
    public boolean deleteStudent(Long id) {

        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found");
        }

        studentRepository.deleteById(id);
        return true;
    }

    @Override
    public void deleteAllStudent() {

        studentRepository.deleteAll();

    }

    // chatGPT - 3. Correct your StudentService interface - baki che
    @Override
    public List<Student> findByClassSection(ClassSection classSection) {

        return studentRepository.findBySchoolClass_ClassSection(classSection);

    }


    @Override
    public List<Student> findByName(String name) {

        List<Student> list = studentRepository.findByName(name);

        for(Student student : list) {

            System.out.println("Student Id: "+ student.getId());
            System.out.println("Name: "+student.getName());
            System.out.println("Email: "+student.getEmail());
            System.out.println("Class Section: "+ student.getSchoolClass());

        }

        return list;

    }

    @Override
    public Student findByRollNo(Integer rollNo) {
        Student student = studentRepository.findByRollNo(rollNo);

        if (student == null) {
            throw new ResourceNotFoundException("Student not found");
        }

        return student;
    }

    public Student findByEmail(String email) {
        return studentRepository.findByEmail(email);
    }

}