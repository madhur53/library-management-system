package com.example.catalog.controller;

import com.example.catalog.entity.Book;
import com.example.catalog.entity.BookCopy;
import com.example.catalog.repository.BookCopyRepository;
import com.example.catalog.repository.BookRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catalog/books")
public class BookController {

    private final BookRepository bookRepo;
    private final BookCopyRepository bookCopyRepo;

    // Note: constructor now injects BookCopyRepository as well
    public BookController(BookRepository bookRepo, BookCopyRepository bookCopyRepo) {
        this.bookRepo = bookRepo;
        this.bookCopyRepo = bookCopyRepo;
    }

    // Get all books
    @GetMapping
    public List<Book> getAllBooks() {
        return bookRepo.findAll();
    }

    // Get one book by id
    @GetMapping("/{id}")
    public Book getBook(@PathVariable Integer id) {
        return bookRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
    }

    // Search by title
    @GetMapping("/search")
    public List<Book> searchBooks(@RequestParam("q") String query) {
        return bookRepo.findByTitleContainingIgnoreCase(query);
    }

    // Filter by category name
    @GetMapping("/category/{name}")
    public List<Book> booksByCategory(@PathVariable String name) {
        return bookRepo.findByCategory_NameIgnoreCase(name);
    }

    // Create new book
    @PostMapping
    public Book createBook(@RequestBody Book book) {
        return bookRepo.save(book);
    }

    // Update book
    @PutMapping("/{id}")
    public Book updateBook(@PathVariable Integer id, @RequestBody Book updated) {
        Book existing = bookRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        existing.setTitle(updated.getTitle());
        existing.setIsbn(updated.getIsbn());
        existing.setAuthor(updated.getAuthor());
        existing.setPublisher(updated.getPublisher());
        existing.setCategory(updated.getCategory());
        existing.setPublicationYear(updated.getPublicationYear());
        existing.setShelfLocation(updated.getShelfLocation());
        return bookRepo.save(existing);
    }

    // Delete book
    @DeleteMapping("/{id}")
    public void deleteBook(@PathVariable Integer id) {
        bookRepo.deleteById(id);
    }

    // -------------------------
    // New: availability endpoint
    // GET /api/catalog/books/{id}/availability
    // -------------------------
    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Object>> getBookAvailability(@PathVariable Integer id) {
        List<BookCopy> copies = bookCopyRepo.findByBook_Id(id);
        long total = copies.size();
        long available = copies.stream()
                .filter(c -> "AVAILABLE".equalsIgnoreCase(c.getStatus()))
                .count();
        return ResponseEntity.ok(Map.of(
                "bookId", id,
                "totalCopies", total,
                "availableCopies", available
        ));
    }
}
