import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";

interface Pool {
  id: string;
  name: string;
  description: string;
}

const Pools: React.FC = () => {
  const [pools, setPools] = useState<Pool[]>([
    { id: "1", name: "Amazon Pool", description: "Handles Amazon orders" },
    { id: "2", name: "Shopify Pool", description: "Manages Shopify products" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);

  const handleClose = () => {
    setShowModal(false);
    setEditingPool(null);
  };

  const handleShow = () => setShowModal(true);

  const handleEdit = (pool: Pool) => {
    setEditingPool(pool);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as typeof e.target & {
      name: { value: string };
      description: { value: string };
    };

    const newPool: Pool = {
      id: editingPool?.id || new Date().toISOString(),
      name: form.name.value,
      description: form.description.value,
    };

    if (editingPool) {
      setPools((prev) =>
        prev.map((p) => (p.id === editingPool.id ? newPool : p))
      );
    } else {
      setPools((prev) => [...prev, newPool]);
    }

    handleClose();
  };

  const columns = [
    { name: "Name", selector: (row: Pool) => row.name, sortable: true },
    { name: "Description", selector: (row: Pool) => row.description },
    {
      name: "Actions",
      cell: (row: Pool) => (
        <Button variant="outline-primary" size="sm" onClick={() => handleEdit(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Your Pools</h4>
        <Button onClick={handleShow}>Create New</Button>
      </div>

      <DataTable columns={columns} data={pools} pagination highlightOnHover />

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingPool ? "Edit Pool" : "Create Pool"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Pool Name</Form.Label>
              <Form.Control
                name="name"
                defaultValue={editingPool?.name || ""}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                name="description"
                defaultValue={editingPool?.description || ""}
                as="textarea"
                rows={3}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingPool ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export { Pools };
