import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  createProductSKU,
  getAllProductSKUs,
  updateProductSKU,
} from "../../APIs/productSKU";
import { getAllWarehouses } from "../../APIs/warehouse";
import { getAllProducts } from "../../APIs/product";
import { Product } from "./Products";

interface ProductSKUAttribute {
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
  const [loading, setLoading] = useState(true); // Added loading state
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showModal, setShowModal] = useState(false);
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

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const newProductSKU: any = {
      product_sku_id: productSKUId,
      product_sku_name: (
        form.elements.namedItem("product_sku_name") as HTMLInputElement
      ).value,
      product_sku_description: (
        form.elements.namedItem("product_sku_description") as HTMLInputElement
      ).value,
      product_sku_weight: calculatedWeight,
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
      name: "Weight",
      selector: (row: ProductSKU) => `${row.product_sku_weight.toFixed(2)} kg`,
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

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProductSKU ? "Edit Product SKU" : "Create Product SKU"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Form fields */}
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