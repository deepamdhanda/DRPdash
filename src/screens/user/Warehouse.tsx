import React, { useEffect, useState, useCallback, useRef } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import {
  getAllWarehouses,
  createWarehouse,
  updateWarehouse,
  updateStatus,
} from "../../APIs/user/warehouse";
import { getUser } from "../../APIs/user/user";
import { toast } from "react-toastify";
import CustomDataTable from "../../components/DataTable";
import { Mail, MapPin, Phone, User } from "lucide-react";

// --- Google Maps Configuration ---
const LIBRARIES: "places"[] = ["places"];
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const GOOGLE_MAPS_API_KEY = "AIzaSyANgy6kbp_ciumVNTAwakMFTXdCW3rVZfg";

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
  admins?: User[];
}

export interface User {
  _id: string;
  name: string;
}

const Warehouses: React.FC = () => {
  // --- Data State ---
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );
  const [adminList, setAdminList] = useState<User[]>([]);

  // --- Google Maps State ---
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, [page, limit]);

  // Sync Map Marker when opening Edit Modal
  useEffect(() => {
    if (
      showModal &&
      editingWarehouse?.latitude &&
      editingWarehouse?.longitude
    ) {
      setMarkerPosition({
        lat: editingWarehouse.latitude,
        lng: editingWarehouse.longitude,
      });
    } else if (showModal && !editingWarehouse) {
      // Reset if creating new
      setMarkerPosition(null);
    }
  }, [showModal, editingWarehouse]);

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
    setEditingWarehouse(null);
    setAdminList([]);
    setMarkerPosition(null); // Reset map
  };

  const handleShow = () => setShowModal(true);

  // Uncommented this to allow editing based on your code structure context
  // const handleEdit = (warehouse: Warehouse) => {
  //   setEditingWarehouse(warehouse);
  //   setAdminList(warehouse.admins || []);
  //   setShowModal(true);
  // };

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

  // --- Map Handlers ---
  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarkerPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, []);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setMarkerPosition({ lat, lng });

        map?.panTo({ lat, lng });
        map?.setZoom(15);
      } else {
        toast.error("No details available for input: '" + place.name + "'");
      }
    }
  };

  // --- Submit Handler ---
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
      // Use State for Coordinates
      latitude: markerPosition?.lat,
      longitude: markerPosition?.lng,
      status: form.status.value as "active" | "inactive" | "suspended",
      admins: adminList.map((admin) => admin._id),
    };

    try {
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse._id, formData);
        toast.success("Warehouse updated successfully");
      } else {
        await createWarehouse(formData);
        toast.success("Warehouse created successfully");
      }
      fetchWarehouses();
      handleClose();
    } catch (error) {
      console.error("Error saving warehouse", error);
      toast.error("Failed to save warehouse");
    }
  };

  const handleUserSearch = async (email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    try {
      const user = await getUser(trimmedEmail);
      if (!user || user.length === 0) {
        toast.warn("User not found");
        return;
      }

      const userObj = user[0];

      if (adminList.some((admin) => admin._id === userObj._id)) {
        toast.info("User already added as admin");
        return;
      }
      toast.success("User added as admin");
      setAdminList((prev) => [...prev, userObj]);
    } catch (error) {
      console.error("Error finding user:", error);
      toast.error("Error fetching user");
    }
  };

  const removeAdmin = (userId: string) => {
    setAdminList((prev) => prev.filter((admin) => admin._id !== userId));
  };

  const columns = [
    {
      name: "Warehouse Name",
      selector: (row: Warehouse) => row.name,
      sortable: true,
      width: "280px", // Gives the name and status enough room
      cell: (row: Warehouse) => (
        <div className="flex items-center gap-3 py-2 text-xl font-semibold text-neutral-600">
          {row.name}
        </div>
      ),
    },
    {
      name: "Location",
      selector: (row: Warehouse) => row.City, // Sorting primarily by City makes sense here
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
              className={`w-full font-semibold px-4  text-neutral-600 py-2 rounded-lg shadow-sm transition-all duration-200 border border-neutral-600 ${
                isActive
                  ? "hover:bg-red-50 hover:border-red-300"
                  : "hover:bg-green-50 hover:border-green-300"
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Warehouses</h4>
        <Button onClick={handleShow}>+ New Warehouse</Button>
      </div>

      <CustomDataTable
        // title="Your Warehouse"
        columns={columns as any}
        data={warehouses}
        totalRecords={totalRecords}
        page={page}
        limit={limit}
        setPage={setPage}
        isLoading={loading}
      />

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingWarehouse ? "Edit Warehouse" : "Create Warehouse"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6">
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
              </div>
              <div className="col-md-6">
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

                <hr />
                <Form.Group className="mb-2">
                  <Form.Label>Find Admin User by Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter user email"
                    onBlur={(e) => handleUserSearch(e.target.value)}
                  />
                </Form.Group>
                <div className="mb-2">
                  {adminList.map((admin) => (
                    <Badge bg="secondary" className="me-1" key={admin._id}>
                      {admin.name}{" "}
                      <span
                        role="button"
                        onClick={() => removeAdmin(admin._id)}
                        style={{
                          marginLeft: 6,
                          cursor: "pointer",
                          color: "white",
                        }}
                      >
                        ×
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* --- Google Map Section --- */}
            <div className="mt-3 border rounded p-3 bg-light">
              <Form.Label className="fw-bold">Warehouse Location</Form.Label>
              <div className="text-muted small mb-2">
                Search or click on map to pin location.
              </div>

              {isLoaded ? (
                <>
                  <div className="mb-2">
                    <Autocomplete
                      onLoad={(autocomplete) =>
                        (autocompleteRef.current = autocomplete)
                      }
                      onPlaceChanged={onPlaceChanged}
                    >
                      <Form.Control
                        type="text"
                        placeholder="Search Location"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                      />
                    </Autocomplete>
                  </div>

                  <div style={{ height: "300px", width: "100%" }}>
                    <GoogleMap
                      mapContainerStyle={{ height: "100%", width: "100%" }}
                      center={markerPosition || DEFAULT_CENTER}
                      zoom={markerPosition ? 15 : 5}
                      onLoad={(mapInstance) => setMap(mapInstance)}
                      onClick={onMapClick}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                      }}
                    >
                      {markerPosition && <Marker position={markerPosition} />}
                    </GoogleMap>
                  </div>

                  <div className="mt-2 d-flex gap-3">
                    <small className="text-muted">
                      <strong>Lat:</strong>{" "}
                      {markerPosition?.lat.toFixed(6) || "Not set"}
                    </small>
                    <small className="text-muted">
                      <strong>Lng:</strong>{" "}
                      {markerPosition?.lng.toFixed(6) || "Not set"}
                    </small>
                  </div>
                </>
              ) : (
                <div>Loading Map...</div>
              )}
            </div>
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
    </>
  );
};

export { Warehouses };
