import React, { useEffect, useState } from "react";
import { getAllPools, updatePool } from "../../APIs/user/pool";
import { toast } from "react-toastify";
import CustomDataTable from "../../components/DataTable";
import PoolModal from "../../components/pools/PoolModal";
import { AnimatePresence } from "framer-motion";

/* --- Types --- */
export interface User {
  _id: string;
  name: string;
}

export type Owner = {
  full_name?: string;
  email?: string;
  phone?: string;
};

export type Pool = {
  _id: string;
  name: string;
  status: string;
  admins?: User[];
  wallet_balance?: number;
  created_by?: { name: string };
  createdAt?: string;
  company_type?: string;
  owner?: Owner;
  website?: string;
  business_logo?: string | File | null;
  bank_details?: {
    account_number?: string;
    ifsc?: string;
    holder_name?: string;
    cheque?: string | File | null;
    approval_status?: string;
    status_message?: string;
  };
  kyc_documents?: any[];
  gstin?: string;
  address?: string;
  state?: string;
  kyc_status: string;
};

export const Pools: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  // const limit = 10;
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [page, limit]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const poolsData = await getAllPools(page, limit);
      setPools(poolsData.data);
      setTotalRecords(poolsData.total);
    } catch (error) {
      toast.error("Failed to load pools");
    } finally {
      setLoading(false);
    }
  };

  const openNewPoolModal = () => {
    setEditingPool(null);
    setShowModal(true);
  };

  const handleEdit = (pool: Pool) => {
    setEditingPool(pool);
    setShowModal(true);
  };

  const handleToggleStatus = async (pool: Pool) => {
    const newStatus = pool.status === "active" ? "inactive" : "active";
    if (window.confirm(`Mark this pool as ${newStatus}?`)) {
      try {
        await updatePool(pool._id, { status: newStatus });
        fetchInitialData();
        toast.success(`Pool status updated to ${newStatus}`);
      } catch {
        toast.error("Failed to update status");
      }
    }
  };

  const columns = [
    {
      name: "Pool Name",
      selector: (row: Pool) => row.name,
      sortable: true,
      cell: (row: Pool) => (
        <div className="flex items-center py-2.5">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 font-semibold text-base hover:text-blue-800 hover:underline transition-colors focus:outline-none"
          >
            {row.name}
          </button>
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row: Pool) => row.status,
      sortable: true,
      cell: (row: Pool) => {
        const styles: Record<string, string> = {
          active: "bg-green-100 text-green-700 border-green-200",
          inactive: "bg-gray-100 text-gray-700 border-gray-200",
          warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
        };
        const currentStatus = row.status?.toLowerCase() || "inactive";
        const badgeStyle = styles[currentStatus] || styles.warning;

        return (
          <div className="flex items-center py-2">
            <span
              className={`px-3.5 py-1.5 text-xs font-bold tracking-wide rounded-full border ${badgeStyle} capitalize shadow-sm`}
            >
              {row.status}
            </span>
          </div>
        );
      },
    },
    {
      name: "Wallet",
      selector: (row: Pool) => row.wallet_balance || 0,
      sortable: true,
      cell: (row: Pool) => {
        const hasBalance = row.wallet_balance && row.wallet_balance > 0;
        return (
          <div className="flex items-center py-2">
            <span
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full border shadow-sm ${
                hasBalance
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              ₹{row.wallet_balance?.toFixed(2) || "0.00"}
            </span>
          </div>
        );
      },
    },
    {
      name: "Created By",
      selector: (row: Pool) => row.created_by?.name || "Unknown",
      cell: (row: Pool) => (
        <div className="py-3 font-medium text-gray-700 text-sm">
          {row.created_by?.name || "Unknown"}
        </div>
      ),
    },
    {
      name: "Created At",
      selector: (row: Pool) =>
        new Date(row.createdAt || "").toLocaleDateString(),
      sortable: true,
      cell: (row: Pool) => (
        <div className="py-3 text-gray-500 text-sm">
          {new Date(row.createdAt || "").toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row: Pool) => {
        if (row.kyc_status === "approved") {
          const isActive = row.status === "active";
          return (
            <div className="py-1.5 flex items-center">
              <button
                onClick={() => handleToggleStatus(row)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  isActive
                    ? "bg-white text-red-600 border border-red-200 hover:bg-red-50 focus:ring-red-500 hover:border-red-300"
                    : "bg-white text-green-600 border border-green-200 hover:bg-green-50 focus:ring-green-500 hover:border-green-300"
                }`}
              >
                {isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          );
        }

        return (
          <div className="py-3 flex items-center">
            <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
              KYC Pending
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">
            Business Accounts
          </h1>
          <p className="text-sm text-gray-500">
            Streamline your shipping and fulfillment
          </p>
        </div>
        <button
          onClick={openNewPoolModal}
          className="px-4 py-2.5 text-sm font-medium text-white bg-linear-to-r from-[#F5891E] to-[#FF6B35] rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Add New Business
        </button>
      </div>

      <CustomDataTable
        setLimit={setLimit}
        columns={columns}
        data={pools}
        totalRecords={totalRecords}
        page={page}
        limit={limit}
        setPage={setPage}
        isLoading={loading}
        selectableRows={false}
      />

      <AnimatePresence>
        {showModal && (
          <PoolModal
            onClose={() => setShowModal(false)}
            editingPool={editingPool}
            onSuccess={() => {
              setShowModal(false);
              fetchInitialData();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};
