import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Card, Badge } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllProductSKUs } from "../../APIs/user/productSKU";
import { getAllChannelAccounts } from "../../APIs/user/channelAccount";
import { ProductSKU } from "./ProductSKUs";
import { ChannelAccount } from "./ChannelAccounts";
import {
  linkProductSkuToChannelAccount,
  getUnlinkedProductSku,
  postNewProduct,
} from "../../APIs/user/productSKUChannelLink";
import { toast } from "react-toastify";

export type ProductChannelLink = {
  product_sku_id: string;
  channel_account_id: string;
  variant_id: string | null;
  price: number;
};

type newProductSKU = {
  _id: string;
  product_name: string;
  variant_id: string;
  product_sku_id?: string;
  price: number;
  channel_account_id: string;
  channel_account_name: string;
  product_description: string;
};

const ChannelSKU: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [channelAccounts, setChannelAccounts] = useState<ChannelAccount[]>([]);
  const [unlinkedProducts, setUnlinkedProducts] = useState<newProductSKU[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [selectedProductSKUs, setSelectedProductSKUs] = useState<
    ProductSKU["_id"][]
  >([]);
  const [selectedChannelAccounts, setSelectedChannelAccounts] = useState<
    ChannelAccount["_id"][]
  >([]);
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<
    newProductSKU["variant_id"] | null
  >(null);
  const [skuPrices, setSkuPrices] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchInitialData();
  }, [page, limit, refresh]);

  const fetchInitialData = async () => {
    try {
      const [productSKUsData, channelAccountsData, unlinkedProductsData] =
        await Promise.all([
          getAllProductSKUs(),
          getAllChannelAccounts(),
          getUnlinkedProductSku(page, limit),
        ]);
      setTotalRecords(unlinkedProductsData.total);
      setProductSKUs(productSKUsData.data);
      setChannelAccounts(channelAccountsData.data);
      setUnlinkedProducts(unlinkedProductsData.data);
    } catch (error) {
      console.error("Error fetching initial data", error);
    }
  };

  const handleProductSelect = (skuId: string) => {
    setSelectedProductSKUs((prev) =>
      prev.includes(skuId)
        ? prev.filter((id) => id !== skuId)
        : [...prev, skuId]
    );
  };

  const handlePriceChange = (skuId: string, price: string) => {
    setSkuPrices((prev) => ({
      ...prev,
      [skuId]: Number(price),
    }));
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelAccounts((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleHideLinkModal = () => {
    setShowLinkModal(false);
  };

  const handleLinkProduct = async () => {
    if (
      selectedProductSKUs.length === 0 ||
      selectedChannelAccounts.length === 0
    ) {
      toast.error(
        "Please select at least one Product SKU and one Channel Account."
      );
      return;
    }

    for (const skuId of selectedProductSKUs) {
      const productPrice = skuId && skuPrices[skuId];
      if (!productPrice || productPrice <= 0) {
        toast.error(`Please enter a valid price for SKU: ${skuId}`);
        return;
      }
    }

    try {
      for (const skuId of selectedProductSKUs) {
        for (const channelId of selectedChannelAccounts) {
          await linkProductSkuToChannelAccount({
            product_sku_id: skuId ?? "",
            channel_account_id: channelId ?? "",
            variant_id: selectedVariant || null,
            price: (skuId && skuPrices[skuId]) || 0,
          });
        }
      }

      toast.success("Product SKUs linked to Channel Accounts successfully!");
      setShowModal(false);
      setSelectedProductSKUs([]);
      setSelectedChannelAccounts([]);
      setSkuPrices({});
      setSelectedVariant(null);
      setShowLinkModal(false);
    } catch (error) {
      console.error("Error linking Product SKUs to Channel Accounts", error);
      toast.error("Failed to link Product SKUs to Channel Accounts.");
    }
  };

  const columns = [
    {
      name: "Product Name",
      selector: (row: newProductSKU) => row.product_name || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Channel Account",
      selector: (row: newProductSKU) => row.channel_account_name || "N/A",
      sortable: true,
    },
    {
      name: "Variant ID",
      selector: (row: newProductSKU) => row.variant_id || "N/A",
      sortable: true,
    },
    {
      name: "Price",
      selector: (row: newProductSKU) => `${row.price || "0.00"}`, //₹
      sortable: true,
    },
    {
      name: "Linked To",
      selector: (row: newProductSKU) => `${row.product_sku_id || "N/A"}`,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: newProductSKU) =>
        !row.product_sku_id ? (
          <>
            <Button
              variant="outline-success"
              className="me-2"
              onClick={() => {
                setSelectedProductSKUs([row._id]);
                setSelectedChannelAccounts([row.channel_account_id]);
                setSelectedVariant(row.variant_id);
                setShowLinkModal(true);
              }}
            >
              Link Product
            </Button>
            <Button
              variant="outline-primary"
              className="me-2"
              onClick={() => {
                setProductSKU(row);
                setShowEditModal(true);
              }}
            >
              Create New Product
            </Button>
          </>
        ) : (
          <></>
        ),
      // <Button
      //   variant="outline-danger"
      //   className="me-2"
      //   onClick={() => {
      //     setSelectedProductSKUs([row._id]);
      //     setSelectedChannelAccounts([row.channel_account_id]);
      //     setSelectedVariant(row.variant_id);
      //     setShowLinkModal(true);
      //   }}
      // >
      //   Unlink Product
      // </Button>
      width: "180px",
    },
  ];
  const [showEditModal, setShowEditModal] = useState(false);

  // Section 1: Product SKU (Autofilled)
  const [productSKU, setProductSKU] = useState<Partial<newProductSKU>>({
    product_sku_id: "",
  });

  // Section 2: Products Array
  const [products, setProducts] = useState([
    { id: 1, name: "", weight: "", quantity: "", product_description: "" },
  ]);

  // Section 3: Product Pack
  const [productPack, setProductPack] = useState({
    name: "",
    length: "",
    breadth: "",
    width: "",
    weight: "",
  });

  const handleAddProduct = () => {
    const newId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    setProducts([
      ...products,
      {
        id: newId,
        name: "",
        weight: "",
        quantity: "",
        product_description: "",
      },
    ]);
  };

  const handleRemoveProduct = (id: number) => {
    if (products.length > 1) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleProductChange = (id: number, field: string, value: string) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleProductPackChange = (field: string, value: string) => {
    setProductPack({ ...productPack, [field]: value });
  };

  const handleSubmit = async () => {
    const formData = {
      productSKU,
      products,
      productPack,
    };

    await postNewProduct(formData);
    toast.success("Link created successfully");
    setRefresh(!refresh);
    setShowEditModal(false);
  };

  const handleReset = () => {
    setProducts([
      { id: 1, name: "", weight: "", quantity: "", product_description: "" },
    ]);
    setProductPack({
      name: "",
      length: "",
      breadth: "",
      width: "",
      weight: "",
    });
  };

  const calculateVolume = () => {
    const { length, breadth, width } = productPack;
    if (length && breadth && width) {
      return (
        parseFloat(length) *
        parseFloat(breadth) *
        parseFloat(width)
      ).toFixed(2);
    }
    return "N/A";
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Channel SKU Management</h4>
        <Button onClick={() => setShowModal(true)}>+ Link New Products</Button>
      </div>

      <DataTable
        title="Channel SKUs"
        columns={columns}
        data={unlinkedProducts}
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
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">
            Link Product SKUs to Channel Accounts
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Step 1: Select Product SKUs & Set Price */}
          <h5 className="mb-3 text-primary fw-semibold">
            🧾 Step 1: Select Product SKUs & Set Price
          </h5>
          <div
            className="row g-3 mb-4"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {productSKUs.map((sku) => {
              const isSelected = selectedProductSKUs.includes(sku._id);
              return (
                <div key={sku._id} className="col-md-6">
                  <div
                    className={`card p-3 shadow-sm border-2 rounded-3 ${
                      isSelected ? "border-primary bg-light" : "border-light"
                    }`}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      userSelect: "none",
                    }}
                    onClick={() => sku._id && handleProductSelect(sku._id)}
                  >
                    <div className="d-flex align-items-center mb-2">
                      <img
                        src={sku.product_sku_image}
                        alt={sku.product_sku_name}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginRight: "12px",
                        }}
                      />
                      <div className="flex-grow-1">
                        <strong>{sku.product_sku_name}</strong>
                        <p className="mb-0 text-muted">
                          <small>SKU ID: {sku.product_sku_id || "N/A"}</small>
                        </p>
                      </div>
                      {/* Instead of checkbox, show a nice checkmark icon when selected */}
                      {isSelected && (
                        <span
                          style={{
                            fontSize: "1.5rem",
                            color: "#0d6efd", // bootstrap primary color
                            userSelect: "none",
                          }}
                          aria-label="Selected"
                          title="Selected"
                        >
                          ✔️
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Form.Group className="mt-2">
                        <Form.Label className="small text-muted mb-1">
                          Enter Price (INR)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          className="form-control-sm"
                          value={(sku._id && skuPrices[sku._id]) || ""}
                          placeholder="e.g. 299"
                          onChange={(e) =>
                            sku._id &&
                            handlePriceChange(sku._id, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()} // prevent card toggle when editing price
                        />
                      </Form.Group>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 2: Select Channel Accounts */}
          <h5 className="mb-3 text-primary fw-semibold">
            📦 Step 2: Select Channel Accounts
          </h5>
          <div
            className="row g-3 mb-2"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            {channelAccounts.map((channel) => {
              const isSelected = selectedChannelAccounts.includes(channel._id);
              return (
                <div key={channel._id} className="col-md-6">
                  <div
                    className={`card p-3 shadow-sm border-2 rounded-3 ${
                      isSelected ? "border-primary bg-light" : "border-light"
                    }`}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      userSelect: "none",
                    }}
                    onClick={() =>
                      channel._id && handleChannelSelect(channel._id)
                    }
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{channel.channel_account_name}</strong>
                        <p className="mb-0 text-muted">
                          <small>Pool: {channel.pool_id?.name || "N/A"}</small>
                        </p>
                      </div>
                      {isSelected && (
                        <span
                          style={{
                            fontSize: "1.5rem",
                            color: "#0d6efd",
                            userSelect: "none",
                          }}
                          aria-label="Selected"
                          title="Selected"
                        >
                          ✔️
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal.Body>

        <Modal.Footer className="justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleLinkProduct}>
            Link Selected SKUs
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showLinkModal}
        onHide={handleHideLinkModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">Link Product SKU</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select Product SKU</Form.Label>
              <Form.Select
                onChange={(e) => setSelectedProductSKUs([e.target.value])}
                className="form-control-lg"
              >
                <option value="">Select a Product SKU</option>
                {productSKUs.map((sku) => (
                  <option key={sku._id} value={sku._id}>
                    {sku.product_sku_name} (SKU ID:{" "}
                    {sku.product_sku_id || "N/A"})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowLinkModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleLinkProduct}>
            Link SKU
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">
            📦 Create New Product
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Section 1: Product SKU (Autofilled) */}
          <div className="mb-4">
            <h5 className="mb-3 text-primary fw-semibold">
              🧾 Section 1: Product SKU
            </h5>
            <Card className="border-primary border-2 shadow-sm">
              <Card.Body>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">
                        Product SKU ID
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={productSKU.product_sku_id ?? ""}
                        onChange={(e) =>
                          setProductSKU((prev) => ({
                            ...prev,
                            product_sku_id: e.target.value,
                          }))
                        }
                        className="bg-light"
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">
                        Product SKU Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={productSKU?.product_name}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">
                        Product SKU Price
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={productSKU?.price}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Section 2: Products Array */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-primary fw-semibold mb-0">
                📋 Section 2: Products
              </h5>
              <Button variant="success" size="sm" onClick={handleAddProduct}>
                <i className="bi bi-plus-lg me-1"></i>
                Add Product
              </Button>
            </div>

            <div className="d-flex flex-column gap-3">
              {products.map((product, index) => (
                <Card key={product.id} className="border-2 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Badge bg="primary" className="px-3 py-2">
                        Product #{index + 1}
                      </Badge>
                      {products.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          <i className="bi bi-trash"></i> Remove
                        </Button>
                      )}
                    </div>

                    <div className="row g-3">
                      <div className="col-md-3">
                        <Form.Group>
                          <Form.Label className="small fw-semibold">
                            Product Name <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="e.g. Cotton T-Shirt"
                            value={product.name}
                            onChange={(e) =>
                              handleProductChange(
                                product.id,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </Form.Group>
                      </div>

                      <div className="col-md-3">
                        <Form.Group>
                          <Form.Label className="small fw-semibold">
                            Weight (gm) <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="e.g. 250"
                            value={product.weight}
                            onChange={(e) =>
                              handleProductChange(
                                product.id,
                                "weight",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.01"
                          />
                        </Form.Group>
                      </div>

                      <div className="col-md-3">
                        <Form.Group>
                          <Form.Label className="small fw-semibold">
                            Quantity <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="e.g. 10"
                            value={product.quantity}
                            onChange={(e) =>
                              handleProductChange(
                                product.id,
                                "quantity",
                                e.target.value
                              )
                            }
                            min="1"
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-3">
                        <Form.Group>
                          <Form.Label className="small fw-semibold">
                            Description <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter description..."
                            value={product.product_description}
                            onChange={(e) =>
                              handleProductChange(
                                product.id,
                                "product_description",
                                e.target.value
                              )
                            }
                          />
                        </Form.Group>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>

          {/* Section 3: Product Pack */}
          <div className="mb-3">
            <h5 className="mb-3 text-primary fw-semibold">
              📐 Section 3: Product Pack Dimensions
            </h5>
            <Card className="border-success border-2 shadow-sm">
              <Card.Body>
                <div className="row g-3">
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">
                        Product Pack Name
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. Shoes package"
                        value={productPack.name}
                        onChange={(e) =>
                          handleProductPackChange("name", e.target.value)
                        }
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">
                        Length (cm) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g. 30"
                        value={productPack.length}
                        onChange={(e) =>
                          handleProductPackChange("length", e.target.value)
                        }
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">
                        Breadth (cm) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g. 20"
                        value={productPack.breadth}
                        onChange={(e) =>
                          handleProductPackChange("breadth", e.target.value)
                        }
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">
                        Width (cm) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g. 5"
                        value={productPack.width}
                        onChange={(e) =>
                          handleProductPackChange("width", e.target.value)
                        }
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="small fw-semibold">
                        Weight (kg) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g. 0.5"
                        value={productPack.weight}
                        onChange={(e) =>
                          handleProductPackChange("weight", e.target.value)
                        }
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-light rounded">
                  <small className="text-muted">
                    <strong>📊 Calculated Volume:</strong> {calculateVolume()}{" "}
                    cm³
                  </small>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Modal.Body>

        <Modal.Footer className="justify-content-between">
          <Button variant="outline-secondary" onClick={handleReset}>
            Reset Form
          </Button>
          <div className="d-flex gap-2">
            <Button
              variant="outline-danger"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Create Product
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export { ChannelSKU };
