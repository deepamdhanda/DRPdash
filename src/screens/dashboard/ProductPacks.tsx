import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllProductPacks, createProductPack, updateProductPack } from "../../APIs/productPack";

export interface User {
  _id: string;
  name: string;
}

export interface ProductPack {
  _id: string;
  name: string;
  length: number;
  breadth: number;
  height: number;
  weight: number;
  stock: number;
  packing_cost: number;
  volumetric_weight: number;
  created_by: User;
  status: "active" | "inactive" | "suspended";
  createdAt?: string;
  updatedAt?: string;
}

const ProductPacks: React.FC = () => {
  const [product_packs, setProductPacks] = useState<ProductPack[]>([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [showModal, setShowModal] = useState(false);
  const [editingProductPack, setEditingProductPack] = useState<ProductPack | null>(null);
  const [dimensions, setDimensions] = useState({
    length: 0,
    breadth: 0,
    height: 0,
  });
  const [volumetricWeight, setVolumetricWeight] = useState<number>(0);
  useEffect(() => {
    // Recalculate volumetric weight whenever dimensions change
    const { length, breadth, height } = dimensions;
    const calculatedVolumetricWeight = (length * breadth * height) / 5000;
    setVolumetricWeight(calculatedVolumetricWeight * 1000);
  }, [dimensions]);


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [product_packsData] = await Promise.all([
        getAllProductPacks(),
      ]);
      setProductPacks(product_packsData);
    } catch (error) {
      console.error("Error loading product_packs or users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingProductPack(null);
  };

  const handleShow = () => setShowModal(true);

  const handleDimensionChange = (field: "length" | "breadth" | "height", value: number) => {
    setDimensions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleEdit = (product_pack: ProductPack) => {
    setEditingProductPack(product_pack);
    setShowModal(true);
  };

  const handleToggleStatus = async (product_pack: ProductPack) => {
    const newStatus = product_pack.status === "active" ? "inactive" : "active";
    if (
      window.confirm(`Are you sure you want to mark this product pack as ${newStatus}?`)
    ) {
      try {
        await updateProductPack(product_pack._id, { status: newStatus });
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
      weight: { value: number };
      length: { value: number };
      breadth: { value: number };
      height: { value: number };
      stock: { value: number };
      packing_cost: { value: number };
      volumetric_weight: { value: number };
    };

    const formData = {
      name: form.name.value.trim(),
      weight: form.weight.value,
      length: form.length.value,
      breadth: form.breadth.value,
      height: form.height.value,
      stock: form.stock.value,
      packing_cost: form.packing_cost.value,
      volumetric_weight: form.volumetric_weight.value,
    };

    try {
      if (editingProductPack) {
        await updateProductPack(editingProductPack._id, formData);
      } else {
        await createProductPack(formData);
      }
      fetchInitialData();
      handleClose();
    } catch (error) {
      console.error("Error saving product pack", error);
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row: ProductPack) => (
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
      name: "Created By",
      selector: (row: ProductPack) => row.created_by?.name || "—",
    },
    {
      name: "Status",
      selector: (row: ProductPack) => row.status,
      sortable: true,
    },
    {
      name: "Created On",
      selector: (row: ProductPack) =>
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
      cell: (row: ProductPack) => (
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
        <h4>Product Packs</h4>
        <Button onClick={handleShow}>+ New Product Pack</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : product_packs.length === 0 ? (
        <p>No product packs found.</p>
      ) : (
        <DataTable
          title="Your Product Packs"
          data={product_packs}
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
          <Modal.Title>{editingProductPack ? "Edit ProductPack" : "Create ProductPack"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                defaultValue={editingProductPack?.name || ""}
                required
              />
            </Form.Group>
            <div className="mb-2 row">
              <Form.Group className="mb-2 col-6">
                <Form.Label>Weight (gm)</Form.Label>
                <Form.Control
                  name="weight"
                  type="number"
                  defaultValue={editingProductPack?.weight || ""}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2 col-6">
                <Form.Label>Volumetric Weight (gm)</Form.Label>
                <Form.Control
                  name="volumetric_weight"
                  disabled
                  type="number"
                  step={1}
                  value={volumetricWeight.toFixed(2)}
                  required
                />
              </Form.Group>
            </div>
            <div className="mb-2 row">
              <Form.Group className="mb-2 col-4">
                <Form.Label>Length (cm)</Form.Label>
                <Form.Control
                  name="length"
                  type="number"
                  value={dimensions.length}
                  onChange={(e) =>
                    handleDimensionChange("length", Number(e.target.value))
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2 col-4">
                <Form.Label>Breadth (cm)</Form.Label>
                <Form.Control
                  name="breadth"
                  type="number"
                  value={dimensions.breadth}
                  onChange={(e) =>
                    handleDimensionChange("breadth", Number(e.target.value))
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2 col-4">
                <Form.Label>Height (cm)</Form.Label>
                <Form.Control
                  name="height"
                  type="number"
                  value={dimensions.height}
                  onChange={(e) =>
                    handleDimensionChange("height", Number(e.target.value))
                  }
                  required
                />
              </Form.Group>
            </div>
            <div className="mb-2 row">
              <Form.Group className="mb-2 col-6">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  name="stock"
                  type="number"
                  step={1}
                  defaultValue={editingProductPack?.stock || ""}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2 col-6">
                <Form.Label>Cost per peice</Form.Label>
                <Form.Control
                  name="packing_cost"
                  type="number"
                  defaultValue={editingProductPack?.packing_cost || ""}
                  required
                />
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProductPack ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export { ProductPacks };