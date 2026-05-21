import React, { useEffect, useState } from "react";
import { getAllWarehouses, updateStatus } from "../../APIs/user/warehouse";
import CustomDataTable from "../../components/DataTable";
import { Mail, MapPin, Phone, User } from "lucide-react";
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
  const limit = 10;
  const [totalRecords, setTotalRecords] = useState(0);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );

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
    // Slight delay to allow modal exit animation to finish before clearing data
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
    if (
      window.confirm(
        `Are you sure you want to mark this warehouse as ${newStatus}?`
      )
    ) {
      try {
        await updateStatus(warehouse._id);
        fetchWarehouses();
      } catch (err) {
        console.error("Error toggling status", err);
      }
    }
  };

  const columns = [
    {
      name: "Warehouse Name",
      selector: (row: Warehouse) => row.name,
      sortable: true,
      width: "280px",
      cell: (row: Warehouse) => (
        <div className="flex items-center gap-3 py-2 text-lg font-semibold text-neutral-600">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors focus:outline-none text-left"
          >
            {row.name}
          </button>
        </div>
      ),
    },
    {
      name: "Location",
      selector: (row: Warehouse) => row.City,
      wrap: true,
      minWidth: "300px",
      cell: (row: Warehouse) => (
        <div className="flex items-start gap-2.5 py-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
          <div className="flex flex-col leading-relaxed">
            <span className="text-gray-900 font-medium">
              {row.address1}
              {row.address2 ? `, ${row.address2}` : ""}
            </span>
            <span>
              {row.City}, {row.State}
            </span>
            <span className="text-gray-500 text-xs mt-0.5">
              {row.Country} - {row.pincode}
            </span>
          </div>
        </div>
      ),
    },
    {
      name: "Contact Details",
      minWidth: "220px",
      cell: (row: Warehouse) => (
        <div className="flex flex-col gap-2 py-2 text-sm">
          <div className="flex items-center gap-2 text-gray-900 font-medium">
            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{row.contact_person}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{row.contact_phone}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{row.contact_email}</span>
          </div>
        </div>
      ),
    },
    {
      name: "Created On",
      selector: (row: Warehouse) => row.createdAt,
      sortable: true,
      width: "150px",
      cell: (row: Warehouse) => (
        <div className="py-2 text-sm font-medium text-gray-600">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </div>
      ),
    },
    {
      name: "Actions",
      width: "160px",
      cell: (row: Warehouse) => {
        const isActive = row.status === "active";
        return (
          <div className="py-2 flex items-center">
            <button
              onClick={() => handleToggleStatus(row)}
              className={`w-full font-semibold px-4 text-sm text-neutral-600 py-2 rounded-lg shadow-sm transition-all duration-200 border border-neutral-600 ${
                isActive
                  ? "hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                  : "hover:bg-green-50 hover:border-green-300 hover:text-green-700"
              }`}
            >
              {isActive ? "Deactivate" : "Activate"}
            </button>
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
            Warehouses
          </h1>
          <p className="text-sm text-gray-500">
            Streamline your shipping and fulfillment
          </p>
        </div>
        <button
          onClick={handleShow}
          className="px-4 py-2.5 text-sm font-medium text-white bg-linear-to-r from-[#F5891E] to-[#FF6B35] rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          + New Warehouse
        </button>
      </div>

      <CustomDataTable
        columns={columns as any}
        data={warehouses}
        totalRecords={totalRecords}
        page={page}
        limit={limit}
        setPage={setPage}
        isLoading={loading}
      />

      <WarehouseModal
        isOpen={showModal}
        onClose={handleClose}
        editingWarehouse={editingWarehouse}
        onSuccess={fetchWarehouses}
      />
    </>
  );
};
