import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { getAllCODRemittances } from "../../APIs/user/codRemittance";
import { Button, Modal, Form } from "react-bootstrap";
import { transferPayment } from "../../APIs/user/wallet";

export interface User {
  _id: string;
  name: string;
}

export interface CODRemittance {
  _id: string;
  pool_name: string;
  totalAmount: number;
  remittanceDate: Date;
  status: string;
  masked_account_number: string;
  createdAt: string;
  orders: {
    order_id: string;
    channel_order_id: string;
    store_order_id: string;
    amount: number;
    awb_number?: string;
    courier_name?: string;
    channel_account_name?: string;
    product_sku_id?: string;
    product_sku_name?: string;
  }[];
  transfers: [any];
}

const CODRemittances: React.FC = () => {
  const [cod_remittances, setCODRemittances] = useState<CODRemittance[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [remittanceId, setRemittanceId] = useState("");

  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Fetch COD remittances whenever page/limit changes
  useEffect(() => {
    fetchInitialData(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const fetchInitialData = async (pageParam = page, limitParam = limit) => {
    setLoading(true);
    try {
      const cod_remittancesData = await getAllCODRemittances(
        pageParam,
        limitParam
      );
      // expected: { total: number, data: CODRemittance[] }
      setTotalRecords(cod_remittancesData.total);
      setCODRemittances(
        cod_remittancesData.data.map((remittance: any) => ({
          ...remittance,
          transfers: Array.isArray(remittance.transfers)
            ? remittance.transfers
            : [],
        }))
      );
    } catch (error) {
      console.error("Error loading cod_remittances or users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setAmount(0);
    setMaxAmount(0);
  };

  const handlePayment = async () => {
    try {
      const res = await transferPayment(amount, remittanceId);
      if (res) {
        fetchInitialData();
        handleModalClose();
      }
    } catch (error) {
      console.error("Error during payment:", error);
    }
  };

  const columns = [
    {
      name: "Pool Name",
      selector: (row: CODRemittance) => <strong>{row.pool_name || "—"}</strong>,
      sortable: true,
    },
    {
      name: "No. of Orders",
      selector: (row: CODRemittance) => row.orders?.length || 0,
      sortable: true,
    },
    {
      name: "Bank Details",
      selector: (row: CODRemittance) => row.masked_account_number || "NA",
      sortable: true,
    },
    {
      name: "Remittance Date",
      selector: (row: CODRemittance) =>
        row.remittanceDate
          ? new Date(row.remittanceDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row: CODRemittance) => row.totalAmount,
      cell: (row: CODRemittance) => {
        const totalTrensfered = row?.transfers?.reduce(
          (sum: number, i: any) => sum + i.amount,
          0
        );
        const totalAmount = row?.orders?.reduce(
          (sum: number, i: any) => sum + i.amount,
          0
        );
        return (
          <div style={{ textAlign: "right" }}>
            <strong>Total:</strong> ₹{totalAmount.toFixed(2) || "—"} <br />
            {row.transfers?.length > 0 && (
              <div>
                <strong>
                  Paid: {"\n"}
                  <span
                    style={{ color: "#f5891e", textDecoration: "underline" }}
                  >
                    ₹{totalTrensfered.toFixed(2) || "—"}{" "}
                  </span>
                </strong>
                <br />
                {totalAmount - totalTrensfered > 0 && (
                  <div>
                    <strong> Pending:</strong> ₹
                    {(totalAmount - totalTrensfered).toFixed(2) || "—"}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      },
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: CODRemittance) => row.status || "—",
      sortable: true,
      cell: (row: CODRemittance) => (
        <span
          className={`badge ${
            row.status === "pending"
              ? "bg-warning"
              : row.status === "completed"
              ? "bg-success"
              : row.status === "processing"
              ? "bg-primary"
              : "bg-secondary"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Action",
      cell: (row: CODRemittance) => {
        const totalTrensfered = row?.transfers?.reduce(
          (sum: number, i: any) => sum + i.amount,
          0
        );
        const totalAmount = row?.orders?.reduce(
          (sum: number, i: any) => sum + i.amount,
          0
        );
        return (
          totalAmount - totalTrensfered > 0 && (
            <Button
              size="sm"
              onClick={() => {
                setShowModal(true);
                setMaxAmount(totalAmount - totalTrensfered);
                setRemittanceId(row._id);
              }}
            >
              {" "}
              Wallet Transfer
            </Button>
          )
        );
      },
    },
  ];

  const ExpandedComponent = ({ data: row }: any) => {
    const orderColumns = [
      {
        name: "Order Id",
        selector: (row: CODRemittance["orders"][number]) => row.order_id,
        cell: (row: CODRemittance["orders"][number]) => (
          <>#{row.order_id || "—"} </>
        ),
        sortable: true,
      },
      {
        name: "Channel Details",
        selector: (row: CODRemittance["orders"][number]) => row.store_order_id,
        cell: (row: CODRemittance["orders"][number]) => (
          <div>
            <strong>Channel OID:</strong> {row.channel_order_id || "—"} <br />
            <strong>
              Store OID: {"\n"}
              <span style={{ color: "#f5891e", textDecoration: "underline" }}>
                {row.store_order_id || "—"}{" "}
              </span>
            </strong>
            <br />
            <strong>Channel:</strong> {row.channel_account_name || "—"}
          </div>
        ),
        sortable: true,
      },
      {
        name: "AWB Number",
        selector: (row: CODRemittance["orders"][number]) => row.courier_name,
        cell: (row: CODRemittance["orders"][number]) => (
          <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
            {row?.courier_name || "—"} <br />
            🚚{"\n"}
            <span style={{ color: "#f5891e", textDecoration: "underline" }}>
              {" "}
              {row.awb_number || "—"}{" "}
            </span>
          </div>
        ),
        sortable: true,
      },
      {
        name: "Product",
        selector: (row: CODRemittance["orders"][number]) => row.product_sku_id,
        cell: (row: CODRemittance["orders"][number]) => (
          <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
            {row?.product_sku_name || "—"} <br />
            <span style={{ color: "#f5891e", textDecoration: "underline" }}>
              {row.product_sku_id || ""}
            </span>
          </div>
        ),
        sortable: true,
      },
      {
        name: "Total Amount",
        selector: (row: CODRemittance["orders"][number]) =>
          `₹${row.amount || 0}`,
        sortable: true,
      },
    ];

    const transfersColumns = [
      {
        name: "Transfer Mode",
        selector: (row: CODRemittance["transfers"][number]) => row.transferMode,
        sortable: true,
      },
      {
        name: "Transfer ID",
        selector: (row: CODRemittance["transfers"][number]) => row.transferId,
        sortable: true,
      },
      {
        name: "Total Amount",
        selector: (row: CODRemittance["transfers"][number]) =>
          `₹${row.amount || 0}`,
        sortable: true,
      },
      {
        name: "Total Date",
        selector: (row: CODRemittance["transfers"][number]) =>
          `${row.transferDate.split("T")[0] || 0}`,
        sortable: true,
      },
    ];
    return (
      <div
        style={{
          padding: "15px",
          backgroundColor: "#f0f0f0",
          borderLeft: "4px solid #F5891E",
          margin: "10px 0",
          fontSize: "0.9rem",
          color: "#333",
        }}
      >
        <h6>Transfers:</h6>
        <div style={{ margin: 10 }}>
          {row.transfers && (
            <DataTable
              data={row.transfers}
              columns={transfersColumns as any}
              responsive
            />
          )}
        </div>
        <h6>Orders:</h6>
        <div style={{ margin: 10 }}>
          <DataTable
            data={row.orders}
            columns={orderColumns as any}
            responsive
          />
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>COD Remittances</h4>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : cod_remittances.length === 0 ? (
        <p>No cod remittances found.</p>
      ) : (
        <DataTable
          title="Your COD Remittances"
          data={cod_remittances}
          columns={columns as any}
          highlightOnHover
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
          paginationRowsPerPageOptions={[10, 20, 50, 100, 200, 500, 1000]}
          responsive
          striped
          persistTableHead
          expandableRows
          expandableRowsComponent={ExpandedComponent}
        />
      )}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Money to Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={amount}
                max={maxAmount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePayment} disabled={!amount}>
            Proceed to Pay
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export { CODRemittances };
