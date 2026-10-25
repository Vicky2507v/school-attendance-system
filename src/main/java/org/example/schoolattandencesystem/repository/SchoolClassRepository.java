package org.example.schoolattandencesystem.repository;

import org.example.schoolattandencesystem.entity.ClassSection;
import org.example.schoolattandencesystem.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass,Long> {

    public List<SchoolClass> getSchoolClassByClassName(String className);
    Optional<SchoolClass> findByClassNameAndClassSection(
            String className,
            ClassSection classSection
    );
}