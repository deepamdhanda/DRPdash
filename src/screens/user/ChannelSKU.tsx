import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllProductSKUs } from "../../APIs/user/productSKU";
import { getAllChannelAccounts } from "../../APIs/user/channelAccount";
import { ProductSKU } from "./ProductSKUs";
import { ChannelAccount } from "./ChannelAccounts";
import {
  linkProductSkuToChannelAccount,
  getUnlinkedProductSku,
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
};

const ChannelSKU: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [channelAccounts, setChannelAccounts] = useState<ChannelAccount[]>([]);
  const [unlinkedProducts, setUnlinkedProducts] = useState<newProductSKU[]>([]);
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
  }, [page, limit]);

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
      setChannelAccounts(channelAccountsData);
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
            {/* <Button
              variant="outline-primary"
              className="me-2"
              onClick={() => {
                setSelectedProductSKUs([row._id]);
                setSelectedChannelAccounts([row.channel_account_id]);
                setSelectedVariant(row.variant_id);
                setShowLinkModal(true);
              }}
            >
              Create New Product
            </Button> */}
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

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Channel SKU Management</h4>
        <Button onClick={() => setShowModal(true)}>+ Link New Products</Button>
      </div>
      {/* <DataTable
        title="Channel SKUs"
        data={unlinkedProducts}
        columns={columns}
        highlightOnHover
        pagination
        paginationRowsPerPageOptions={[10, 20, 50, 100, 200, 500, 1000]}
        responsive
        striped
        persistTableHead
      /> */}

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
    </div>
  );
};

export { ChannelSKU };
