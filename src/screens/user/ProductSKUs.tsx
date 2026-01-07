import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "quill/dist/quill.snow.css";

import Quill from "quill/core";
import Toolbar from "quill/modules/toolbar";
import Snow from "quill/themes/snow";
import Bold from "quill/formats/bold";
import Italic from "quill/formats/italic";
import Header from "quill/formats/header";

Quill.register({
  "modules/toolbar": Toolbar,
  "themes/snow": Snow,
  "formats/bold": Bold,
  "formats/italic": Italic,
  "formats/header": Header,
});

import {
  createProductSKU,
  getAllProductSKUs,
  updateProductSKU,
} from "../../APIs/user/productSKU";
import { getAllWarehouses } from "../../APIs/user/warehouse";
import { getAllProducts } from "../../APIs/user/product";
import { Product } from "./Products";
import { getAllProductPacks } from "../../APIs/user/productPack";
import { ProductPack } from "./ProductPacks";
import DescriptionEditor from "./description";
import { createAmazonS3 } from "../../APIs/user/amazonS3";

interface ProductSKUAttribute {
  key: string;
  value: string;
}

interface Warehouse {
  _id: string;
  name: string;
}

interface WarehouseStock {
  warehouse: Warehouse;
  stock: number;
}

interface ProductSKUProduct {
  product_id: Product;
  quantity: number;
}

export interface ProductSKU {
  _id?: string;
  product_sku_id?: string;
  product_sku_name: string;
  product_sku_description: string;
  product_sku_weight: number;
  product_sku_attributes: ProductSKUAttribute[];
  product_sku_image: string;
  pack_id?: ProductPack;
  warehouse: WarehouseStock[];
  products: ProductSKUProduct[];
  status: "active" | "inactive" | "suspended";
  created_by?: string;
  ownership?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ProductSKUs: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [productPacks, setProductPacks] = useState<ProductPack[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingProductSKU, setEditingProductSKU] = useState<ProductSKU | null>(
    null
  );
  const [productSKUAttributes, setProductSKUAttributes] = useState<
    ProductSKUAttribute[]
  >([]);
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Partial<any>[]>([]);
  const [productSKUId, setProductSKUId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageName, setImageName] = useState<string | null>(null);

  const [calculatedWeight, setCalculatedWeight] = useState<number>(0);

  // PAGINATION
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  useEffect(() => {
    fetchInitialData();
  }, [page, limit]); // fetch again when pagination changes

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [skuData, warehousesData, productsData, packsData] =
        await Promise.all([
          getAllProductSKUs(page, limit),
          getAllWarehouses(),
          getAllProducts(),
          getAllProductPacks(),
        ]);

