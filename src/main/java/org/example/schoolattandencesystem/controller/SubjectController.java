package org.example.schoolattandencesystem.contoller;

import org.example.schoolattandencesystem.entity.Subject;
import org.example.schoolattandencesystem.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @PostMapping("/addSubject")
    public boolean addDataSubject(@RequestBody Subject subject) {

        boolean subject1 = subjectService.addSubject(subject);

        if(subject1==true){
            return true;
        } else{
            return false;
        }

    }

    @GetMapping("/getAllSubject")
    public List<Subject> findAllSubject(){

        List<Subject> li = subjectService.getAllSubjects();

        return li;
    }

    @GetMapping("/getSubjectById/{id}")
    public Optional<Subject> getSubjectById(@PathVariable int id) {

        return subjectService.getSubjectById(id);

    }

    @PutMapping("/updateSubject/{id}")
    public boolean updateSubjectById(@PathVariable int id, @RequestBody Subject subject) {

        boolean status = false;

        boolean sub =  subjectService.updateSubject(id, subject.getSubjectName());

        if(sub==true){
            status = true;
            System.out.println("Updated Subject");
        } else {
            status = false;
        }
        return status;

    }

    @DeleteMapping("/deleteSubject/{id}")
    public void deleteSubjectById(int id) {
        subjectService.deleteSubjectById(id);
    }

    @DeleteMapping("/deleteAllSubject")
    public void deleteAllSubject() {
        subjectService.deleteAllSubjects();
    }

}