package com.example.catalog.controller;

import com.example.catalog.entity.BookCopy;
import com.example.catalog.entity.Borrow;
import com.example.catalog.entity.Borrow.BorrowStatus;
import com.example.catalog.repository.BookCopyRepository;
import com.example.catalog.repository.BorrowRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/catalog")
public class BorrowController {

	private final Logger log = LoggerFactory.getLogger(BorrowController.class);
	private final BookCopyRepository copyRepo;
	private final BorrowRepository borrowRepo;

	public BorrowController(BookCopyRepository copyRepo, BorrowRepository borrowRepo) {
		this.copyRepo = copyRepo;
		this.borrowRepo = borrowRepo;
	}

	private Integer intOrNull(JsonNode node) {
		if (node == null || node.isNull()) return null;
		if (node.isInt() || node.isLong()) return node.asInt();
		if (node.isTextual()) {
			try { return Integer.valueOf(node.asText()); } catch (NumberFormatException ignored) {}
		}
		return null;
	}

	private Integer resolveUserIdFromNode(JsonNode root) {
		if (root == null || root.isNull()) return null;
		if (root.has("userId")) { Integer v=intOrNull(root.get("userId")); if (v!=null) return v; }
		if (root.has("user_id")) { Integer v=intOrNull(root.get("user_id")); if (v!=null) return v; }
		if (root.has("id")) { Integer v=intOrNull(root.get("id")); if (v!=null) return v; }
		JsonNode nested = root.get("user");
		if (nested==null) nested = root.get("userInfo");
		if (nested!=null && nested.isObject()) {
			Integer v=intOrNull(nested.get("userId")); if (v!=null) return v;
			v=intOrNull(nested.get("id")); if (v!=null) return v;
			v=intOrNull(nested.get("user_id")); if (v!=null) return v;
		}
		return null;
	}

	@PostMapping("/borrow/book")
	@Transactional
	public ResponseEntity<?> borrowByBook(@RequestBody JsonNode body) {
		try {
			log.info("borrowByBook payload: {}", body == null ? "{}" : body.toString());
			Integer bookId = intOrNull(body.get("bookId"));
			Integer userId = resolveUserIdFromNode(body);
			Integer days = intOrNull(body.get("days"));
			if (bookId == null) return ResponseEntity.badRequest().body(Map.of("error","bookId required"));
			if (userId == null) return ResponseEntity.badRequest().body(Map.of("error","userId required"));

			Optional<BookCopy> opt = copyRepo.findFirstByBook_IdAndStatus(bookId, "AVAILABLE");
			if (opt.isEmpty()) return ResponseEntity.status(409).body(Map.of("error","No available copy"));

			BookCopy copy = opt.get();
			copy.setStatus("ISSUED");
			copyRepo.save(copy);

			LocalDate issuedOn = LocalDate.now();
			int borrowDays = (days != null && days > 0) ? days : 14;
			LocalDate dueOn = issuedOn.plusDays(borrowDays);

			Borrow b = new Borrow();
			b.setUserId(userId);
			b.setBookCopyId(copy.getId());
			b.setBookId(bookId);
			b.setIssuedOn(issuedOn);
			b.setDueOn(dueOn);
			b.setStatus(BorrowStatus.ACTIVE);
			borrowRepo.save(b);

			return ResponseEntity.ok(Map.of(
					"status","issued",
					"bookCopyId", copy.getId(),
					"bookId", bookId,
					"borrowId", b.getBorrowId(),
					"issuedOn", issuedOn.toString(),
					"dueOn", dueOn.toString()
			));
		} catch (Exception ex) {
			log.error("Error in borrowByBook", ex);
			return ResponseEntity.status(500).body(Map.of("error","server error", "detail", ex.toString()));
		}
	}

