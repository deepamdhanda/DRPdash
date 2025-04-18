// Keep all existing imports
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { createProduct, getAllProducts, updateProduct } from "../../APIs/product";
import { getAllWarehouses } from "../../APIs/warehouse";

interface ProductAttribute {
  key: string;
  value: string;
}

interface Warehouse {
  _id: string;
  name: string;
}

interface WarehouseStock {
  warehouse: string;
  stock: number;
}

export interface Product {
  _id?: string;
  product_name: string;
  product_description: string;
  product_weight: number;
  product_attributes: ProductAttribute[];
  product_image: string;
  warehouse: WarehouseStock[];
  created_by?: any;
  ownership?: any;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [productData, warehouseData] = await Promise.all([
        getAllProducts(),
        getAllWarehouses(),
      ]);
      setProducts(productData);
      setWarehouses(warehouseData);
    } catch (error) {
      console.error("Error loading products or warehouses", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingProduct(null);
    setProductAttributes([]);
    setImagePreview("");
    setWarehouseStocks([]);
  };

  const handleShow = () => {
    const defaultStocks = warehouses.map((wh) => ({
      warehouse: wh._id,
      stock: 0,
    }));
    setWarehouseStocks(defaultStocks);
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductAttributes(product.product_attributes || []);
    setImagePreview(product.product_image);

    // Map the warehouse stocks correctly
    const mappedStocks = warehouses.map((wh) => {
      const existingStock = product.warehouse.find((w) => w.warehouse === wh._id);
      return {
        warehouse: wh._id, // Keep the warehouse ID
        stock: existingStock ? existingStock.stock : 0, // Use existing stock or default to 0
        name: wh.name, // Preserve the warehouse name
      };
    });

    setWarehouseStocks(mappedStocks);
    setShowModal(true);
  };


  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === "active" ? "inactive" : "active";
    if (window.confirm(`Are you sure you want to mark this product as ${newStatus}?`)) {
      try {
        await updateProduct(product._id, { status: newStatus });
        fetchInitialData();
      } catch (error) {
        console.error("Error updating status", error);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttributeChange = (index: number, field: "key" | "value", value: string) => {
    const updated = [...productAttributes];
    updated[index][field] = value;
    setProductAttributes(updated);
  };

  const addAttribute = () => {
    setProductAttributes([...productAttributes, { key: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    const updated = [...productAttributes];
    updated.splice(index, 1);
    setProductAttributes(updated);
  };

  const handleWarehouseStockChange = (warehouseId: string, stock: number) => {
    const updated = [...warehouseStocks];
    const idx = updated.findIndex((w) => w.warehouse === warehouseId);
    if (idx !== -1) {
      updated[idx].stock = stock; // Update the stock for the existing warehouse
    }
    setWarehouseStocks(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const newProduct: Product = {
      product_name: (form.elements.namedItem("product_name") as HTMLInputElement).value,
      product_description: (form.elements.namedItem("product_description") as HTMLInputElement).value,
      product_weight: parseFloat((form.elements.namedItem("product_weight") as HTMLInputElement).value),
      product_attributes: productAttributes,
      product_image: imagePreview || undefined,
      warehouse: warehouseStocks
        .filter((ws) => ws.stock > 0) // Only include warehouses with stock > 0
        .map((ws) => ({
          warehouse: ws.warehouse, // Keep the warehouse ID
          stock: ws.stock, // Keep the stock value
        })),
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id!, newProduct);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? { ...newProduct, _id: editingProduct._id } : p))
        );
      } else {
        const created = await createProduct(newProduct);
        setProducts((prev) => [...prev, created]);
      }
      handleClose();
    } catch (err) {
      console.error("Error saving product", err);
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row: Product) => row.product_name,
      sortable: true,
      cell: (row: Product) => (
        <div className="d-flex align-items-center" style={{ gap: "12px" }}>
          {row.status === "active" ? "🟢" : row.status === "inactive" ? "🔴" : "❌"}{" "}
          <img
            src={row.product_image}
            alt={row.product_name}
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          />
          <div style={{ fontWeight: 600, fontSize: "14px", lineHeight: "1.2" }}>
            {row.product_name}
          </div>
        </div>
      ),
    },

    { name: "Description", selector: (row: Product) => row.product_description },
    { name: "Weight", selector: (row: Product) => row.product_weight + " kg" },
    {
      name: "Attributes",
      cell: (row: Product) => (
        <div>
          {row.product_attributes.map((attr, idx) => (
            <div key={idx}>
              <strong>{attr.key}:</strong> {attr.value}
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Stock",
      cell: (row: Product) => (
        <div>
          {row.warehouse.map((wh, i) => {
            // const warehouseName = warehouses.find((w) => w._id === wh.warehouse)?.name;
            return (
              <div key={i}>
                <strong>{wh.warehouse?.name}:</strong> {wh.stock}
              </div>
            );
          })}
        </div>
      ),
    }, {
      name: "Created On",
      selector: (row: Product) =>
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
      cell: (row: Product) => (
        <>
          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button
            variant={row.status === "active" ? "outline-danger" : "outline-success"}
            size="sm"
            onClick={() => handleToggleStatus(row)}
          >
            {row.status === "active" ? "Deactivate" : "Activate"}
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Products</h4>
        <Button onClick={handleShow}>Create New</Button>
      </div>

      <DataTable
        title="Your Product"
        highlightOnHover
        columns={columns}
        data={products}
        pagination
        striped
        persistTableHead
        responsive
        customStyles={{
          rows: {
            style: {
              minHeight: '72px', // Adjust row height for better readability
            },
          },
          headCells: {
            style: {
              fontSize: '14px',
              fontWeight: 'bold',
              textAlign: 'left',
              whiteSpace: 'normal', // Allow text to wrap
              wordWrap: 'break-word', // Break long words
            },
          },
          cells: {
            style: {
              fontSize: '13px',
              whiteSpace: 'normal', // Allow text to wrap
              wordWrap: 'break-word', // Break long words
            },
          },
        }}
        progressPending={products.length === 0}
      />

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? "Edit Product" : "Create Product"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control name="product_name" defaultValue={editingProduct?.product_name || ""} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    name="product_description"
                    as="textarea"
                    rows={3}
                    defaultValue={editingProduct?.product_description || ""}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Weight (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="product_weight"
                    defaultValue={editingProduct?.product_weight || ""}
                    required
                    disabled={!!editingProduct}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Warehouse Stock</Form.Label>
                  {warehouses.map((wh) => (
                    <Row className="mb-2" key={wh._id}>
                      <Col>{wh.name}</Col>
                      <Col>
                        <Form.Control
                          type="number"
                          placeholder="Stock"
                          value={warehouseStocks.find((w) => w.warehouse === wh._id)?.stock?.toString() || ""}
                          onChange={(e) => handleWarehouseStockChange(wh._id, parseInt(e.target.value) || 0)}
                        />
                      </Col>
                    </Row>
                  ))}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Image</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                  {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-100 rounded shadow-sm" />}
                </Form.Group>

                <Form.Label>Attributes</Form.Label>
                {productAttributes.map((attr, index) => (
                  <Row key={index} className="mb-2">
                    <Col>
                      <Form.Control
                        placeholder="Key"
                        value={attr.key}
                        onChange={(e) => handleAttributeChange(index, "key", e.target.value)}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        placeholder="Value"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                      />
                    </Col>
                    <Col xs="auto">
                      <Button variant="danger" size="sm" onClick={() => removeAttribute(index)}>
                        ✕
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button size="sm" variant="outline-primary" onClick={addAttribute}>
                  + Add Attribute
                </Button>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="primary">{editingProduct ? "Update" : "Create"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export { Products };
