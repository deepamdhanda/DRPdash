import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { toast } from "react-toastify";
import { createScanOrder, getAllScanOrders } from "../../APIs/user/scanOrder";
import DataTable from "react-data-table-component";
// import CameraCapture from "./camera";

export interface ScanOrder {
  _id: string;
  requested_barcodes: string[];
  requested_status: string;
  updated_orders: string[];
  skipped_orders: string[];
  created_by: { _id: string; name: string };
  createdAt?: string;
}

const ScanOrders: React.FC = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDamageReportingModal, setShowDamageReportingModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [scanOrders, setScanOrders] = useState<ScanOrder[]>([]);
  const [pickupDate, setPickupDate] = useState<Date>();
  const [issueType, setIssueType] = useState('');
  const [damagedAWB, setDamagedAWB] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueImages, setIssueImages] = useState<File[] | null>(null);

  // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setIssueImages(e.target.files);
  // };

  // Load the scanning sound
  const scanningSound = new Audio("/scanner-beep.mp3"); // Place the sound file in the public folder

  useEffect(() => {
    fetchInitialData();
    setIssueImages(null)
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [scanOrdersData] = await Promise.all([getAllScanOrders()]);
      setScanOrders(scanOrdersData);
    } catch (error) {
      console.error("Error loading pools or users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartScanning = () => {
    setShowScanner(true); // Open the scanner modal
  };
  const handleDamageReporting = () => {
    setShowDamageReportingModal(true)
  }
  const handleCloseScanner = () => {
    setScannedBarcodes([]); // Clear the scanned barcodes
    setShowScanner(false); // Close the scanner modal
  };

  const handleBarcodeDetected = (result: any) => {
    if (result && !scannedBarcodes.includes(result.text)) {
      setScannedBarcodes((prev) => [...prev, result.text]); // Add barcode to the list
      scanningSound.play(); // Play the scanning sound
    }
  };

  const handleFinishScanning = () => {
    setShowScanner(false); // Close the scanner modal
    setShowStatusModal(true); // Open the status modal
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value); // Update selected status
  };

  const handleUpdateOrders = async () => {
    try {
      // Call the update order function with the scanned barcodes and selected status
      toast.success(
        "Updating orders:" + scannedBarcodes + " to status:" + selectedStatus
      );
      if (await createScanOrder({ ids: scannedBarcodes, selectedStatus, pickup_date: selectedStatus === "ready_for_pickup" ? pickupDate : undefined })) {
        fetchInitialData();
      }

      setScannedBarcodes([]); // Clear the scanned barcodes
      setSelectedStatus(""); // Reset the selected status
      setShowStatusModal(false); // Close the status modal
    } catch (error) {
      toast.error("Error updating orders:" + error);
    }
  };

  const handleToggleStatus = (row: any) => {
    console.log("Toggling status for order:", row);
  };

  const columns = [
    {
      name: "Date and Time",
      cell: (row: ScanOrder) => (
        <>
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            : "—"}
          <br />
          {row.createdAt
            ? new Date(row.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "—"}
        </>
      ),
      sortable: true,
    },
    {
      name: "Created By",
      selector: (row: ScanOrder) => row.created_by.name || "—",
      wrap: true,
    },
    {
      name: "Requested Status",
      selector: (row: ScanOrder) =>
        row.requested_status.replace(/_/g, " ").toUpperCase() || "—",
      minWidth: "150px",
    },
    {
      name: "Barcodes Scanned",
      cell: (row: ScanOrder) => (
        <div>
          Total:{" "}
          <span className={"text-primary"}>
            {row.requested_barcodes.length}
          </span>
          <br />
          Updated:{" "}
          <span className={"text-success"}>{row.updated_orders.length}</span>
          <br />
          Skipped:{" "}
          <span className={"text-danger"}>{row.skipped_orders.length}</span>
          <br />
        </div>
      ),
      minWidth: "200px",
    },
    {
      name: "Actions",
      cell: (row: ScanOrder) => (
        <>
          <Button
            variant={"outline-success"}
            size="sm"
            onClick={() => handleToggleStatus(row)}
          >
            Edit
          </Button>
        </>
      ),
      width: "180px",
    },
  ];

  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Orders</h4>
        <div>
          <Button onClick={handleDamageReporting} variant="danger" className="me-2">
            Report Damage
          </Button>
          <Button onClick={handleStartScanning} className="me-2">
            Scan Orders
          </Button>
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : scanOrders.length === 0 ? (
        <p>No Scan Orders found.</p>
      ) : (
        <DataTable
          title="Your Pools"
          data={scanOrders}
          columns={columns as any}
          highlightOnHover
          pagination
          paginationRowsPerPageOptions={[10, 20, 50, 100, 200, 500, 1000]}
          responsive
          striped
          persistTableHead
        />
      )}

      {/* Barcode Scanner Modal */}
      <Modal show={showScanner} onHide={handleCloseScanner} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scan Barcodes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="scanner-container">
            <BarcodeScannerComponent
              width="100%"
              height="100%"
              onUpdate={(err: any, result: any) => {
                if (result) {
                  handleBarcodeDetected(result);
                }
                if (err) {
                }
              }}
            />
            <div className="scanner-overlay">
              <div className="scanner-box"></div>
            </div>
          </div>
          <Form.Group className="mb-3">
            <Form.Label>Enter Maunally</Form.Label>
            <Form.Control type="number" name="barcode" />
            <Button
              variant="primary"
              className="mt-2"
              onClick={() => {
                const barcodeInput = document.querySelector(
                  'input[name="barcode"]'
                ) as HTMLInputElement;
                if (barcodeInput && barcodeInput.value) {
                  const barcode = barcodeInput.value.trim();
                  if (!scannedBarcodes.includes(barcode)) {
                    setScannedBarcodes((prev) => [...prev, barcode]);
                    scanningSound.play(); // Play the scanning sound
                    barcodeInput.value = ""; // Clear the input field
                  } else {
                    toast.warn("Barcode already scanned.");
                  }
                }
              }}
            >
              Add Barcode
            </Button>
          </Form.Group>
          <div className="mt-3">
            <h6>Scanned Barcodes:</h6>
            <ul>
              {scannedBarcodes.map((barcode, index) => (
                <li key={index}>{barcode}</li>
              ))}
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseScanner}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleFinishScanning}
            disabled={scannedBarcodes.length === 0}
          >
            Finish Scanning
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Status Selection Modal */}
      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select Status</Form.Label>
              <Form.Select value={selectedStatus} onChange={handleStatusChange}>
                <option value="">Select a status</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="picked_up">Picked Up</option>
                <option value="rto_recieved">RTO Recieved</option>
                <option value="return_recieved">Return Recieved</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
            {
              selectedStatus === "ready_for_pickup"
              && (
                <Form.Group>
                  <Form.Label>Select Status</Form.Label>
                  <Form.Control className="form-control" type="date" onChange={(e) => {
                    setPickupDate(new Date(e.target.value))
                  }}
                    max={new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split("T")[0]}
                    min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0]}
                    // defaultValue={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0]}
                    placeholder="Enter Pickup Date" />
                </Form.Group>
              )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateOrders}
            disabled={!selectedStatus}
          >
            Update Orders
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDamageReportingModal}
        onHide={() => setShowDamageReportingModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>

            <Form.Group className="mb-3">
              <Form.Label>AWB No./Order Id</Form.Label>
              <Form.Control
                type="text"
                placeholder="AWB No./Order Id"
                value={damagedAWB}
                onChange={(e) => setDamagedAWB(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Issue Type</Form.Label>
              <Form.Select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
              >
                <option value="">Select Issue</option>
                <option value="wrong_product">Wrong Product Received</option>
                <option value="damaged_product">Damaged Product</option>
                <option value="tampered_package">Tampered Package</option>
                <option value="empty_package">Empty Package</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add details about the issue..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Upload Images (Max 5)</Form.Label>
              {/* <CameraCapture images={issueImages} setImages={setIssueImages} /> */}

              {issueImages && issueImages?.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {Array.from(issueImages).map((img: any, idx: any) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(img)}
                      alt={`upload-${idx}`}
                      width={80}
                      height={80}
                      style={{ objectFit: "cover", borderRadius: "8px" }}
                    />
                  ))}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateOrders}
            disabled={!selectedStatus || (selectedStatus === "wrong_damaged" && (!issueType || !issueDescription))}
          >
            Update Orders
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export { ScanOrders };
