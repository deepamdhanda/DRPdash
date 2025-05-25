import React, { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllWallets, makePayment } from "../../APIs/wallet";
import { getAllPools } from "../../APIs/pool";
import { Pool } from "./Pools";

export interface User {
  _id: string;
  name: string;
}

export interface Wallet {
  order_id: {
    order_id: string;
    channel_id: {
      channel_account_name: string;
      pool_id: {
        name: string;
      };
    };
  };
  created_by: User;
  charged_weight: number;
  zone: string;
  freight_charge: number;
  commission: number;
  cod_charges: number;
  total_amount: number;
  cr_dr: string; // "CR" or "DR"
  createdAt: string;
  _id: string;
}

const Wallets: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [selectedPool, setSelectedPool] = useState<string>("");
  const [pools, setPools] = useState<Pool[]>([]);

  useEffect(() => {
    fetchWallets();
    fetchPools();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await getAllWallets();
      setWallets(data);
    } catch (error) {
      console.error("Error fetching wallets", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPools = async () => {
    try {
      setPools(await getAllPools());
    } catch (error) {
      console.error("Error fetching pools", error);
    }
  };

  const handleAddMoney = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setAmount(0);
    setSelectedPool("");
  };

  const handlePayment = async () => {
    try {
      makePayment(amount, selectedPool)
    } catch (error) {
      console.error("Error during payment:", error);
    }
  };


  const columns = [
    {
      name: "Order ID",
      cell: (row: Wallet) => (
        <>
          <strong>#{row.order_id.order_id}</strong>
        </>
      ),
      sortable: true,
    },
    {
      name: "Account Details",
      cell: (row: Wallet) => (
        <div>
          <strong>{row.order_id.channel_id.channel_account_name}</strong>
          <br />
          <span style={{ fontSize: 10, textDecoration: "underline" }}>
            {row.order_id.channel_id.pool_id.name}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Created By",
      selector: (row: Wallet) => row.created_by?.name || "—",
    },
    {
      name: "Charged Weight",
      selector: (row: Wallet) => row.charged_weight + " gms" || "—",
    },
    {
      name: "Zone",
      selector: (row: Wallet) =>
        row.zone.replace("z_", "").toUpperCase() || "—",
      sortable: true,
    },
    {
      name: "Charges",
      selector: (row: Wallet) => {
        const clr = row.cr_dr == "DR" ? "red" : "green";
        const sign = row.cr_dr == "DR" ? "" : "";
        return (
          <div>
            Freight:{" "}
            <span style={{ color: clr }}>
              {sign}₹{(row.freight_charge + row.commission).toFixed(2)}
            </span>{" "}
            <br />
            {row.cod_charges > 0 && (
              <>
                COD:{" "}
                <span style={{ color: clr }}>
                  {sign}₹{row.cod_charges}
                </span>{" "}
                <br />
              </>
            )}
            Other:{" "}
            <span style={{ color: clr }}>
              {sign}₹
              {(row.total_amount - row.freight_charge - row.cod_charges).toFixed(
                2
              )}
            </span>{" "}
            <br />
          </div>
        );
      },
      width: "200px",
      sortable: true,
      wrap: true,
    },
    {
      name: "Total",
      selector: (row: Wallet) => {
        const clr = row.cr_dr == "DR" ? "red" : "green";
        const sign = row.cr_dr == "DR" ? "-" : "+";
        return (
          <div>
            <span style={{ color: clr }}>
              {sign} ₹{row.total_amount.toFixed(2)}
            </span>{" "}
            <br />
          </div>
        );
      },
      width: "200px",
      sortable: true,
      wrap: true,
    },
    {
      name: "Created On",
      selector: (row: Wallet) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          : "—",
    },
  ];

  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Wallets</h4>
        <Button onClick={handleAddMoney}>+ Add Money</Button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : wallets.length === 0 ? (
        <p>No wallets found.</p>
      ) : (
        <DataTable
          title="Your Wallets"
          data={wallets}
          columns={columns as any}
          highlightOnHover
          pagination
          paginationRowsPerPageOptions={[10, 20, 50]}
          responsive
          striped
          persistTableHead
          progressPending={wallets.length === 0}
        />
      )}

      {/* Add Money Modal */}
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
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Select Pool</Form.Label>
              <Form.Select
                value={selectedPool}
                onChange={(e) => setSelectedPool(e.target.value)}
              >
                <option value="">Select a pool</option>
                {pools.map((pool) => (
                  <option key={pool._id} value={pool._id}>
                    {pool.name} (₹{(pool?.wallet_balance)?.toFixed(2) || 0})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePayment}
            disabled={!amount || !selectedPool}
          >
            Proceed to Pay
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export { Wallets };
