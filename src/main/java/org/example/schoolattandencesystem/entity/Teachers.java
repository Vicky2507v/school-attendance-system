package org.example.schoolattandencesystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Table(name="teachers")
@Entity
public class Teachers {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    @Column
    private Long id;

    @Column
    @NotBlank(message = "Teacher name is required")
    private String name;

    @Column
    @Email(message = "Please provide a valid teacher email")
    @NotBlank(message="Teacher mail is required")
    private String email;

    @Column
    @NotBlank(message = "Teacher subject is required")
    private String subject;

    @Column
    @NotBlank(message = "Phone number is required")
    private String phoneNo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getPhoneNo() {
        return phoneNo;
    }

    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

}