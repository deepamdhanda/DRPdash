import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { createWarehouse, updateWarehouse } from "../../APIs/user/warehouse";
import { getUser } from "../../APIs/user/user";
import { UserType, Warehouse } from "../../screens/user/Warehouse";

const LIBRARIES: "places"[] = ["places"];
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const GOOGLE_MAPS_API_KEY = "AIzaSyANgy6kbp_ciumVNTAwakMFTXdCW3rVZfg";

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWarehouse: Warehouse | null;
  onSuccess: () => void;
}

const STATES_LIST = [
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
  " त्रिपुरा",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const WarehouseModal: React.FC<WarehouseModalProps> = ({
  isOpen,
  onClose,
  editingWarehouse,
  onSuccess,
}) => {
  const [adminList, setAdminList] = useState<UserType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Reset and populate form/state on open
  useEffect(() => {
    if (isOpen) {
      if (editingWarehouse) {
        setAdminList(editingWarehouse.admins || []);
        if (editingWarehouse.latitude && editingWarehouse.longitude) {
          setMarkerPosition({
            lat: editingWarehouse.latitude,
            lng: editingWarehouse.longitude,
          });
        }
      } else {
        setAdminList([]);
        setMarkerPosition(null);
      }
    }
  }, [isOpen, editingWarehouse]);

  // --- Map Handlers ---
  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
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
        toast.error(`No details available for input: '${place.name}'`);
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      address1: (
        form.elements.namedItem("address1") as HTMLInputElement
      ).value.trim(),
      address2: (
        form.elements.namedItem("address2") as HTMLInputElement
      ).value.trim(),
      City: (form.elements.namedItem("City") as HTMLInputElement).value.trim(),
      State: (form.elements.namedItem("State") as HTMLSelectElement).value,
      Country: "IN",
      pincode: (
        form.elements.namedItem("pincode") as HTMLInputElement
      ).value.trim(),
      contact_person: (
        form.elements.namedItem("contact_person") as HTMLInputElement
      ).value.trim(),
      contact_phone: (
        form.elements.namedItem("contact_phone") as HTMLInputElement
      ).value.trim(),
      contact_email: (
        form.elements.namedItem("contact_email") as HTMLInputElement
      ).value.trim(),
      latitude: markerPosition?.lat,
      longitude: markerPosition?.lng,
      status: (form.elements.namedItem("status") as HTMLSelectElement)
        .value as Warehouse["status"],
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
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving warehouse", error);
      toast.error("Failed to save warehouse");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 text-black">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                {editingWarehouse ? "Edit Warehouse" : "Create Warehouse"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Name *</label>
                      <input
                        name="name"
                        defaultValue={editingWarehouse?.name}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Address 1 *</label>
                      <input
                        name="address1"
                        defaultValue={editingWarehouse?.address1}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Address 2</label>
                      <input
                        name="address2"
                        defaultValue={editingWarehouse?.address2}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>City *</label>
                        <input
                          name="City"
                          defaultValue={editingWarehouse?.City}
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>State *</label>
                        <select
                          name="State"
                          defaultValue={editingWarehouse?.State}
                          required
                          className={inputClass}
                        >
                          <option value="">Select</option>
                          {STATES_LIST.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Pincode *</label>
                      <input
                        name="pincode"
                        defaultValue={editingWarehouse?.pincode}
                        required
                        pattern="[1-9][0-9]{5}"
                        title="Enter a valid 6-digit Indian pincode"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Contact Person *</label>
                      <input
                        name="contact_person"
                        defaultValue={editingWarehouse?.contact_person}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Contact Phone *</label>
                        <input
                          name="contact_phone"
                          defaultValue={editingWarehouse?.contact_phone}
                          required
                          pattern="[6-9]\d{9}"
                          title="Enter a valid 10-digit Indian mobile number"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Status *</label>
                        <select
                          name="status"
                          defaultValue={editingWarehouse?.status || "active"}
                          required
                          className={inputClass}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Contact Email *</label>
                      <input
                        name="contact_email"
                        type="email"
                        defaultValue={editingWarehouse?.contact_email}
                        required
                        className={inputClass}
                      />
                    </div>

                    <hr className="border-gray-200 my-4" />

                    <div>
                      <label className={labelClass}>
                        Find Admin User by Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter user email and click outside"
                        onBlur={(e) => handleUserSearch(e.target.value)}
                        className={inputClass}
                      />
                      <div className="flex flex-wrap gap-2 mt-3">
                        {adminList.map((admin) => (
                          <span
                            key={admin._id}
                            onClick={() => removeAdmin(admin._id)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium cursor-pointer hover:bg-red-50 hover:text-red-600 border border-gray-200 transition-colors flex items-center gap-1"
                          >
                            {admin.name}{" "}
                            <span className="text-lg leading-none">
                              &times;
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Map Section */}
                <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Warehouse Location
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Search or click on the map to pin the exact location.
                  </p>

                  {isLoaded ? (
                    <div className="space-y-3">
                      <Autocomplete
                        onLoad={(autocomplete) =>
                          (autocompleteRef.current = autocomplete)
                        }
                        onPlaceChanged={onPlaceChanged}
                      >
                        <input
                          type="text"
                          placeholder="Search Location..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                          }}
                          className={inputClass}
                        />
                      </Autocomplete>

                      <div className="h-[300px] w-full rounded-md overflow-hidden border border-gray-300 shadow-inner">
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
                          {markerPosition && (
                            <Marker position={markerPosition} />
                          )}
                        </GoogleMap>
                      </div>

                      <div className="gap-4 text-sm text-gray-600 bg-white p-2 rounded border border-gray-200 inline-flex">
                        <span>
                          <strong className="text-gray-900">Lat:</strong>{" "}
                          {markerPosition?.lat.toFixed(6) || "Not set"}
                        </span>
                        <span>
                          <strong className="text-gray-900">Lng:</strong>{" "}
                          {markerPosition?.lng.toFixed(6) || "Not set"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[300px] w-full bg-gray-200 animate-pulse rounded-md flex items-center justify-center text-gray-500">
                      Loading Map...
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingWarehouse
                    ? "Update Warehouse"
                    : "Create Warehouse"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WarehouseModal;
