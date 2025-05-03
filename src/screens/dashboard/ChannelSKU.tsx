import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllProductSKUs } from "../../APIs/productSKU";
import { getAllChannelAccounts } from "../../APIs/channelAccount";
import { getAllOrders } from "../../APIs/order"; // API to fetch unlinked products
import { ProductSKU } from "./ProductSKUs";
import { ChannelAccount } from "./ChannelAccounts";
import { linkProductSkuToChannelAccount } from "../../APIs/productSKUChannelLink";


export type ProductChannelLink = {
  product_sku_id: string;
  channel_account_id: string;
  variant_id: string | null;
};

type newProductSKU = {
  _id: string;
  product_name: string;
  variant_id: string;
  price: number;
  quantity: number;
  channel_account_id: string;
  channel_account_name: string;
};

const ChannelSKU: React.FC = () => {
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [channelAccounts, setChannelAccounts] = useState<ChannelAccount[]>([]);
  const [unlinkedProducts, setUnlinkedProducts] = useState<newProductSKU[]>([]); // Unlinked products
  const [selectedProductSKUs, setSelectedProductSKUs] = useState<ProductSKU['_id'][]>([]);
  const [selectedChannelAccounts, setSelectedChannelAccounts] = useState<ChannelAccount['_id'][]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false); // Modal for linking a specific product
  const [selectedVariant, setSelectedVariant] = useState<newProductSKU['variant_id'] | null>(null); // Row being edited


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [productSKUsData, channelAccountsData, unlinkedProductsData] = await Promise.all([
        getAllProductSKUs(),
        getAllChannelAccounts(),
        getAllOrders(1, 1000, { nulledProductSKU: true }), // Fetch unlinked products from orders
      ]);
      setProductSKUs(productSKUsData);
      setChannelAccounts(channelAccountsData);
      setUnlinkedProducts(unlinkedProductsData["orders"]);
    } catch (error) {
      console.error("Error fetching initial data", error);
    }
  };

  const handleHideLinkModal = () => {
    setShowLinkModal(false);
  }

  const handleLinkProduct = async () => {
    if (selectedProductSKUs.length === 0 || selectedChannelAccounts.length === 0) {
      alert("Please select at least one Product SKU and one Channel Account.");
      return;
    }
    try {
      // Link each selected SKU to each selected channel account
      for (const skuId of selectedProductSKUs.filter((sku): sku is string => sku !== undefined)) {
        for (const channelId of selectedChannelAccounts.filter((channelId): channelId is string => channelId !== undefined)) {
          linkProductSkuToChannelAccount({
            product_sku_id: skuId,
            channel_account_id: channelId,
            variant_id: selectedVariant || null
          });

        }
      }
      alert("Product SKUs linked to Channel Accounts started!");
      // fetchInitialData(); // Refresh data
      setShowModal(false);
      setSelectedChannelAccounts([]);
      setSelectedProductSKUs([]);
      setSelectedVariant(null);
      setShowLinkModal(false);
    } catch (error) {
      console.error("Error linking Product SKUs to Channel Accounts", error);
      alert("Failed to link Product SKUs to Channel Accounts.");
    }
  };

  const columns = [
    {
      name: "Product Name",
      selector: (row: newProductSKU) => row.product_name || "N/A",
      sortable: true,
      wrap: true,
      style: {
        margin: "10px 0",
      },
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
      name: "Price (INR)",
      selector: (row: newProductSKU) => `₹${row.price || "0.00"}`,
      sortable: true,
    },
    {
      name: "Quantity",
      selector: (row: newProductSKU) => row.quantity || 0,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: newProductSKU) => (
        <>
          <Button
            variant="outline-success"
            size="lg"
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
        </>
      ),
      width: "180px",
    },
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Channel SKU Management</h4>
        <Button onClick={() => setShowModal(true)}>+ Link New Products</Button>
      </div>

      {/* Unlinked Products Table */}
      <h5>Unlinked Products</h5>
      <DataTable
        title="Unlinked Products"
        data={unlinkedProducts}
        columns={columns}
        highlightOnHover
        pagination
        paginationRowsPerPageOptions={[10, 20, 50]}
        responsive
        striped
        persistTableHead
      />

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">Link Product SKUs to Channel Accounts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="mb-4">
              <h5 className="text-secondary">Step 1: Select Product SKUs</h5>
              <Form.Group>
                <Form.Label className="fw-bold">Product SKUs</Form.Label>
                <Form.Select
                  multiple
                  value={selectedProductSKUs.filter((sku): sku is string => sku !== undefined)}
                  onChange={(e) =>
                    setSelectedProductSKUs(
                      Array.from(e.target.selectedOptions, (option) => option.value)
                    )
                  }
                  className="form-control-lg"
                >
                  {productSKUs.map((productSKU) => (
                    <option key={productSKU._id} value={productSKU._id}>
                      {productSKU.product_sku_name} (SKU ID: {productSKU.product_sku_id || "N/A"})
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Hold <kbd>Ctrl</kbd> (Windows) or <kbd>Cmd</kbd> (Mac) to select multiple SKUs.
                </Form.Text>
              </Form.Group>
            </div>

            <div className="mb-4">
              <h5 className="text-secondary">Step 2: Select Channel Accounts</h5>
              <Form.Group>
                <Form.Label className="fw-bold">Channel Accounts</Form.Label>
                <Form.Select
                  multiple
                  value={selectedChannelAccounts.filter((id): id is string => id !== undefined)}
                  onChange={(e) =>
                    setSelectedChannelAccounts(
                      Array.from(e.target.selectedOptions, (option) => option.value)
                    )
                  }
                  className="form-control-lg"
                >
                  {channelAccounts.map((channel) => (
                    <option key={channel._id} value={channel._id}>
                      {channel.channel_account_name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Hold <kbd>Ctrl</kbd> (Windows) or <kbd>Cmd</kbd> (Mac) to select multiple accounts.
                </Form.Text>
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleLinkProduct}>
            Link Selected SKUs
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Linking a Specific Product */}
      <Modal show={showLinkModal} onHide={handleHideLinkModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">Link Product SKU</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select Product SKU</Form.Label>
              <Form.Select
                // value={selectedSKU}
                onChange={(e) => setSelectedProductSKUs([e.target.value])}
                className="form-control-lg"
              >
                <option value="">Select a Product SKU</option>
                {productSKUs.map((sku) => (
                  <option key={sku._id} value={sku._id}>
                    {sku.product_sku_name} (SKU ID: {sku.product_sku_id || "N/A"})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowLinkModal(false)}>
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