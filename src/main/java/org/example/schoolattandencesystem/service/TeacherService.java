package org.example.schoolattandencesystem.service;

import org.example.schoolattandencesystem.entity.Teachers;

import java.util.List;
import java.util.Optional;

public interface TeacherService {

    public boolean addTeacher(Teachers teacher);
    public List<Teachers> getAllTeachers();
    public Optional<Teachers> getTeachersById(Long id);
    public boolean deleteTeacher(Long id);
    public boolean updateTeacher(Long id, String subject);
    public List<Teachers> findByName(String name);
    public List<Teachers> findByEmail(String email);
    public List<Teachers> findBySubject(String subject);
}
