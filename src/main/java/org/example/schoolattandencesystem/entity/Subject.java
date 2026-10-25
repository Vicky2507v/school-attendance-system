package org.example.schoolattandencesystem.entity;

import jakarta.persistence.*;

@Entity
@Table(name="subject")
public class Subject {

    @Column
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private int id;

    @Column(nullable=false, unique=true)
    private String subjectName;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

}
