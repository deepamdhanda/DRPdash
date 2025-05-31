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
} from "../../APIs/productSKU";
import { getAllWarehouses } from "../../APIs/warehouse";
import { getAllProducts } from "../../APIs/product";
import { Product } from "./Products";
import { getAllProductPacks } from "../../APIs/productPack";
import { ProductPack } from "./ProductPacks";
import DescriptionEditor from "./description";
import { createAmazonS3 } from "../../APIs/amazonS3";

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
  const [loading, setLoading] = useState(true); // Added loading state
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [productPacks, setProductPacks] = useState<ProductPack[]>([]);
  const [editingProductSKU, setEditingProductSKU] = useState<ProductSKU | null>(
    null
  );
  const [productSKUAttributes, setProductSKUAttributes] = useState<
    ProductSKUAttribute[]
  >([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Partial<any>[]>([]);
  const [productSKUId, setProductSKUId] = useState<string>(""); // New state for ProductSKU ID
  const [calculatedWeight, setCalculatedWeight] = useState<number>(0); // New state for calculated weight
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [productSKUData, warehouseData, productData, productPackData] = await Promise.all([
          getAllProductSKUs(),
          getAllWarehouses(),
          getAllProducts(),
          getAllProductPacks(),
        ]);
        setProductSKUs(productSKUData);
        setWarehouses(warehouseData);
        setProducts(productData);
        setProductPacks(productPackData);
      } catch (error) {
        console.error("Error loading initial data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Recalculate weight whenever selectedProducts changes
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
    setProductSKUId(""); // Reset ProductSKU ID
    setCalculatedWeight(0); // Reset calculated weight
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
    setProductSKUId(productSKU.product_sku_id || ""); // Set ProductSKU ID

    // Pre-select the products with their IDs and quantities
    const preSelectedProducts = productSKU.products.map((product) => ({
      product_id: product.product_id._id, // Ensure product_id is set
      product_name: product.product_id.product_name,
      quantity: product.quantity, // Ensure quantity is set
    }));

    setSelectedProducts(preSelectedProducts);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
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

  const getCommonWarehouses = (): string[] => {
    if (selectedProducts.length === 0) {
      // If no products are selected, return all warehouses
      return warehouses.map((w) => w._id);
    }

    // Get the list of warehouses for each selected product
    const selectedProductWarehouses = selectedProducts.map((sel) => {
      const product = products.find((p) => p._id === sel.product_id);
      return product
        ? product.warehouse
          .filter((w) => w.stock > 0)
          .map((w) => w.warehouse._id)
        : [];
    });

    // Find the intersection of all selected product warehouses
    return selectedProductWarehouses.reduce((common, current) => {
      return common.filter((wh) => current.includes(wh));
    });
  };
  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    const commonWarehouses = getCommonWarehouses();
    const productWarehouses = product.warehouse.map((w) => w.warehouse._id);

    if (!productWarehouses.some((wh) => commonWarehouses.includes(wh))) {
      alert("Selected product must have at least one common warehouse.");
      return;
    }

    if (
      selectedProducts.some((p, i) => i !== index && p.product_id === productId)
    ) {
      alert("Product already added to this SKU.");
      return;
    }

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
    const selectedIds = selectedProducts.map((p) => p.product_id);
    const commonWarehouses = getCommonWarehouses();

    // Filter products that are not already selected and have at least one common warehouse
    const availableProducts = products.filter((p) => {
      const productWarehouses = p.warehouse.map((w) => w.warehouse._id);
      return (
        p._id &&
        !selectedIds.includes(p._id) &&
        productWarehouses.some((wh) => commonWarehouses.includes(wh))
      );
    });

    if (availableProducts.length === 0) {
      alert("No eligible product left to add.");
      return;
    }

    // Add the first available product to the selected products list
    setSelectedProducts([
      ...selectedProducts,
      { product_id: availableProducts[0]._id, quantity: 1 },
    ]);
  };

  const removeProduct = (index: number) => {
    const updated = [...selectedProducts];
    updated.splice(index, 1);
    setSelectedProducts(updated);
  };

  const handleToggleStatus = async (productSKU: ProductSKU) => {
    try {
      const updatedStatus =
        productSKU.status === "active" ? "inactive" : "active";
      await updateProductSKU(productSKU._id!, {
        ...productSKU,
        status: updatedStatus,
      });
      setProductSKUs((prev) =>
        prev.map((sku) =>
          sku._id === productSKU._id ? { ...sku, status: updatedStatus } : sku
        )
      );
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleSubmit = async (e: any) => {

    e.preventDefault();
    const form = e.currentTarget;

    const newProductSKU: any = {
      product_sku_id: productSKUId,
      product_sku_name: (
        form.elements.namedItem("product_sku_name") as HTMLInputElement
      ).value,
      product_sku_description: description,
      product_sku_weight: calculatedWeight,
      product_sku_attributes: productSKUAttributes,
      product_sku_image: imagePreview || "",
      warehouse: warehouseStocks,
      products: selectedProducts,
      pack_id: (form.elements.namedItem("pack_id") as HTMLSelectElement)
        .value,
      status: editingProductSKU?.status || "active",
    };

    try {
      let imageData = null;
      if (image) {
        imageData = await createAmazonS3(`productSKU/${Date.now()}`, imagePreview);
        newProductSKU.product_sku_image = imageData.url;
      }
      if (editingProductSKU) {
        await updateProductSKU(editingProductSKU._id!, newProductSKU);
        setProductSKUs((prev) =>
          prev.map((p) =>
            p._id === editingProductSKU._id
              ? { ...newProductSKU, _id: editingProductSKU._id }
              : p
          )
        );
      } else {
        const created = await createProductSKU(newProductSKU);
        setProductSKUs((prev) => [...prev, created]);
      }
      handleClose();
    } catch (err) {
      console.error("Error saving productSKU", err);
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
      name: "Dimensions and Weight",
      selector: (row: ProductSKU) => {
        let totalWeight = 0;
        row.products.forEach((product) => {
          totalWeight += product.product_id.product_weight * product.quantity;

        });
        return (
          <>
            {totalWeight} kg<br />
            {row.pack_id?.name}
          </>
        );

      },
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: ProductSKU) =>
        row.status === "active" ? "🟢 Active" : "🔴 Inactive",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: ProductSKU) => (
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
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Product SKUs</h4>
        <Button onClick={handleShow}>Create New</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : productSKUs.length === 0 ? (
        <p>No Product SKUs found.</p>
      ) : (
        <DataTable
          title="Your Product SKUs"
          columns={columns as any}
          data={productSKUs}
          pagination
          highlightOnHover
          responsive
        />
      )}

      <Modal show={showModal} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProductSKU ? "Edit Product SKU" : "Create Product SKU"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              {/* Left Column */}
              <Col md={12}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product SKU ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="product_sku_id"
                        value={productSKUId}
                        onChange={(e) => setProductSKUId(e.target.value)}
                        required
                        disabled={!!editingProductSKU}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product SKU Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="product_sku_name"
                        defaultValue={editingProductSKU?.product_sku_name || ""}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <DescriptionEditor value={description} onChange={setDescription} />
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Weight (gm)</Form.Label>
                  <Form.Control
                    type="number"
                    name="product_sku_weight"
                    value={calculatedWeight} // Display the calculated weight
                    readOnly
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Select Pack</Form.Label>
                  <Form.Select
                    name="pack_id"
                    defaultValue={editingProductSKU?.pack_id?._id || ""}
                  >
                    <option value="">Select Channel</option>
                    {productPacks.map((productPack) => (
                      <option key={productPack._id} value={productPack._id}>
                        {productPack.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

              </Col>

              {/* Right Column */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-3 w-100 rounded shadow-sm"
                      style={{ maxHeight: "200px", objectFit: "cover" }}
                    />
                  )}
                  {image && (
                    <Button onClick={() => { handleSubmit('e') }}>Upload</Button>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Attributes</Form.Label>
                  {productSKUAttributes.map((attr, index) => (
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
                            handleAttributeChange(
                              index,
                              "value",
                              e.target.value
                            )
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
                </Form.Group>
              </Col>
            </Row>

            {/* Products Section */}
            <h5>Products</h5>
            {selectedProducts.map((selected, idx) => (
              <Row key={idx} className="mb-2">
                <Col>
                  <Form.Control
                    as="select"
                    value={selected.product_id} // Pre-select the product
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                    disabled={!!editingProductSKU} // Disable dropdown in edit mode
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id} selected={selected.product_id === product._id}>
                        {product.product_name}
                      </option>
                    ))}
                  </Form.Control>
                </Col>
                <Col>
                  <Form.Control
                    type="number"
                    value={selected.quantity} // Pre-fill the quantity
                    onChange={(e) =>
                      handleProductQuantityChange(idx, parseInt(e.target.value))
                    }
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    variant="danger"
                    onClick={() => removeProduct(idx)}
                    disabled={!!editingProductSKU} // Disable remove button in edit mode
                  >
                    Remove
                  </Button>
                </Col>
              </Row>
            ))}
            {!editingProductSKU && ( // Hide "Add Product" button in edit mode
              <Button onClick={addProduct}>Add Product</Button>
            )}
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
    </div >
  );
};

export { ProductSKUs };