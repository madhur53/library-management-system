package com.example.catalog.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "borrows")
public class Borrow {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "borrow_id")
	private Integer borrowId;

	@Column(name = "user_id", nullable = false)
	private Integer userId;

	@Column(name = "book_copy_id", nullable = false)
	private Integer bookCopyId;

	@Column(name = "book_id", nullable = false)
	private Integer bookId;

	@Column(name = "issued_on", nullable = false)
	private LocalDate issuedOn;

	@Column(name = "due_on", nullable = false)
	private LocalDate dueOn;

	@Column(name = "returned_on")
	private LocalDate returnedOn;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private BorrowStatus status = BorrowStatus.ACTIVE;

	@Column(name = "notes")
	private String notes;

	public enum BorrowStatus {
		ACTIVE, RETURNED, OVERDUE
	}

	// Getters & setters
	public Integer getBorrowId() { return borrowId; }
	public void setBorrowId(Integer borrowId) { this.borrowId = borrowId; }

	public Integer getUserId() { return userId; }
	public void setUserId(Integer userId) { this.userId = userId; }

	public Integer getBookCopyId() { return bookCopyId; }
	public void setBookCopyId(Integer bookCopyId) { this.bookCopyId = bookCopyId; }

	public Integer getBookId() { return bookId; }
	public void setBookId(Integer bookId) { this.bookId = bookId; }

	public LocalDate getIssuedOn() { return issuedOn; }
	public void setIssuedOn(LocalDate issuedOn) { this.issuedOn = issuedOn; }

	public LocalDate getDueOn() { return dueOn; }
	public void setDueOn(LocalDate dueOn) { this.dueOn = dueOn; }

	public LocalDate getReturnedOn() { return returnedOn; }
	public void setReturnedOn(LocalDate returnedOn) { this.returnedOn = returnedOn; }

	public BorrowStatus getStatus() { return status; }
	public void setStatus(BorrowStatus status) { this.status = status; }

	public String getNotes() { return notes; }
	public void setNotes(String notes) { this.notes = notes; }
}
