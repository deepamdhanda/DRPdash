import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllPools, createPool, updatePool } from "../../APIs/pool";

export interface User {
  _id: string;
  name: string;
}

export interface Pool {
  _id: string;
  name: string;
  admins: User[];
  created_by: User;
  ownership: User;
  status: "active" | "inactive" | "suspended";
  createdAt?: string;
  updatedAt?: string;
  wallet_balance?: number; // Optional field for wallet balance
}

const Pools: React.FC = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [showModal, setShowModal] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [poolsData] = await Promise.all([
        getAllPools(),
      ]);
      setPools(poolsData);
    } catch (error) {
      console.error("Error loading pools or users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingPool(null);
  };

  const handleShow = () => setShowModal(true);

  const handleEdit = (pool: Pool) => {
    setEditingPool(pool);
    setShowModal(true);
  };

  const handleToggleStatus = async (pool: Pool) => {
    const newStatus = pool.status === "active" ? "inactive" : "active";
    if (
      window.confirm(`Are you sure you want to mark this pool as ${newStatus}?`)
    ) {
      try {
        await updatePool(pool._id, { status: newStatus });
        fetchInitialData();
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
      if (editingPool) {
        await updatePool(editingPool._id, formData);
      } else {
        await createPool(formData);
      }
      fetchInitialData();
      handleClose();
    } catch (error) {
      console.error("Error saving pool", error);
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row: Pool) => (
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
      cell: (row: Pool) => (
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
      name: "Wallet Balance",
      cell: (row: Pool) => (
        <span className={row?.wallet_balance && row?.wallet_balance > 1000 ? "text-success" : "text-danger"}>
          {row?.wallet_balance ? `₹${row.wallet_balance.toFixed(2)}` : "—"}
        </span>
      )
    },
    {
      name: "Created By",
      selector: (row: Pool) => row.created_by?.name || "—",
    },
    {
      name: "Ownership",
      selector: (row: Pool) => row.ownership?.name || "—",
    },
    {
      name: "Status",
      selector: (row: Pool) => row.status,
      sortable: true,
    },
    {
      name: "Created On",
      selector: (row: Pool) =>
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
      cell: (row: Pool) => (
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
        <h4>Pools</h4>
        <Button onClick={handleShow}>+ New Pool</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : pools.length === 0 ? (
        <p>No pools found.</p>
      ) : (
        <DataTable
          title="Your Pools"
          data={pools}
          columns={columns as any}
          highlightOnHover
          pagination
          paginationRowsPerPageOptions={[10, 20, 50]}
          responsive
          striped
          persistTableHead
        />
      )}

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingPool ? "Edit Pool" : "Create Pool"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Pool Name</Form.Label>
              <Form.Control
                name="name"
                defaultValue={editingPool?.name || ""}
                required
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