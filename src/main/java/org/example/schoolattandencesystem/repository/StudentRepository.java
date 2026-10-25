package org.example.schoolattandencesystem.repository;

import org.example.schoolattandencesystem.entity.ClassSection;
import org.example.schoolattandencesystem.entity.SchoolClass;
import org.example.schoolattandencesystem.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student,Long> {

    public List<Student> findBySchoolClass_ClassSection(ClassSection classSection);
    public List<Student> findByName(String name);
    public Student findByRollNo(Integer rollNo);
    public Student findByEmail(String email);
    public List<Student> findBySchoolClass_Id(Long class_id);
    public long countBySchoolClass_Id(Long classId);
}
