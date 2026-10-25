package org.example.schoolattandencesystem.service;

import org.example.schoolattandencesystem.entity.Subject;

import java.util.List;
import java.util.Optional;


public interface SubjectService {

    public boolean addSubject(Subject subject);
    public List<Subject> getAllSubjects();
    public Optional<Subject> getSubjectById(int id);
    public boolean updateSubject(int id, String subjectName);
    public boolean deleteSubjectById(int id);
    public void deleteAllSubjects();
}