package org.example.schoolattandencesystem.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "school_class",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"class_name", "class_section"}
                )
        }
)
public class SchoolClass {

    @Column
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true)
    private String className; // 8th, 9th, 10th, 11th, 12th ...

    @Column(nullable=false, unique=true)
    @Enumerated(EnumType.STRING)
    private ClassSection classSection;

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ClassSection getClassSection() {
        return classSection;
    }

    public void setClassSection(ClassSection classSection) {
        this.classSection = classSection;
    }

}