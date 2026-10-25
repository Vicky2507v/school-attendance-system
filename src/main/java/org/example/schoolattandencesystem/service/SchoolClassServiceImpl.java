package org.example.schoolattandencesystem.service;

import org.example.schoolattandencesystem.entity.SchoolClass;
import org.example.schoolattandencesystem.repository.SchoolClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.javapoet.ClassName;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.example.schoolattandencesystem.exception.ResourceNotFoundException;

import java.util.List;

@Service
public class SchoolClassServiceImpl implements SchoolClassService {

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Override
    public boolean createClass(SchoolClass schoolClass) {

        boolean status = false;

        SchoolClass s = schoolClassRepository.save(schoolClass);

        if(s!=null) {
            status = true;
            System.out.println("Class created successfully");
        } else {
            status = false;
            System.out.println("Class creation failed");
        }

        return status;
    }

    @Override
    public void deleteAllClass(SchoolClass schoolClass) {

        schoolClassRepository.deleteAll();

    }

    @Override
    public List<SchoolClass> getSchoolClassByClassName(String className) {
        List<SchoolClass> classes =
                schoolClassRepository.getSchoolClassByClassName(className);

        if (classes == null || classes.isEmpty()) {
            throw new ResourceNotFoundException("School class not found");
        }

        return classes;
    }

}
