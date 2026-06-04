import React, { useEffect, useState } from "react";
import { getAllWarehouses, updateStatus } from "../../APIs/user/warehouse";
import {  Mail, MapPin, Phone, User, Warehouse } from "lucide-react";
import WarehouseModal from "../../components/warehouses/WarehouseModal";

export interface UserType {
  _id: string;
  name: string;
}

export interface Warehouse {
  _id: string;
  name: string;
  address1: string;
  address2?: string;
  City: string;
  State: string;
  Country: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  status: "active" | "inactive" | "suspended";
  created_by: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  createdAt?: string;
  admins?: UserType[];
}

export const Warehouses: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, [page, limit]);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const data = await getAllWarehouses(page, limit);
      setTotalRecords(data.total);
      setWarehouses(data.data);
    } catch (error) {
      console.error("Error fetching warehouses", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => setEditingWarehouse(null), 200);
  };

  const handleShow = () => {
    setEditingWarehouse(null);
    setShowModal(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setShowModal(true);
  };

  const handleToggleStatus = async (warehouse: Warehouse) => {
    const newStatus = warehouse.status === "active" ? "inactive" : "active";
    if (window.confirm(`Are you sure you want to mark this warehouse as ${newStatus}?`)) {
      try {
        await updateStatus(warehouse._id);
        fetchWarehouses();
      } catch (err) {
        console.error("Error toggling status", err);
      }
    }
  };

  const totalPages = Math.ceil(totalRecords / limit);
  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalRecords);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const statusStyle = (status: Warehouse["status"]) => {
    if (status === "active") return "bg-green-100 text-green-700";
    if (status === "inactive") return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-500";
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">
            Warehouses
          </h1>
          <p className="text-sm text-gray-500">
            Streamline your shipping and fulfillment
          </p>
        </div>
        <button
          onClick={handleShow}
          className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#F5891E] to-[#FF6B35] rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          + New Warehouse
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : warehouses.length === 0 ? (
        <p className="text-gray-400 text-sm">No warehouses found.</p>
      ) : (
        <>
          {/* Cards Grid */}

          
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
  {warehouses.map((warehouse) => (
    <div
      key={warehouse._id}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Banner Header */}
      <div className="bg-orange-50 border-b border-amber-200 px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
          <Warehouse className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => handleEdit(warehouse)}
            className="text-sm font-semibold text-amber-900 hover:underline text-left w-full truncate focus:outline-none block"
          >
            {warehouse.name}
          </button>
          <p className="text-xs text-amber-700 mt-0.5">
            {warehouse.createdAt
              ? `Created ${new Date(warehouse.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
              : "—"}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${statusStyle(warehouse.status)}`}>
          {warehouse.status.charAt(0).toUpperCase() + warehouse.status.slice(1)}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex flex-col gap-3 flex-1">

        {/* Address */}
        <div className="flex gap-2 items-start text-sm">
          <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
          <div>
            <p className="text-gray-900 font-medium leading-snug">
              {warehouse.address1}{warehouse.address2 ? `, ${warehouse.address2}` : ""}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {warehouse.City}, {warehouse.State} · {warehouse.Country} — {warehouse.pincode}
            </p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Contact Person */}
        <div className="flex gap-2 items-start">
          <User className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Contact person</p>
            <p className="text-sm font-medium text-gray-800">{warehouse.contact_person}</p>
          </div>
        </div>

        {/* Phone + Email side by side */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 truncate">{warehouse.contact_phone}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 truncate">{warehouse.contact_email}</span>
          </div>
        </div>

        {/* Coordinates */}
        {warehouse.latitude && warehouse.longitude && (
          <p className="text-xs text-gray-400">
            🌐 {warehouse.latitude}, {warehouse.longitude}
          </p>
        )}

      </div>

      {/* Footer */}
      <div className="px-4 pb-3 pt-2 border-t border-gray-100">
        <button
          onClick={() => handleToggleStatus(warehouse)}
          className={`w-full text-sm font-semibold py-2 rounded-xl border transition-all duration-200 ${
            warehouse.status === "active"
              ? "text-red-500 border-red-200 hover:bg-red-50"
              : "text-green-700 border-green-200 hover:bg-green-50"
          }`}
        >
          {warehouse.status === "active" ? "Deactivate" : "Activate"}
        </button>
      </div>

    </div>
  ))}
</div>

          {/* Pagination Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-1 py-3 border-t border-gray-200">

            {/* Rows per page */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                {[10, 20, 50, 100].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Record count */}
            <span className="text-sm text-gray-500">
              {startRecord}–{endRecord} of {totalRecords}
            </span>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                        page === p
                          ? "bg-orange-500 text-white border-orange-500 font-semibold"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2 py-1 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                »
              </button>
            </div>
          </div>
        </>
      )}

      <WarehouseModal
        isOpen={showModal}
        onClose={handleClose}
        editingWarehouse={editingWarehouse}
        onSuccess={fetchWarehouses}
      />
    </>
  );
};