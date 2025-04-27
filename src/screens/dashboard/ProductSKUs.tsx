import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { createProductSKU, getAllProductSKUs, updateProductSKU } from "../../APIs/productSKU";
import { getAllWarehouses } from "../../APIs/warehouse";
import { getAllProducts } from "../../APIs/product";
import { Product } from "./Products";
import { Warehouse } from "./Warehouse";

interface ProductSKUAttribute {
  key: string;
  value: string;
}


interface WarehouseStock {
  warehouse: string;
  stock: number;
}

interface ProductSKUProduct {
  product_id: string;
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
  warehouse: WarehouseStock[];
  products: ProductSKUProduct[];
  status: "active" | "inactive";
  created_by?: string;
  ownership?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ProductSKUs: React.FC = () => {
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProductSKU, setEditingProductSKU] = useState<ProductSKU | null>(null);
  const [productSKUAttributes, setProductSKUAttributes] = useState<ProductSKUAttribute[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductSKUProduct[]>([]);
  const [productSKUId, setProductSKUId] = useState<string>(""); // New state for ProductSKU ID
  const [calculatedWeight, setCalculatedWeight] = useState<number>(0); // New state for calculated weight

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productSKUData, warehouseData, productData] = await Promise.all([
          getAllProductSKUs(),
          getAllWarehouses(),
          getAllProducts(),
        ]);
        setProductSKUs(productSKUData);
        setWarehouses(warehouseData);
        setProducts(productData);
      } catch (error) {
        console.error("Error loading initial data", error);
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
      warehouse: wh._id,
      stock: 0,
    }));
    setWarehouseStocks(defaultStocks);
    setShowModal(true);
  };

  const handleEdit = (productSKU: ProductSKU) => {
    setEditingProductSKU(productSKU);
    setProductSKUAttributes(productSKU.product_sku_attributes || []);
    setImagePreview(productSKU.product_sku_image);
    setProductSKUId(productSKU.product_sku_id || ""); // Set ProductSKU ID

    // Pre-select the products with their IDs and quantities
    const preSelectedProducts = productSKU.products.map((product) => ({
      product_id: product.product_id, // Ensure product_id is set
      quantity: product.quantity, // Ensure quantity is set
    }));

    setSelectedProducts(preSelectedProducts);

    // Derive warehouses from the products in the SKU
    const derivedWarehouses = productSKU.products.flatMap((product) => {
      const productDetails = products.find((p) => p._id === product.product_id);
      return productDetails?.warehouse.map((w) => ({
        warehouse: w.warehouse._id,
        stock: w.stock,
        name: w.warehouse.name,
      })) || [];
    });

    // Remove duplicate warehouses by ID
    const uniqueWarehouses = Array.from(
      new Map(derivedWarehouses.map((w) => [w.warehouse, w])).values()
    );

    setWarehouseStocks(uniqueWarehouses);
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

  const handleAttributeChange = (index: number, field: "key" | "value", value: string) => {
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

    if (selectedProducts.some((p, i) => i !== index && p.product_id === productId)) {
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
      // Toggle the status
      const updatedStatus = productSKU.status === "active" ? "inactive" : "active";

      // Update the status in the backend
      await updateProductSKU(productSKU._id!, { ...productSKU, status: updatedStatus });

      // Update the status in the frontend
      setProductSKUs((prev) =>
        prev.map((sku) =>
          sku._id === productSKU._id ? { ...sku, status: updatedStatus } : sku
        )
      );

      alert(`Product SKU status updated to ${updatedStatus}`);
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to update the status. Please try again.");
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const newProductSKU: ProductSKU = {
      product_sku_id: productSKUId, // Use the manually entered ProductSKU ID
      product_sku_name: (form.elements.namedItem("product_sku_name") as HTMLInputElement).value,
      product_sku_description: (form.elements.namedItem("product_sku_description") as HTMLInputElement).value,
      product_sku_weight: calculatedWeight, // Use the calculated weight
      product_sku_attributes: productSKUAttributes,
      product_sku_image: imagePreview || "",
      warehouse: warehouseStocks,
      products: selectedProducts,
      status: editingProductSKU?.status || "active",
    };

    try {
      if (editingProductSKU) {
        await updateProductSKU(editingProductSKU._id!, newProductSKU);
        setProductSKUs((prev) =>
          prev.map((p) => (p._id === editingProductSKU._id ? { ...newProductSKU, _id: editingProductSKU._id } : p))
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
      cell: (row: ProductSKU) => (
        <div
          style={{
            fontWeight: "bold",
            fontSize: "12px",
            color: "#007bff",
            whiteSpace: "nowrap", // Prevent wrapping
            // overflow: "hidden", // Prevent overflow
            textOverflow: "ellipsis", // Add ellipsis if content overflows
          }}
        >
          {row.status === "active" ? "🟢" : row.status === "inactive" ? "🔴" : "❌"}{" "}
          {row.product_sku_id}
        </div>
      ),
    },
    {
      name: "Name",
      selector: (row: Product) => row.product_name,
      sortable: true,
      cell: (row: ProductSKU) => (
        <div className="d-flex align-items-center" style={{ gap: "12px" }}>
          <img
            src={row.product_sku_image}
            alt={row.product_sku_name}
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          />
          <div style={{ fontWeight: 600, fontSize: "14px", lineHeight: "1.2" }}>
            {row.product_sku_name}
          </div>
        </div>
      ),
      width: "280px",
      style: { margin: 10 }
    },
    {
      name: "Products",
      cell: (row: ProductSKU) => (
        <div>
          {row.products.map((product, index) => {
            const productDetails = product.product_id as Product; // Ensure product_id is populated
            return (
              <div key={index} style={{ fontSize: "13px", marginBottom: "4px" }}>
                <strong>{productDetails?.product_name}</strong>: {product.quantity} pcs
              </div>
            );
          })}
        </div>
      ),
    },
    {
      name: "Description",
      selector: (row: ProductSKU) => row.product_sku_description,
      cell: (row: ProductSKU) => {
        const maxWords = 10; // Limit description to 10 words
        const words = row.product_sku_description.split(" ");
        const truncatedDescription =
          words.length > maxWords
            ? words.slice(0, maxWords).join(" ") + "..."
            : row.product_sku_description;

        return (
          <div style={{ fontSize: "13px", color: "#555" }}>
            {truncatedDescription}
          </div>
        );
      },
    },
    {
      name: "Weight",
      selector: (row: ProductSKU) => {
        const totalWeight = row.products.reduce((sum, product) => {
          const productDetails = product.product_id as Product; // Ensure product_id is populated
          return sum + (productDetails?.product_weight || 0) * product.quantity;
        }, 0);
        return `${totalWeight.toFixed(2)} kg`;
      },
      cell: (row: ProductSKU) => {
        const totalWeight = row.products.reduce((sum, product) => {
          const productDetails = product.product_id as Product;
          return sum + (productDetails?.product_weight || 0) * product.quantity;
        }, 0);
        return (
          <div style={{ fontWeight: "bold", fontSize: "13px", color: "#28a745" }}>
            {totalWeight.toFixed(2)} kg
          </div>
        );
      },
      sortable: true,
    }, {
      name: "Created On",
      selector: (row: ProductSKU) =>
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
      cell: (row: ProductSKU) => (
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
      width: "200px",
    },
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Product SKUs</h4>
        <Button onClick={handleShow}>Create New</Button>
      </div>
      <DataTable
        title="Your Product SKUs"
        columns={columns}
        data={productSKUs}
        pagination
        highlightOnHover
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
      />
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProductSKU ? "Edit Product SKU" : "Create Product SKU"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              {/* Left Column */}
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
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="product_sku_name"
                    defaultValue={editingProductSKU?.product_sku_name || ""}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="product_sku_description"
                    defaultValue={editingProductSKU?.product_sku_description || ""}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Weight (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    name="product_sku_weight"
                    value={calculatedWeight} // Display the calculated weight
                    readOnly
                  />
                </Form.Group>
              </Col>

              {/* Right Column */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Image</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-3 w-100 rounded shadow-sm"
                      style={{ maxHeight: "200px", objectFit: "cover" }}
                    />
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
                      <option key={product._id} value={product._id}>
                        {product.product_name}
                      </option>
                    ))}
                  </Form.Control>
                </Col>
                <Col>
                  <Form.Control
                    type="number"
                    value={selected.quantity} // Pre-fill the quantity
                    onChange={(e) => handleProductQuantityChange(idx, parseInt(e.target.value))}
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
    </div>
  );
};

export { ProductSKUs };