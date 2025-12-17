package com.example.catalog.repository;

import com.example.catalog.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Integer> {

    List<Book> findByTitleContainingIgnoreCase(String title);

    List<Book> findByCategory_NameIgnoreCase(String categoryName);
}
