import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllFinances, createFinance, updateFinance } from "../../APIs/user/finance";

export interface User {
  _id: string;
  name: string;
}

export interface Finance {
  _id: string;
  name: string;
  admins: User[];
  created_by: User;
  ownership: User;
  status: "active" | "inactive" | "suspended";
  createdAt?: string;
  updatedAt?: string;
}

const Finances: React.FC = () => {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFinance, setEditingFinance] = useState<Finance | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchFinances();
    fetchUsers();
  }, []);
  console.log(users);

  const fetchFinances = async () => {
    try {
      const data = await getAllFinances();
      setFinances(data);
    } catch (error) {
      console.error("Error fetching finances", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/users"); // You can change this as per your user API
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingFinance(null);
  };

  const handleShow = () => setShowModal(true);

  const handleEdit = (finance: Finance) => {
    setEditingFinance(finance);
    setShowModal(true);
  };

  const handleToggleStatus = async (finance: Finance) => {
    const newStatus = finance.status === "active" ? "inactive" : "active";
    if (
      window.confirm(`Are you sure you want to mark this finance as ${newStatus}?`)
    ) {
      try {
        await updateFinance(finance._id, { status: newStatus });
        fetchFinances();
      } catch (error) {
        console.error("Error updating status", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as typeof e.target & {
      name: { value: string };
    };

    const formData = {
      name: form.name.value.trim(),
    };

    try {
      if (editingFinance) {
        await updateFinance(editingFinance._id, formData);
      } else {
        await createFinance(formData);
      }
      fetchFinances();
      handleClose();
    } catch (error) {
      console.error("Error saving finance", error);
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row: Finance) => (
        <>
          {row.status === "active"
            ? "🟢"
            : row.status === "inactive"
              ? "🔴"
              : "❌"}{" "}
          <strong>{row.name}</strong>
        </>
      ),
      sortable: true,
    },
    {
      name: "Admins",
      cell: (row: Finance) => (
        <div>
          {row.admins?.map((admin) => (
            <Badge bg="secondary" className="me-1" key={admin._id}>
              {admin.name}
            </Badge>
          ))}
        </div>
      ),
      wrap: true,
    },
    {
      name: "Created By",
      selector: (row: Finance) => row.created_by?.name || "—",
    },
    {
      name: "Ownership",
      selector: (row: Finance) => row.ownership?.name || "—",
    },
    {
      name: "Status",
      selector: (row: Finance) => row.status,
      sortable: true,
    },
    {
      name: "Created On",
      selector: (row: Finance) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          : "—",
    },
    {
      name: "Actions",
      cell: (row: Finance) => (
        <>
          <Button
            variant="outline-primary"
            size="sm"
            className="me-2"
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            variant={
              row.status === "active" ? "outline-danger" : "outline-success"
            }
            size="sm"
            onClick={() => handleToggleStatus(row)}
          >
            {row.status === "active" ? "Deactivate" : "Activate"}
          </Button>
        </>
      ),
      width: "180px",
    },
  ];

  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Finances</h4>
        <Button onClick={handleShow}>+ New Finance</Button>
      </div>

      <DataTable
        title="Your Finances"
        data={finances}
        columns={columns as any}
        highlightOnHover
        pagination
        paginationRowsPerPageOptions={[10, 20, 50, 100, 200, 500, 1000]}
        responsive
        striped
        persistTableHead
        progressPending={finances.length === 0}
      />

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingFinance ? "Edit Finance" : "Create Finance"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Finance Name</Form.Label>
              <Form.Control
                name="name"
                defaultValue={editingFinance?.name || ""}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingFinance ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export { Finances };
