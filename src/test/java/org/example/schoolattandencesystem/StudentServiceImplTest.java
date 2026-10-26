package org.example.schoolattandencesystem.service;

import org.example.schoolattandencesystem.entity.Student;
import org.example.schoolattandencesystem.repository.SchoolClassRepository;
import org.example.schoolattandencesystem.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentServiceImplTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private SchoolClassRepository schoolClassRepository;

    @InjectMocks
    private StudentServiceImpl studentService;

    @Test
    void findByRollNo_shouldReturnStudent_whenStudentExists() {
        // Arrange
        Integer rollNo = 101;
        Student expectedStudent = new Student();

        when(studentRepository.findByRollNo(rollNo))
                .thenReturn(expectedStudent);

        // Act
        Student actualStudent = studentService.findByRollNo(rollNo);

        // Assert
        assertSame(expectedStudent, actualStudent);
        verify(studentRepository).findByRollNo(rollNo);
    }
}
