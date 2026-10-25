package org.example.schoolattandencesystem.repository;

import org.example.schoolattandencesystem.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.example.schoolattandencesystem.entity.Subject;

import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {



}
