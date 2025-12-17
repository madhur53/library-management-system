package com.example.catalog.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "loans")
@Access(AccessType.FIELD)
public class Loan {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "loan_id")
	private Integer loanId;

	@Column(name = "copy_id", nullable = false)
	private Integer copyId;

	@Column(name = "member_id", nullable = false)
	private Integer memberId;

	@Column(name = "issued_by", nullable = false)
	private Integer issuedBy;

	@Column(name = "issue_date")
	private LocalDate issueDate;

	@Column(name = "due_date")
	private LocalDate dueDate;

	@Column(name = "return_date")
	private LocalDate returnDate;

	@Column(name = "fine_amount")
	private BigDecimal fineAmount;

	public Loan() {}

	// getters & setters
	public Integer getLoanId() { return loanId; }

	public Integer getCopyId() { return copyId; }
	public void setCopyId(Integer copyId) { this.copyId = copyId; }

	public Integer getMemberId() { return memberId; }
	public void setMemberId(Integer memberId) { this.memberId = memberId; }

	public Integer getIssuedBy() { return issuedBy; }
	public void setIssuedBy(Integer issuedBy) { this.issuedBy = issuedBy; }

	public LocalDate getIssueDate() { return issueDate; }
	public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

	public LocalDate getDueDate() { return dueDate; }
	public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

	public LocalDate getReturnDate() { return returnDate; }
	public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

	public BigDecimal getFineAmount() { return fineAmount; }
	public void setFineAmount(BigDecimal fineAmount) { this.fineAmount = fineAmount; }
}
