package com.example.catalog.repository;

import com.example.catalog.entity.Borrow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BorrowRepository extends JpaRepository<Borrow, Integer> {
	List<Borrow> findByUserIdOrderByIssuedOnDesc(Integer userId);
	List<Borrow> findByBookCopyId(Integer bookCopyId);
}
