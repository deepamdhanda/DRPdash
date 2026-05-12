import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

export interface SchedulePickupModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (date: Date) => void;
}

export const SchedulePickupModal: React.FC<SchedulePickupModalProps> = ({
  show,
  onHide,
  onSubmit,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Calculate min (today) and max (today + 3 days) dynamically
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 3);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  // Reset the input whenever the modal is opened/closed
  useEffect(() => {
    if (show) setSelectedDate("");
  }, [show]);

  const handleSubmit = () => {
    if (selectedDate) {
      onSubmit(new Date(selectedDate));
    }
  };

  return (
    <>
      <style>{`
        /* Modern SaaS Aesthetics */
        .saas-modal .modal-content {
          border-radius: 16px;
          border: none;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }
        .saas-header {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 1.25rem 1.5rem;
        }
        .saas-input {
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          padding: 0.6rem 0.75rem;
          font-size: 0.95rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .saas-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          outline: none;
        }
        .saas-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .btn-saas-primary {
          background-color: #0f172a;
          color: white;
          border-radius: 8px;
          font-weight: 500;
          padding: 0.5rem 1.25rem;
          border: none;
          transition: background-color 0.2s;
        }
        .btn-saas-primary:hover {
          background-color: #334155;
          color: white;
        }
        .btn-saas-primary:disabled {
          background-color: #94a3b8;
          cursor: not-allowed;
        }
        .form-helper-text {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 0.5rem;
        }
      `}</style>

      <Modal
        show={show}
        onHide={onHide}
        size="sm"
        centered
        className="saas-modal"
      >
        <div className="saas-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>
            Schedule Pickup
          </h6>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onHide}
          ></button>
        </div>

        <Modal.Body className="p-4">
          <Form.Group>
            <Form.Label className="saas-label">Select Date</Form.Label>
            <Form.Control
              className="saas-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
              max={maxDate}
            />
            <div className="form-helper-text">
              Pickups can be scheduled up to 3 days in advance.
            </div>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer
          className="border-top p-3"
          style={{ backgroundColor: "#f8fafc" }}
        >
          <Button
            variant="link"
            className="text-decoration-none text-muted fw-medium"
            onClick={onHide}
          >
            Cancel
          </Button>
          <button
            className="btn-saas-primary"
            onClick={handleSubmit}
            disabled={!selectedDate}
          >
            Confirm Date
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
