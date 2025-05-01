import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { createProduct, getAllProducts } from "../../APIs/product";

interface ProductAttribute {
  key: string;
  value: string;
}

interface WarehouseStock {
  warehouse_id: string;
  stock: number;
}

export interface Product {
  id: string;
  product_name: string;
  product_description: string;
  product_weight: number;
  product_attributes: ProductAttribute[];
  product_image: string;
  warehouse: WarehouseStock[];
  created_by: any;
  ownership: any;
  status: string;
}

const warehouseOptions = ["Delhi", "Mumbai", "Bangalore"];

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productAttributes, setProductAttributes] = useState<
    ProductAttribute[]
  >([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };

    fetchProducts();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setEditingProduct(null);
    setProductAttributes([]);
    setImagePreview("");
    setWarehouseStocks([]);
  };

  const handleShow = () => setShowModal(true);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductAttributes(product.product_attributes || []);
    setImagePreview(product.product_image);
    setWarehouseStocks(product.warehouse || []);
    setShowModal(true);
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

  const handleAttributeChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
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

  const handleWarehouseStockChange = (warehouse_id: string, stock: number) => {
    const updated = [...warehouseStocks];
    const idx = updated.findIndex((w) => w.warehouse_id === warehouse_id);
    if (idx !== -1) {
      updated[idx].stock = stock;
    } else {
      updated.push({ warehouse_id, stock });
    }
    setWarehouseStocks(updated);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const newProduct: Product = {
      id: editingProduct?.id || new Date().toISOString(),
      product_name: (
        form.elements.namedItem("product_name") as HTMLInputElement
      ).value,
      product_description: (
        form.elements.namedItem("product_description") as HTMLInputElement
      ).value,
      product_weight: parseFloat(
        (form.elements.namedItem("product_weight") as HTMLInputElement).value
      ),
      product_attributes: productAttributes,
      product_image: imagePreview,
      warehouse: warehouseStocks,
      created_by: "defaultUserId",
      ownership: "defaultUserId",
      status: "active",
    };

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? newProduct : p))
      );
    } else {
      createProduct(newProduct);
      // setProducts((prev) => [...prev, newProduct]);
    }

    handleClose();
  };

  const columns = [
    {
      name: "Name",
      selector: (row: Product) => row.product_name,
      sortable: true,
      cell: (row: Product) => (
        <div>
          <img
            src={row.product_image}
            alt="Product"
            style={{ width: 50, height: 50, margin: 10, borderRadius: 5 }}
          />
          <b>{row.product_name}</b>
        </div>
      ),
    },
    {
      name: "Description",
      selector: (row: Product) => row.product_description,
    },
    { name: "Weight", selector: (row: Product) => row.product_weight },
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
      name: "Warehouse: Stock",
      cell: (row: any) => (
        <div>
          {row.warehouse.map((wh: any, i: any) => (
            <div key={i}>
              <strong>{wh["warehouse"]["name"]}:</strong> {wh.stock}
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Users",
      cell: (row: Product) => (
        <div>
          <div>
            <strong>Created By:</strong> {row.created_by?.name || "N/A"}
          </div>
          <div>
            <strong>Ownership:</strong> {row.ownership?.name || "N/A"}
          </div>
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row: Product) => (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => handleEdit(row)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Your Products</h4>
        <Button onClick={handleShow}>Create New</Button>
      </div>

      <DataTable
        title="Product"
        highlightOnHover
        columns={columns}
        data={products}
        pagination
        striped
        persistTableHead
        responsive
        progressPending={products.length === 0}
      />

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? "Edit Product" : "Create Product"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    name="product_name"
                    defaultValue={editingProduct?.product_name || ""}
                    required
                  />
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
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Warehouse Stock</Form.Label>
                  {warehouseOptions.map((wh) => (
                    <Row className="mb-2" key={wh}>
                      <Col>{wh}</Col>
                      <Col>
                        <Form.Control
                          type="number"
                          placeholder="Stock"
                          value={
                            warehouseStocks
                              .find((w) => w.warehouse_id === wh)
                              ?.stock?.toString() || ""
                          }
                          onChange={(e) =>
                            handleWarehouseStockChange(
                              wh,
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </Col>
                    </Row>
                  ))}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-2 w-100 rounded shadow-sm"
                    />
                  )}
                </Form.Group>

                <Form.Label>Attributes</Form.Label>
                {productAttributes.map((attr, index) => (
                  <Row key={index} className="mb-2">
                    <Col>
                      <Form.Control
                        placeholder="Key"
                        value={attr.key}
                        onChange={(e) =>
                          handleAttributeChange(index, "key", e.target.value)
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        placeholder="Value"
                        value={attr.value}
                        onChange={(e) =>
                          handleAttributeChange(index, "value", e.target.value)
                        }
                      />
                    </Col>
                    <Col xs="auto">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeAttribute(index)}
                      >
                        ✕
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={addAttribute}
                >
                  + Add Attribute
                </Button>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProduct ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export { Products };
