package com.example.catalog.dto;

public class BorrowRequest {
	// Provide either memberId OR userId (the controller resolves memberId from userId)
	public Integer memberId;
	public Integer userId;

	// admin id who issues the book; optional (defaults to 1)
	public Integer issuedBy;

	// number of days to issue for (required-ish, fallback 14)
	public Integer days;

	public BorrowRequest() {}
}
