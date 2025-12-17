package com.example.catalog.repository;

import com.example.catalog.entity.BookCopy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import java.util.List;

public interface BookCopyRepository extends JpaRepository<BookCopy, Integer> {

    List<BookCopy> findByBook_Id(Integer bookId);

    List<BookCopy> findByStatus(String status);

    Optional<BookCopy> findFirstByBook_IdAndStatus(Integer bookId, String status);

}
