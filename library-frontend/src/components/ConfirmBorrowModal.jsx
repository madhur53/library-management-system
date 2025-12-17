import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function ConfirmBorrowModal({ open, onClose, book, defaultDays = 14, maxDays = 28, onConfirm }) {
  const [days, setDays] = useState(defaultDays);

  useEffect(()=> {
    setDays(defaultDays);
  }, [defaultDays, open]);

  function confirm() {
    onConfirm(Number(days));
  }

  return (
    <Modal show={open} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Borrow: {book?.title ?? `#${book?.bookId ?? book?.id}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Loan duration (days)</Form.Label>
          <Form.Control type="number" min={1} max={maxDays} value={days} onChange={e=>setDays(e.target.value)} />
          <Form.Text className="text-muted">Default {defaultDays} days, maximum {maxDays} days.</Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={confirm}>Confirm Borrow</Button>
      </Modal.Footer>
    </Modal>
  );
}
