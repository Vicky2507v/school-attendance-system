package org.example.schoolattandencesystem.service;

import org.example.schoolattandencesystem.entity.SchoolClass;
import org.springframework.javapoet.ClassName;

import java.util.List;


public interface SchoolClassService {

    public boolean createClass(SchoolClass schoolClass);
    public void deleteAllClass(SchoolClass schoolClass);
    public List<SchoolClass> getSchoolClassByClassName(String className);

}
