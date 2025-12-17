package com.example.catalog.controller;

import com.example.catalog.entity.BookCopy;
import com.example.catalog.repository.BookCopyRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog/copies")
public class BookCopyController {

    private final BookCopyRepository copyRepo;

    public BookCopyController(BookCopyRepository copyRepo) {
        this.copyRepo = copyRepo;
    }

    @GetMapping
    public List<BookCopy> getAllCopies() {
        return copyRepo.findAll();
    }

    @GetMapping("/book/{bookId}")
    public List<BookCopy> getCopiesByBook(@PathVariable Integer bookId) {
        return copyRepo.findByBook_Id(bookId);
    }

    @GetMapping("/status/{status}")
    public List<BookCopy> getCopiesByStatus(@PathVariable String status) {
        return copyRepo.findByStatus(status.toUpperCase());
    }

    @PostMapping
    public BookCopy createCopy(@RequestBody BookCopy copy) {
        return copyRepo.save(copy);
    }

    @PutMapping("/{id}")
    public BookCopy updateCopy(@PathVariable Integer id, @RequestBody BookCopy updated) {
        BookCopy existing = copyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Copy not found"));
        existing.setBarcode(updated.getBarcode());
        existing.setStatus(updated.getStatus());
        existing.setBook(updated.getBook());
        return copyRepo.save(existing);
    }

    @DeleteMapping("/{id}")
    public void deleteCopy(@PathVariable Integer id) {
        copyRepo.deleteById(id);
    }
}