      setProductSKUs(skuData.data);
      setTotalRecords(skuData.total);
      setWarehouses(warehousesData.data);
      setProducts(productsData.data);
      setProductPacks(packsData.data);
    } catch (error) {
      console.error("Error loading initial data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const totalWeight = selectedProducts.reduce((total, sel) => {
      const product = products.find((p) => p._id === sel.product_id);
      return total + (product ? product.product_weight * sel.quantity : 0);
    }, 0);
    setCalculatedWeight(totalWeight);
  }, [selectedProducts, products]);

  const handleClose = () => {
    setShowModal(false);
    setEditingProductSKU(null);
    setProductSKUAttributes([]);
    setImagePreview("");
    setWarehouseStocks([]);
    setSelectedProducts([]);
    setProductSKUId("");
    setCalculatedWeight(0);
    setDescription("");
  };

  const handleShow = () => {
    const defaultStocks = warehouses.map((wh) => ({
      warehouse: wh,
      stock: 0,
    }));
    setWarehouseStocks(defaultStocks);
    setShowModal(true);
  };

  const handleEdit = (productSKU: ProductSKU) => {
    setEditingProductSKU(productSKU);
    setDescription(productSKU.product_sku_description || "");
    setProductSKUAttributes(productSKU.product_sku_attributes || []);
    setImagePreview(productSKU.product_sku_image);
    setProductSKUId(productSKU.product_sku_id || "");

    const preSelected = (productSKU.products || []).map((prod) => ({
      product_id: prod.product_id?._id ?? "",
      product_name: prod.product_id?.product_name ?? "",
      quantity: prod.quantity ?? 0,
    }));

    setSelectedProducts(preSelected);
    setShowModal(true);
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAttributeChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...productSKUAttributes];
    updated[index][field] = value;
    setProductSKUAttributes(updated);
  };

  const addAttribute = () => {
    setProductSKUAttributes([...productSKUAttributes, { key: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    const updated = [...productSKUAttributes];
    updated.splice(index, 1);
    setProductSKUAttributes(updated);
  };

  const handleProductChange = (index: number, productId: string) => {
    const updated = [...selectedProducts];
    updated[index].product_id = productId;
    setSelectedProducts(updated);
  };

  const handleProductQuantityChange = (index: number, quantity: number) => {
    const updated = [...selectedProducts];
    updated[index].quantity = quantity;
    setSelectedProducts(updated);
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { product_id: "", quantity: 1 }]);
  };

  const removeProduct = (index: number) => {
    const updated = [...selectedProducts];
    updated.splice(index, 1);
    setSelectedProducts(updated);
  };

  const handleToggleStatus = async (row: ProductSKU) => {
    const newStatus = row.status === "active" ? "inactive" : "active";
    try {
      await updateProductSKU(row._id!, { ...row, status: newStatus });
      fetchInitialData();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const form = e.currentTarget;

    const newSKU: any = {
      product_sku_id: productSKUId,
      product_sku_name: (
        form.elements.namedItem("product_sku_name") as HTMLInputElement
      ).value,
      product_sku_description: description,
      product_sku_weight: calculatedWeight,
      product_sku_attributes: productSKUAttributes,
      warehouse: warehouseStocks,
      product_sku_image: imagePreview,
      pack_id: (form.elements.namedItem("pack_id") as HTMLSelectElement).value,
      products: selectedProducts,
      status: editingProductSKU?.status || "active",
    };

    try {
      if (imageName) {
        const img = await createAmazonS3(
          `productSKU/${Date.now()}-${imageName.replace(/ /g, "_")}`,
          imagePreview
        );
        newSKU.product_sku_image = img.url;
      }

      if (editingProductSKU) {
        await updateProductSKU(editingProductSKU._id!, newSKU);
      } else {
        await createProductSKU(newSKU);
        setPage(1); // reset to page 1 on create
      }

      fetchInitialData();
      handleClose();
    } catch (err) {
      console.error("Error saving SKU", err);
    }
  };

  const columns = [
    {
      name: "SKU ID",
      selector: (row: ProductSKU) => row.product_sku_id,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row: ProductSKU) => row.product_sku_name,
      sortable: true,
    },
    {
      name: "Dimensions & Weight",
      selector: (row: ProductSKU) => {
        const totalWeight = row.products.reduce((sum, p) => {
          const weight = p?.product_id?.product_weight ?? 0;
          return sum + weight * (p.quantity ?? 0);
        }, 0);
        return (
          <>
            {totalWeight.toFixed(2)} gm <br />
            {row.pack_id?.name}
          </>
        );
      },
    },
    {
      name: "Status",
      selector: (row: ProductSKU) =>
        row.status === "active" ? "🟢 Active" : "🔴 Inactive",
    },
    {
      name: "Actions",
      cell: (row: ProductSKU) => (
        <>
          <Button
            size="sm"
            variant="outline-primary"
            className="me-2"
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant={
              row.status === "active" ? "outline-danger" : "outline-success"
            }
            onClick={() => handleToggleStatus(row)}
          >
            {row.status === "active" ? "Deactivate" : "Activate"}
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Product SKUs</h4>
        <Button onClick={handleShow}>Create New</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          title="Your Product SKUs"
          columns={columns as any}
          data={productSKUs}
          pagination
          paginationServer
          paginationTotalRows={totalRecords}
          paginationDefaultPage={page}
          paginationPerPage={limit}
          onChangePage={(p) => setPage(p)}
          onChangeRowsPerPage={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          highlightOnHover
          responsive
        />
      )}

      {/* MODAL */}
      <Modal show={showModal} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProductSKU ? "Edit Product SKU" : "Create Product SKU"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ padding: "2rem" }}>
            {/* PRODUCTS SECTION */}
            <h5 className="mb-3" style={{ color: "#000434", fontWeight: 700 }}>
              🛒 Products
            </h5>

            <Button
              onClick={addProduct}
              className="mb-3"
              style={{
                backgroundColor: "#F5891E",
                border: "none",
                fontWeight: 600,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              + Add Product
            </Button>

            {selectedProducts.map((sel, idx) => (
              <Row
                key={idx}
                className="mb-2 align-items-center"
                style={{
                  background: "#f8f8f8",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  gap: "0.5rem",
                }}
              >
                <Col md>
                  <Form.Select
                    value={sel.product_id}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.product_name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md="auto" style={{ width: "100px" }}>
                  <Form.Control
                    type="number"
                    value={sel.quantity}
                    min={1}
                    onChange={(e) =>
                      handleProductQuantityChange(idx, Number(e.target.value))
                    }
                  />
                </Col>

                <Col xs="auto">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeProduct(idx)}
                  >
                    ✕ Remove
                  </Button>
                </Col>
              </Row>
            ))}

            <hr style={{ margin: "1.5rem 0", borderColor: "#e0e0e0" }} />

            {/* PRODUCT DETAILS */}
            <h5 className="mb-3" style={{ color: "#000434", fontWeight: 700 }}>
              📦 Product SKU Details
            </h5>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Product SKU ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={productSKUId}
                    disabled={!!editingProductSKU}
                    required
                    placeholder="Enter SKU ID"
                    onChange={(e) => setProductSKUId(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Product SKU Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="product_sku_name"
                    defaultValue={editingProductSKU?.product_sku_name || ""}
                    required
                    placeholder="Enter SKU Name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <DescriptionEditor value={description} onChange={setDescription} />

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Select Pack</Form.Label>
                  <Form.Select
                    name="pack_id"
                    defaultValue={editingProductSKU?.pack_id?._id || ""}
                    required
                  >
                    <option value="">Select Packaging</option>
                    {productPacks.map((pack) => (
                      <option key={pack._id} value={pack._id}>
                        {pack.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Weight (gm)</Form.Label>
                  <Form.Control
                    type="number"
                    value={calculatedWeight}
                    readOnly
                    style={{ backgroundColor: "#f0f0f0" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* IMAGE UPLOAD */}
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
                  className="mt-2 rounded shadow-sm"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                    border: "1px solid #ddd",
                  }}
                />
              )}
            </Form.Group>

            {/* ATTRIBUTES */}
            <Form.Group className="mb-3">
              <Form.Label>Attributes</Form.Label>
              {productSKUAttributes.map((attr, index) => (
                <Row key={index} className="mb-2 align-items-center">
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
                      size="sm"
                      variant="outline-danger"
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
                style={{ marginTop: "0.5rem" }}
              >
                + Add Attribute
              </Button>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProductSKU ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export { ProductSKUs };
