package org.example.schoolattandencesystem.contoller;

import org.example.schoolattandencesystem.entity.Teachers;
import org.example.schoolattandencesystem.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    @PostMapping("/addTeacher")
    public boolean addDataTeacher(@RequestBody Teachers teacher) {

        boolean val = teacherService.addTeacher(teacher);

        if(val==true) {
            System.out.println("Teacher added successfully");
            return true;
        } else {
            System.out.println("Teacher not added, try again !!");
            return false;
        }
    }

    @GetMapping("/getTeachers")
    public List<Teachers> getAllTeachers() {

        List<Teachers> li = teacherService.getAllTeachers();

        return li;
    }

    @GetMapping("/getTeacherById/{id}")
    public Optional<Teachers> getTeacherById(@PathVariable Long id) {

        return teacherService.getTeachersById(id);

    }

    @DeleteMapping("/deletebyId/{id}")
    public boolean deleteTeacherById(@PathVariable Long id) {
        return teacherService.deleteTeacher(id);
    }

    @PutMapping("/updateTeacher/{id}")
    public boolean updateTeacher(@PathVariable Long id, @RequestBody Teachers teacher) {

        boolean b = teacherService.updateTeacher(id, teacher.getSubject());

        if(b==true) {
            System.out.println("Teacher updated successfully");
            return true;
        } else {
            System.out.println("Teacher not updated, try again !!");
            return false;
        }
    }

    @GetMapping("/getTeacherByName/{name}")
    public List<Teachers> findTeacherByName(@PathVariable String name) {

        List<Teachers> list =teacherService.findByName(name);

        return list;
    }

    @GetMapping("/getTeacherByEmail/{email}")
    public List<Teachers> findTeacherByEmail(@PathVariable String email) {

        List<Teachers> list =teacherService.findByEmail(email);

        return list;
    }

    @GetMapping("/getTeacherBySubject/{subject}")
    public List<Teachers> findTeacherBySubject(@PathVariable String subject) {

        List<Teachers> list =teacherService.findBySubject(subject);

        return list;
    }

}