	@PostMapping("/borrow")
	@Transactional
	public ResponseEntity<?> borrowSpecific(@RequestBody JsonNode body) {
		try {
			log.info("borrowSpecific payload: {}", body == null ? "{}" : body.toString());
			Integer copyId = intOrNull(body.get("bookCopyId"));
			Integer userId = resolveUserIdFromNode(body);
			Integer days = intOrNull(body.get("days"));
			if (copyId == null) return ResponseEntity.badRequest().body(Map.of("error","bookCopyId required"));
			if (userId == null) return ResponseEntity.badRequest().body(Map.of("error","userId required"));

			Optional<BookCopy> opt = copyRepo.findById(copyId);
			if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error","Copy not found"));

			BookCopy copy = opt.get();
			if (!"AVAILABLE".equalsIgnoreCase(copy.getStatus())) {
				return ResponseEntity.status(409).body(Map.of("error","Not available"));
			}

			copy.setStatus("ISSUED");
			copyRepo.save(copy);

			LocalDate issuedOn = LocalDate.now();
			int borrowDays = (days != null && days > 0) ? days : 14;
			LocalDate dueOn = issuedOn.plusDays(borrowDays);

			Borrow b = new Borrow();
			b.setUserId(userId);
			b.setBookCopyId(copy.getId());
			// if BookCopy entity has getBook() adjust accordingly; else pass copy.getBookId if mapped
			b.setBookId(copy.getBook() != null ? copy.getBook().getId() : null);
			b.setIssuedOn(issuedOn);
			b.setDueOn(dueOn);
			b.setStatus(BorrowStatus.ACTIVE);
			borrowRepo.save(b);

			return ResponseEntity.ok(Map.of(
					"status","issued",
					"bookCopyId", copy.getId(),
					"borrowId", b.getBorrowId(),
					"issuedOn", issuedOn.toString(),
					"dueOn", dueOn.toString()
			));
		} catch (Exception ex) {
			log.error("Error in borrowSpecific", ex);
			return ResponseEntity.status(500).body(Map.of("error","server error", "detail", ex.toString()));
		}
	}

	@PostMapping("/return")
	@Transactional
	public ResponseEntity<?> returnCopy(@RequestBody JsonNode body) {
		try {
			log.info("return payload: {}", body == null ? "{}" : body.toString());
			Integer copyId = intOrNull(body.get("bookCopyId"));
			Integer borrowId = intOrNull(body.get("borrowId"));
			if (copyId == null && borrowId == null) return ResponseEntity.badRequest().body(Map.of("error","bookCopyId or borrowId required"));

			Optional<BookCopy> copyOpt = copyId != null ? copyRepo.findById(copyId) : Optional.empty();
			if (copyId != null && copyOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error","Copy not found"));

			BookCopy copy = copyOpt.orElse(null);

			Borrow borrow = null;
			if (borrowId != null) {
				borrow = borrowRepo.findById(borrowId).orElse(null);
			} else if (copy != null) {
				List<Borrow> list = borrowRepo.findByBookCopyId(copy.getId());
				if (!list.isEmpty()) {
					for (int i=list.size()-1;i>=0;i--) {
						Borrow b = list.get(i);
						if (b.getStatus() == BorrowStatus.ACTIVE) { borrow = b; break; }
					}
				}
			}

			if (borrow == null) {
				if (copy != null) {
					copy.setStatus("AVAILABLE");
					copyRepo.save(copy);
				}
				return ResponseEntity.ok(Map.of("status","returned","note","no borrow record found; copy marked AVAILABLE"));
			}

			borrow.setReturnedOn(LocalDate.now());
			borrow.setStatus(BorrowStatus.RETURNED);
			borrowRepo.save(borrow);

			if (copy != null) {
				copy.setStatus("AVAILABLE");
				copyRepo.save(copy);
			} else {
				Optional<BookCopy> c2 = copyRepo.findById(borrow.getBookCopyId());
				c2.ifPresent(c -> { c.setStatus("AVAILABLE"); copyRepo.save(c); });
			}

			return ResponseEntity.ok(Map.of("status","returned","borrowId",borrow.getBorrowId(),"returnedOn",borrow.getReturnedOn().toString()));
		} catch (Exception ex) {
			log.error("Error in returnCopy", ex);
			return ResponseEntity.status(500).body(Map.of("error","server error", "detail", ex.toString()));
		}
	}

	@GetMapping("/borrows/user/{userId}")
	public ResponseEntity<?> getBorrowHistory(@PathVariable Integer userId) {
		try {
			List<Borrow> list = borrowRepo.findByUserIdOrderByIssuedOnDesc(userId);
			return ResponseEntity.ok(list);
		} catch (Exception ex) {
			log.error("Error fetching borrow history for user "+userId, ex);
			return ResponseEntity.status(500).body(Map.of("error","server error"));
		}
	}
}
