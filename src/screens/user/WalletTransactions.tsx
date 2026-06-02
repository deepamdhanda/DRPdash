import React, { useEffect, useState, useMemo } from "react";
import { getAllWallets } from "../../APIs/user/wallet";
import CustomDataTable from "../../components/DataTable"; // Adjust path if needed
import { User, Weight, MapPin, Calendar, CreditCard } from "lucide-react";

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

export const WalletTransactionsComponent: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const fetchWalletTransactions = async (
    pageParam = page,
    limitParam = limit
  ) => {
    try {
      setLoading(true);
      const data = await getAllWallets(pageParam, limitParam);
      setWallets(data.data);
      setTotalRecords(data.total);
    } catch (error) {
      console.error("Error fetching wallets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletTransactions(page, limit);
  }, [page, limit]);

  const columns = useMemo(
    () => [
      {
        name: "Order ID",
        selector: (row: Wallet) => row.order_id?.order_id,
        sortable: true,
        width: "180px",
        cell: (row: Wallet) => (
          <div className="flex items-center gap-2 py-3">
            <strong className="text-gray-900 font-semibold tracking-wide">
              #{row.order_id?.order_id || "N/A"}
            </strong>
          </div>
        ),
      },
      {
        name: "Account Details",
        minWidth: "200px",
        cell: (row: Wallet) => (
          <div className="flex flex-col gap-0.5 py-2">
            <span className="text-sm font-semibold text-gray-800">
              {row.order_id?.channel_id?.channel_account_name || "N/A"}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              Pool: {row.order_id?.channel_id?.pool_id?.name || "N/A"}
            </span>
          </div>
        ),
      },
      {
        name: "Created By",
        width: "180px",
        cell: (row: Wallet) => (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span>{row.created_by?.name || "—"}</span>
          </div>
        ),
      },
      {
        name: "Details",
        minWidth: "150px",
        cell: (row: Wallet) => (
          <div className="flex flex-col gap-1.5 py-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Weight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{row.charged_weight} gms</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                Zone {(row.zone || "").replace("z_", "").toUpperCase() || "—"}
              </span>
            </div>
          </div>
        ),
      },
      {
        name: "Charges Breakdown",
        minWidth: "220px",
        cell: (row: Wallet) => {
          const isDebit = row.cr_dr === "DR";
          const clrClass = isDebit ? "text-red-600" : "text-green-600";
          const otherCharges =
            row.total_amount - row.freight_charge - row.cod_charges;

          return (
            <div className="flex flex-col gap-1 py-2 text-xs w-full">
              <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                <span className="text-gray-500">Freight + Comm:</span>
                <span className={`font-medium ${clrClass}`}>
                  ₹{(row.freight_charge + row.commission).toFixed(2)}
                </span>
              </div>
              {row.cod_charges > 0 && (
                <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                  <span className="text-gray-500">COD:</span>
                  <span className={`font-medium ${clrClass}`}>
                    ₹{row.cod_charges.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Other:</span>
                <span className={`font-medium ${clrClass}`}>
                  ₹{otherCharges.toFixed(2)}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        name: "Total Amount",
        width: "160px",
        cell: (row: Wallet) => {
          const isDebit = row.cr_dr === "DR";
          const clrClass = isDebit
            ? "text-red-700 bg-red-50 border-red-200"
            : "text-green-700 bg-green-50 border-green-200";
          const sign = isDebit ? "-" : "+";

          return (
            <div className="flex items-center gap-2">
              <CreditCard
                className={`w-4 h-4 ${
                  isDebit ? "text-red-400" : "text-green-400"
                }`}
              />
              <span
                className={`px-2.5 py-1 rounded-md border font-bold ${clrClass}`}
              >
                {sign} ₹{row.total_amount.toFixed(2)}
              </span>
            </div>
          );
        },
      },
      {
        name: "Date",
        width: "150px",
        cell: (row: Wallet) => (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>
              {row.createdAt
                ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Wallet Transactions
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            View your detailed freight deductions, COD charges, and wallet
            credits.
          </p>
        </div>
      </div>

      <CustomDataTable
        setLimit={setLimit}
        columns={columns}
        data={wallets}
        totalRecords={totalRecords}
        page={page}
        limit={limit}
        setPage={setPage}
        isLoading={loading}
      />
    </div>
  );
};
