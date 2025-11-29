import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import DataTable, { TableColumn } from "react-data-table-component";
import {
  createProduct,
  getAllProducts,
  updateProduct,
} from "../../APIs/user/product";
import { getAllWarehouses } from "../../APIs/user/warehouse";
import { Warehouse } from "./Warehouse";
import { createAmazonS3 } from "../../APIs/user/amazonS3";

interface ProductAttribute {
  key: string;
  value: string;
}

interface WarehouseStock {
  warehouse: Warehouse;
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
  created_by?: string;
  ownership?: string;
  status?: "active" | "inactive" | "suspended";
  createdAt?: string;
  updatedAt?: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productAttributes, setProductAttributes] = useState<
    ProductAttribute[]
  >([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [imageName, setImageName] = useState<string>("");

  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Fetch warehouses once
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const warehouseData = await getAllWarehouses();
        setWarehouses(warehouseData);
      } catch (error) {
        console.error("Error loading warehouses", error);
      }
    };
    fetchWarehouses();
  }, []);

  // Fetch products whenever page/limit changes
  useEffect(() => {
    fetchProducts(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const fetchProducts = async (pageParam = page, limitParam = limit) => {
    setLoading(true);
    try {
      const productData = await getAllProducts(pageParam, limitParam);
      // expected: { total: number, data: Product[] }
      setTotalRecords(productData.total);
      setProducts(productData.data);
    } catch (error) {
      console.error("Error loading products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingProduct(null);
    setProductAttributes([]);
    setImagePreview("");
    setWarehouseStocks([]);
    setImageName("");
  };

  const handleShow = () => {
    const defaultStocks: WarehouseStock[] = warehouses.map((wh) => ({
      warehouse: wh,
      stock: 0,
    }));
    setWarehouseStocks(defaultStocks);
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductAttributes(product.product_attributes || []);
    setImagePreview(product.product_image || "");

    const mappedStocks: WarehouseStock[] = warehouses.map((wh) => {
      const existingStock = product.warehouse.find(
        (w) => w.warehouse._id === wh._id
      );
      return {
        warehouse: wh,
        stock: existingStock ? existingStock.stock : 0,
      };
    });

    setWarehouseStocks(mappedStocks);
    setShowModal(true);
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === "active" ? "inactive" : "active";
    if (
      window.confirm(
        `Are you sure you want to mark this product as ${newStatus}?`
      )
    ) {
      try {
        await updateProduct(product._id!, { ...product, status: newStatus });
        await fetchProducts(); // refresh current page
      } catch (error) {
        console.error("Error updating status", error);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
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

  const handleWarehouseStockChange = (warehouseId: string, stock: number) => {
    const updated = [...warehouseStocks];
    const idx = updated.findIndex((w) => w.warehouse._id === warehouseId);
    if (idx !== -1) {
      updated[idx].stock = stock;
    }
    setWarehouseStocks(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const newProduct: Product = {
      product_name: (
        form.elements.namedItem("product_name") as HTMLInputElement
      ).value,
      product_description: (
        form.elements.namedItem("product_description") as HTMLTextAreaElement
      ).value,
      product_weight: parseFloat(
        (form.elements.namedItem("product_weight") as HTMLInputElement).value
      ),
      product_attributes: productAttributes,
      product_image: imagePreview || "",
      warehouse: warehouseStocks.filter((ws) => ws.stock > 0),
    };

    try {
      let imageData: { url: string } | null = null;
      if (imagePreview) {
        imageData = await createAmazonS3(
          `product/${Date.now()}-${imageName.replace(/ /g, "_")}`,
          imagePreview
        );
        newProduct.product_image = (imageData as any).url;
      }

      if (editingProduct && editingProduct._id) {
        await updateProduct(editingProduct._id, newProduct);
      } else {
        await createProduct(newProduct);
        // optional: go back to first page after create
        setPage(1);
      }

      // Refresh list for current page
      await fetchProducts();
      handleClose();
    } catch (err) {
      console.error("Error saving product", err);
    }
  };

  // Map warehouses by id for O(1) lookups in table render
  const warehouseMap = useMemo(() => {
    return warehouses.reduce<Record<string, Warehouse>>((acc, wh) => {
      acc[wh._id] = wh;
      return acc;
    }, {});
  }, [warehouses]);

  const columns: TableColumn<Product>[] = useMemo(
    () => [
      {
        name: "Name",
        selector: (row: Product) => row.product_name,
        sortable: true,
      },
      {
        name: "Description",
        selector: (row: Product) => row.product_description,
      },
      {
        name: "Weight",
        selector: (row: Product) => `${row.product_weight} kg`,
      },
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
            {row.warehouse.map((wh, i) => (
              <div key={i}>
                <strong>
                  {warehouseMap[wh.warehouse._id]?.name || "N/A"}:
                </strong>{" "}
                {wh.stock}
              </div>
            ))}
          </div>
        ),
      },
      {
        name: "Actions",
        cell: (row: Product) => (
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
      },
    ],
    [warehouseMap] // handlers are stable enough here; if lint complains, wrap them in useCallback
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Products</h4>
        <Button onClick={handleShow}>Create New</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <DataTable
          title="Your Products"
          columns={columns}
          data={products}
          pagination
          paginationServer
          paginationTotalRows={totalRecords}
          paginationDefaultPage={page}
          paginationPerPage={limit}
          onChangePage={(p) => {
            setPage(p);
          }}
          onChangeRowsPerPage={(newLimit) => {
            setLimit(newLimit);
            setPage(1); // ALWAYS reset to page 1 when limit changes
          }}
          highlightOnHover
          responsive
        />
      )}

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
                    step="0.001"
                    name="product_weight"
                    defaultValue={editingProduct?.product_weight || ""}
                    required
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
                          value={
                            warehouseStocks
                              .find((w) => w.warehouse._id === wh._id)
                              ?.stock?.toString() || ""
                          }
                          onChange={(e) =>
                            handleWarehouseStockChange(
                              wh._id,
                              parseInt(e.target.value, 10) || 0
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
