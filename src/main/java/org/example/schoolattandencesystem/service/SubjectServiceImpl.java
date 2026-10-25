package org.example.schoolattandencesystem.service;

import org.example.schoolattandencesystem.entity.Subject;
import org.example.schoolattandencesystem.repository.SchoolClassRepository;
import org.example.schoolattandencesystem.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Optional;

@Service
public class SubjectServiceImpl implements SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Override
    public boolean addSubject(Subject subject) {

        boolean result = false;

        Subject subject1 = subjectRepository.save(subject);

        if(subject1 != null){
            result = true;
            System.out.println("Subject added successfully");
        } else {
            result = false;
            System.out.println("Subject not added successfully");
        }

        return result;
    }

    @Override
    public List<Subject> getAllSubjects() {

        List<Subject> list = subjectRepository.findAll();

        return list;

    }

    @Override
    public Optional<Subject> getSubjectById(int id) {

        return subjectRepository.findById(id);

    }

    @Override
    public boolean updateSubject(@PathVariable int id, @RequestBody String subjectName) {

        boolean result = false;

        Subject subject = subjectRepository.findById(id).orElse(null);

        if(subject == null) {
            System.out.println("Subject not found");
            return false;
        }
        else {
            subject.setSubjectName(subjectName);
            subjectRepository.save(subject);
            result = true;
            System.out.println("Subject updated successfully");

        }

        return result;
    }

    @Override
    public boolean deleteSubjectById(@PathVariable int id) {

        if(subjectRepository.existsById(id)) {
            subjectRepository.deleteById(id);
            System.out.println("Subject deleted successfully");
            return true;

        } else {
            System.out.println("Subject not deleted");
            return false;
        }

    }

    @Override
    public void deleteAllSubjects() {

        subjectRepository.deleteAll();

    }


}
