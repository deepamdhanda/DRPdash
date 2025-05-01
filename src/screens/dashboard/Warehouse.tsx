import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  getAllWarehouses,
  createWarehouse,
  updateWarehouse,
} from "../../APIs/warehouse";

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
}

const Warehouses: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const data = await getAllWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error("Error fetching warehouses", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingWarehouse(null);
  };

  const handleShow = () => setShowModal(true);

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
        await updateWarehouse(warehouse._id, {
          ...warehouse,
          status: newStatus,
        });
        fetchWarehouses();
      } catch (err) {
        console.error("Error toggling status", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as typeof e.target & {
      name: { value: string };
      address1: { value: string };
      address2: { value: string };
      City: { value: string };
      State: { value: string };
      pincode: { value: string };
      contact_person: { value: string };
      contact_phone: { value: string };
      contact_email: { value: string };
      latitude: { value: string };
      longitude: { value: string };
      status: { value: string };
    };

    const formData = {
      name: form.name.value.trim(),
      address1: form.address1.value.trim(),
      address2: form.address2.value.trim(),
      City: form.City.value.trim(),
      State: form.State.value,
      Country: "IN",
      pincode: form.pincode.value.trim(),
      contact_person: form.contact_person.value.trim(),
      contact_phone: form.contact_phone.value.trim(),
      contact_email: form.contact_email.value.trim(),
      latitude: form.latitude.value
        ? parseFloat(form.latitude.value)
        : undefined,
      longitude: form.longitude.value
        ? parseFloat(form.longitude.value)
        : undefined,
      status: form.status.value as "active" | "inactive" | "suspended",
    };

    try {
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse._id, formData);
      } else {
        await createWarehouse(formData);
      }
      fetchWarehouses();
      handleClose();
    } catch (error) {
      console.error("Error saving warehouse", error);
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row: Warehouse) => (
        <div>
          {row.status === "active"
            ? `🟢`
            : row.status === "inactive"
              ? `🔴`
              : `❌`}{" "}
          <strong style={{ fontSize: 16 }}> {row.name}</strong>
        </div>
      ),
      sortable: true,
      style: { margin: 10 },
    },
    {
      name: "Address",
      selector: (row: Warehouse) =>
        `${row.address1}${row.address2 ? `, ${row.address2}` : ""}, ${row.City
        }, ${row.State}, ${row.Country} - ${row.pincode}`,
      wrap: true,
      compact: true,
      style: { margin: 10 },
    },
    {
      name: "Contact Details",
      cell: (row: Warehouse) => (
        <div>
          <strong>{row.contact_person}</strong>
          <br />
          📞 {row.contact_phone}
          <br />
          📧 {row.contact_email}
        </div>
      ),
      compact: true,
      style: { margin: 10 },
    },
    {
      name: "Coordinates",
      selector: (row: Warehouse) =>
        row.latitude && row.longitude
          ? `${row.latitude}, ${row.longitude}`
          : "—",
      compact: true,
      style: { margin: 10 },
    },
    {
      name: "Created On",
      selector: (row: Warehouse) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          : "—",
      sortable: true,
      style: { margin: 10 },
    },
    {
      name: "Actions",
      cell: (row: Warehouse) => (
        <>
          <Button
            variant="outline-primary"
            size="sm"
            className="me-2"
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            variant={
              row.status === "active" ? "outline-danger" : "outline-success"
            }
            size="sm"
            onClick={() => handleToggleStatus(row)}
          >
            {row.status === "active" ? "Deactivate" : "Activate"}
          </Button>
        </>
      ),
      button: true,
      width: "125px",
      style: { margin: 10 },
    },
  ];

  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Warehouses</h4>
        <Button onClick={handleShow}>+ New Warehouse</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : warehouses.length === 0 ? (
        <p>No warehouses found.</p>
      ) : (
        <DataTable
          title="Your Warehouse"
          data={warehouses}
          columns={columns as any}
          highlightOnHover
          defaultSortFieldId={1}
          pagination
          paginationRowsPerPageOptions={[10, 20, 50, 100]}
          responsive
          fixedHeader
          persistTableHead
          striped
        />
      )}

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingWarehouse ? "Edit Warehouse" : "Create Warehouse"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                defaultValue={editingWarehouse?.name}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Address 1</Form.Label>
              <Form.Control
                name="address1"
                defaultValue={editingWarehouse?.address1}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Address 2</Form.Label>
              <Form.Control
                name="address2"
                defaultValue={editingWarehouse?.address2 || ""}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>City</Form.Label>
              <Form.Control
                name="City"
                defaultValue={editingWarehouse?.City}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>State</Form.Label>
              <Form.Control
                as="select"
                name="State"
                defaultValue={editingWarehouse?.State}
                required
              >
                <option value="">Select</option>
                {[
                  "Andaman and Nicobar Islands",
                  "Andhra Pradesh",
                  "Arunachal Pradesh",
                  "Assam",
                  "Bihar",
                  "Chandigarh",
                  "Chhattisgarh",
                  "Dadra and Nagar Haveli and Daman and Diu",
                  "Delhi",
                  "Goa",
                  "Gujarat",
                  "Haryana",
                  "Himachal Pradesh",
                  "Jammu and Kashmir",
                  "Jharkhand",
                  "Karnataka",
                  "Kerala",
                  "Ladakh",
                  "Lakshadweep",
                  "Madhya Pradesh",
                  "Maharashtra",
                  "Manipur",
                  "Meghalaya",
                  "Mizoram",
                  "Nagaland",
                  "Odisha",
                  "Puducherry",
                  "Punjab",
                  "Rajasthan",
                  "Sikkim",
                  "Tamil Nadu",
                  "Telangana",
                  "Tripura",
                  "Uttar Pradesh",
                  "Uttarakhand",
                  "West Bengal",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Pincode</Form.Label>
              <Form.Control
                name="pincode"
                defaultValue={editingWarehouse?.pincode}
                required
                pattern="[1-9][0-9]{5}"
                title="Enter a valid 6-digit Indian pincode"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Contact Person</Form.Label>
              <Form.Control
                name="contact_person"
                defaultValue={editingWarehouse?.contact_person}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Contact Phone</Form.Label>
              <Form.Control
                name="contact_phone"
                defaultValue={editingWarehouse?.contact_phone}
                required
                pattern="[6-9]\d{9}"
                title="Enter a valid 10-digit Indian mobile number"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Contact Email</Form.Label>
              <Form.Control
                name="contact_email"
                type="email"
                defaultValue={editingWarehouse?.contact_email}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Latitude</Form.Label>
              <Form.Control
                name="latitude"
                type="number"
                step="any"
                defaultValue={editingWarehouse?.latitude || ""}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Longitude</Form.Label>
              <Form.Control
                name="longitude"
                type="number"
                step="any"
                defaultValue={editingWarehouse?.longitude || ""}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                defaultValue={editingWarehouse?.status || "active"}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingWarehouse ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export { Warehouses };