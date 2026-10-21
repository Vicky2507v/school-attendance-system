package org.example.schoolattandencesystem.contoller;

import org.example.schoolattandencesystem.entity.ClassSection;
import org.example.schoolattandencesystem.entity.Student;
import org.example.schoolattandencesystem.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping("/addStudent")
    public boolean createStudent(@RequestBody Student student) {

        boolean s  = studentService.addStudent(student);

        if(s==true) {
            System.out.println("Student Inserted !!");
            return true;

        } else {
            System.out.println("Student not Inserted !!");
            return false;

        }
    }

    @GetMapping("/getStudent/{id}")
    public Optional<Student> getStudent(@PathVariable Long id) {

        return studentService.getStudentByRollNo(id);
    }

    @GetMapping("/getAllStudents")
    public List<Student> showAllStudents(){

        return studentService.displayAllStudents();

    }

    @PutMapping("/updateStudents/{id}")
    public boolean updateStudentData(@PathVariable Long id, @RequestBody Student student) {

        boolean status = false;

        boolean result = studentService.updateStudent(id, student.getEmail());

        if(result==true) {
            System.out.println("Student Updated !!");
            return true;
        } else {
            System.out.println("Student Not Updated !!");
            return status;
        }

    }

    @DeleteMapping("/delete/{id}")
    public void deleteStudentData(@PathVariable Long id) {

        if(studentService.deleteStudent(id)==true) {
            System.out.println("Student Deleted !!");
        } else {
            System.out.println("Student Not Deleted!!");
        }
    }

    @DeleteMapping("/deleteAll")
    public void deleteAllStudentData() {
        studentService.deleteAllStudent();
    }

    @GetMapping("/displayByClassSection/{section}")
    public List<Student> displayStudentByClassSection(@PathVariable ClassSection classSection) {

        List<Student> li = studentService.findByClassSection(classSection);

        return li;

    }

    @GetMapping("/displayByName/{name}")
    public List<Student> displayStudentByName(@PathVariable String name){

        List<Student> li =  studentService.findByName(name);

        return li;

    }

    @GetMapping("/displayByRollNo/{id}")
    public Student displayStudentByRollNo(@PathVariable Integer id){
        return studentService.findByRollNo(id);
    }

    @GetMapping("/displayByEmail/{email}")
    public Student displayStudentByEmail(@PathVariable String email) {
        return studentService.findByEmail(email);
    }

}