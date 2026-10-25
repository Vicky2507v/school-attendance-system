package org.example.schoolattandencesystem.service;

import org.example.schoolattandencesystem.entity.Teachers;
import org.example.schoolattandencesystem.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.example.schoolattandencesystem.exception.ResourceNotFoundException;
import java.util.List;
import java.util.Optional;

@Service
public class TeacherServiceImpl implements TeacherService {

    @Autowired
    private TeacherRepository teacherRepository;

    @Override
    public boolean addTeacher(Teachers teacher) {

        Teachers t = teacherRepository.save(teacher);

        if(t != null) {
            System.out.println("Teacher added successfully");
            return true;
        }
        else {
            System.out.println("Teacher not added, try again");
            return false;
        }

    }

    @Override
    public List<Teachers> getAllTeachers() {

        List<Teachers> li = teacherRepository.findAll();

        return li;

    }

    @Override
    public Optional<Teachers> getTeachersById(Long id) {

        return teacherRepository.findById(id);

    }

    @Override
    public boolean deleteTeacher(Long id) {
        if (!teacherRepository.existsById(id)) {
            throw new ResourceNotFoundException("Teacher not found");
        }

        teacherRepository.deleteById(id);
        return true;
    }

    @Override
    public boolean updateTeacher(Long id, String subject) {
        Teachers teacher = teacherRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Teacher not found"));

        teacher.setSubject(subject);
        teacherRepository.save(teacher);

        return true;
    }

    public List<Teachers> findByName(@PathVariable String name) {
        List<Teachers> li =  teacherRepository.findByName(name);

        return li;
    }

    public List<Teachers> findByEmail(@PathVariable String email) {
        List<Teachers> li =  teacherRepository.findByEmail(email);
        return li;
    }

    public List<Teachers> findBySubject(String subject) {
        List<Teachers> li =  teacherRepository.findBySubject(subject);
        return li;
    }

}
