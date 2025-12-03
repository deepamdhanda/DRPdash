import React, { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import DataTable, { TableColumn } from "react-data-table-component";
import {
  getAllWallets,
  getAllWalletsRecharges,
  makePayment,
} from "../../APIs/user/wallet";
import { getAllPools } from "../../APIs/user/pool";
import moment from "moment";

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

enum EnumWalletTabs {
  WALLET_TRANSACTIONS = "wallet_transactions",
  WALLET_RECHARGE = "wallet_recharge_history",
}
export type TWalletRecharge = {
  _id: string;
  pool_id: string;
  amount: number;
  razorpay_order_id: string;
  created_by: string;
  status: "pending" | "paid" | "failed"; // Assuming these are possible statuses
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  razorpay_payment_id?: string;
  full_details?: any;
};

const WalletTransactionsComponent = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const fetchWalletTransactions = async () => {
    try {
      setLoading(true);
      const data = await getAllWallets(page, limit);
      setWallets(data.data);
      setTotalRecords(data.total);
    } catch (error) {
      console.error("Error fetching wallets", error);
    } finally {
      setLoading(false);
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
        (row.zone || "").replace("z_", "").toUpperCase() || "—",
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
              {(
                row.total_amount -
                row.freight_charge -
                row.cod_charges
              ).toFixed(2)}
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
  useEffect(() => {
    fetchWalletTransactions();
  }, [page, limit]);
  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : wallets.length === 0 ? (
        <p>No wallets Transactions found.</p>
      ) : (
        // <DataTable
        //   title="Your Wallet Transactions"
        //   data={wallets}
        //   columns={columns as any}
        //   highlightOnHover
        //   pagination
        //   paginationRowsPerPageOptions={[10, 20, 50, 100, 200, 500, 1000]}
        //   responsive
        //   striped
        //   persistTableHead
        //   progressPending={wallets.length === 0}
        // />
        <DataTable
          title="Your Wallet Transactions"
          columns={columns as any}
          data={wallets}
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
      )}
    </>
  );
};

const WalletRechargeComponent = ({ pools }: { pools: any }) => {
  const [walletRecharges, setwalletRecharges] = useState<TWalletRecharge[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [transactionId, setTransactionId] = useState("");
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [dateRange, setDateRange] = useState({
    from: moment().subtract(1, "month").toDate(),
    to: moment().toDate(),
  });
  const columns: TableColumn<TWalletRecharge>[] = [
    {
      name: "#",
      selector: (_row: any, index: any) => index + 1,
      width: "60px",
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row: TWalletRecharge) => `₹${(row.amount / 100).toFixed(2)}`,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: TWalletRecharge) => row.status,
      sortable: true,
      cell: (row: TWalletRecharge) => (
        <span style={{ color: row.status === "paid" ? "green" : "orange" }}>
          {row.status.toUpperCase()}
        </span>
      ),
    },
    {
      name: "Order ID",
      selector: (row: TWalletRecharge) => row._id,
      sortable: true,
    },
    {
      name: "Payment ID",
      selector: (row: TWalletRecharge) => row.razorpay_payment_id ?? "—",
    },
    {
      name: "Created At",
      selector: (row: TWalletRecharge) =>
        new Date(row.createdAt).toLocaleString(),
    },
    {
      name: "Updated At",
      selector: (row: TWalletRecharge) =>
        new Date(row.updatedAt).toLocaleString(),
    },
  ];
  const fetchWalletsRecharges = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await getAllWalletsRecharges(
        page,
        limit,
        transactionId,
        selectedPoolId,
        dateRange.from,
        dateRange.to
      );
      if (response) {
        setwalletRecharges(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching wallets", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce only transactionId
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        fetchWalletsRecharges(pagination.page, pagination.limit);
      },
      transactionId ? 500 : 0
    );

    return () => {
      clearTimeout(timeoutId);
    };
  }, [transactionId]);

  // Fetch immediately when dateRange changes

  return (
    <div style={{ padding: "20px" }}>
      <div className="row ">
        <div className="col-md-3">
          <label htmlFor="">Transaction Id</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search Transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="">Select Pool</label>

          <select
            name=""
            value={selectedPoolId}
            id=""
            className="form-select"
            onChange={(e) => setSelectedPoolId(e.target.value)}
          >
            <option value="">All Pools</option>
            {pools.map((pool: any) => {
              return <option value={pool._id}>{pool.name}</option>;
            })}
          </select>
        </div>
        <div className="col-md-3">
          <label>Start Date</label>
          <input
            type="date"
            className="form-control"
            value={moment(dateRange.from).format("YYYY-MM-DD")}
            onChange={(e) =>
              setDateRange((old) => ({
                ...old,
                from: moment(e.target.value).toDate(),
              }))
            }
          />
        </div>
        <div className="col-md-3">
          <label>End Date</label>
          <input
            type="date"
            className="form-control"
            value={moment(dateRange.to).format("YYYY-MM-DD")}
            onChange={(e) =>
              setDateRange((old) => ({
                ...old,
                to: moment(e.target.value).toDate(),
              }))
            }
          />
        </div>
        <div className="text-end">
          <Button
            className="mt-2 "
            onClick={() => {
              fetchWalletsRecharges(1, pagination.limit);
            }}
          >
            Apply Filter
          </Button>
        </div>
      </div>
      <DataTable
        title="Wallet Recharge History"
        columns={columns}
        data={walletRecharges}
        progressPending={loading}
        pagination
        paginationServer
        paginationTotalRows={pagination.limit}
        paginationDefaultPage={pagination.page}
        onChangePage={(newPage) => {
          fetchWalletsRecharges(newPage, pagination.limit);
        }}
        onChangeRowsPerPage={(newPerPage, newPage) => {
          fetchWalletsRecharges(newPage, newPerPage);
        }}
        striped
        highlightOnHover
        persistTableHead
      />
    </div>
  );
};

const Wallets: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EnumWalletTabs>(
    EnumWalletTabs.WALLET_TRANSACTIONS
  );
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [selectedPool, setSelectedPool] = useState<string>("");
  const [pools, setPools] = useState<any>([]);

  const fetchPools = async () => {
    try {
      setPools((await getAllPools()).data);
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
      const res = await makePayment(amount, selectedPool);
      if (res) {
        handleModalClose();
        fetchPools(); // Refresh pools after payment
      }
    } catch (error) {
      console.error("Error during payment:", error);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex ">
          {Object.entries(EnumWalletTabs).map(([tab_key, tab_value]) => {
            return (
              <div
                role="button"
                onClick={() => setActiveTab(tab_value)}
                key={tab_key}
                className={`me-3 fs-5 ${
                  activeTab === tab_value
                    ? "text-decoration-underline "
                    : "text-secondary"
                }`}
              >
                {tab_key.replace("_", " ")}
              </div>
            );
          })}
        </div>
        <Button onClick={handleAddMoney}>+ Add Money</Button>
      </div>
      {activeTab === EnumWalletTabs.WALLET_TRANSACTIONS && (
        <WalletTransactionsComponent />
      )}
      {activeTab === EnumWalletTabs.WALLET_RECHARGE && (
        <WalletRechargeComponent pools={pools} />
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
                {pools.map((pool: any) => (
                  <option key={pool._id} value={pool._id}>
                    {pool.name} (₹{pool?.wallet_balance?.toFixed(2) || 0})
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
