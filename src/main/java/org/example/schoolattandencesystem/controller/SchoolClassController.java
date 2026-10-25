package org.example.schoolattandencesystem.controller;

import org.example.schoolattandencesystem.entity.SchoolClass;
import org.example.schoolattandencesystem.service.SchoolClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SchoolClassController {

    @Autowired
    private SchoolClassService schoolClassService;

    @PostMapping("/createClass")
    public boolean createSchoolClass(@RequestBody SchoolClass schoolClass) {

        System.out.println("Received className = " + schoolClass.getClassName());

        boolean s = schoolClassService.createClass(schoolClass);

        if(s==true){
            System.out.println("School Class Created !!");
            return true;
        }
        else {
            System.out.println("School Class Creation Failed !!");
            return s;
        }
    }

    @DeleteMapping("/deleteAllSchoolClass")
    public void deleteAllSchoolClass(SchoolClass schoolClass) {
        schoolClassService.deleteAllClass(schoolClass);
    }

    @GetMapping("/displayDataByClass/{className}")
    public List<SchoolClass> getSchoolClassDataByClass(@PathVariable String className) {

        List list =  schoolClassService.getSchoolClassByClassName(className);

        return list;

    }


}
