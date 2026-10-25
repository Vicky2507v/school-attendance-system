package org.example.schoolattandencesystem.repository;

import org.example.schoolattandencesystem.entity.Teachers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<Teachers, Long> {

    public List<Teachers> findByName(String name);
    public List<Teachers> findByEmail(String email);
    public List<Teachers> findBySubject(String subject);

}
