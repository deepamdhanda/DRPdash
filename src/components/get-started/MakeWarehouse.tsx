import React, { useState, useRef, useCallback } from "react";

import { toast } from "react-toastify";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";

import { createWarehouse } from "../../APIs/user/warehouse";

const GOOGLE_MAPS_API_KEY = "AIzaSyANgy6kbp_ciumVNTAwakMFTXdCW3rVZfg";
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const LIBRARIES: "places"[] = ["places"];

export interface Warehouse {
  _id?: string;
  name: string;
  address1: string;
  address2?: string;
  City: string;
  State: string;
  Country?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
}

const INDIAN_STATES = [
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
];

const getAddressComponent = (
  components: google.maps.GeocoderAddressComponent[],
  type: string
): string => {
  const match = components.find((c) => c.types.includes(type));
  return match ? match.long_name : "";
};

const MakeWarehouse: React.FC<{ handleNext: () => void }> = ({
  handleNext,
}) => {
  // --- Flow State ---
  const [step, setStep] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1); // 1 for forward, -1 for backward

  // --- Form States ---
  const [submitting, setSubmitting] = useState(false);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formAddress1, setFormAddress1] = useState("");
  const [formAddress2, setFormAddress2] = useState("");
  const [formPincode, setFormPincode] = useState("");
  const [formPerson, setFormPerson] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    // Make sure your key is securely provided in your real environment
    googleMapsApiKey:
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const resetForm = () => {
    setCity("");
    setState("");
    setEmail("");
    setFormName("");
    setFormAddress1("");
    setFormAddress2("");
    setFormPincode("");
    setFormPerson("");
    setFormPhone("");
    setMarkerPosition(null);
    setStep(0);
  };

  const fillAddressFromPlace = (place: google.maps.places.PlaceResult) => {
    if (!place.address_components) return;
    const c = place.address_components;

    const premise = getAddressComponent(c, "premise");
    const sublocality =
      getAddressComponent(c, "sublocality_level_1") ||
      getAddressComponent(c, "sublocality") ||
      getAddressComponent(c, "neighborhood");
    const route = getAddressComponent(c, "route");
    const parts = [premise, sublocality, route].filter(Boolean);
    if (parts.length > 0) setFormAddress2(parts.join(", "));

    const locality =
      getAddressComponent(c, "locality") ||
      getAddressComponent(c, "administrative_area_level_3");
    if (locality) setCity(locality);

    const stateName = getAddressComponent(c, "administrative_area_level_1");
    if (stateName) {
      const exact = INDIAN_STATES.find(
        (s) => s.toLowerCase() === stateName.toLowerCase()
      );
      if (exact) setState(exact);
      else {
        const partial = INDIAN_STATES.find((s) =>
          s.toLowerCase().includes(stateName.toLowerCase())
        );
        setState(
          partial ||
            stateName.charAt(0).toUpperCase() + stateName.slice(1).toLowerCase()
        );
      }
    }

    const pincode = getAddressComponent(c, "postal_code");
    if (pincode) setFormPincode(pincode);
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.google) return;
    new google.maps.Geocoder().geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === "OK" && results?.[0]) {
          fillAddressFromPlace(
            results[0] as unknown as google.maps.places.PlaceResult
          );
        }
      }
    );
  };

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat(),
        lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      reverseGeocode(lat, lng);
    }
  }, []);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPosition({ lat, lng });
        map?.panTo({ lat, lng });
        map?.setZoom(16);
        fillAddressFromPlace(place);
      } else {
        toast.error("No details available for: '" + place.name + "'");
      }
    }
  };

  const handleNextStep = () => {
    if (step === 0 && !markerPosition) {
      toast.warn("Please select a location on the map first");
      return;
    }
    if (step === 1 && (!formName.trim() || !formAddress1.trim())) {
      toast.warn("Warehouse Name and Address Line 1 are required");
      return;
    }
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPerson || !formPhone || !email) {
      toast.warn("Please fill in all contact details");
      return;
    }
    if (!city || !state) {
      toast.warn("City and State are missing. Please re-select the location.");
      return;
    }

    setSubmitting(true);
    const payload: Warehouse = {
      name: formName.trim(),
      address1: formAddress1.trim(),
      address2: formAddress2.trim() || undefined,
      City: city,
      State: state,
      Country: "IN",
      pincode: formPincode,
      contact_person: formPerson.trim(),
      contact_phone: formPhone.trim(),
      contact_email: email.trim(),
      latitude: markerPosition?.lat,
      longitude: markerPosition?.lng,
    };
    try {
      await createWarehouse(payload);
      toast.success("Warehouse created successfully");
      handleNext();
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create warehouse");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Framer Motion Variants ---
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 40 : -40,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full mx-auto bg-white overflow-hidden relative min-h-[500px] text-black">
      {/* Progress Dots */}
      <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 z-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === i ? "w-6 bg-[#F5891E]" : "w-2 bg-gray-200"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction} initial={false}>
        {/* STEP 0: MAP LOCATION */}
        {step === 0 && (
          <motion.div
            key="step0"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col h-full"
          >
            <div className="p-6 pt-12 pb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Pin your location
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Search or click on the map to drop a pin for your warehouse.
              </p>
            </div>

            <div className="px-6 flex-1 relative">
              <div className="rounded-xl overflow-hidden border border-gray-200 h-[350px] md:h-[400px] relative bg-gray-50">
                {isLoaded ? (
                  <>
                    <div className="absolute top-4 left-4 right-4 z-10">
                      <Autocomplete
                        onLoad={(ac) => (autocompleteRef.current = ac)}
                        onPlaceChanged={onPlaceChanged}
                        options={{ componentRestrictions: { country: "in" } }}
                      >
                        <input
                          type="text"
                          placeholder="Search location (e.g. Okhla Phase 3, Delhi)"
                          className="w-full px-4 py-3 rounded-xl shadow-lg border-0 text-sm outline-none focus:ring-2 focus:ring-[#F5891E] bg-white/95 backdrop-blur-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                          }}
                        />
                      </Autocomplete>
                    </div>
                    <GoogleMap
                      mapContainerStyle={{ height: "100%", width: "100%" }}
                      center={markerPosition || DEFAULT_CENTER}
                      zoom={markerPosition ? 16 : 5}
                      onLoad={(m) => setMap(m)}
                      onClick={onMapClick}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        zoomControl: true,
                      }}
                    >
                      {markerPosition && <Marker position={markerPosition} />}
                    </GoogleMap>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Loading map...
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 pt-4 flex justify-between items-center bg-white border-t border-gray-50 mt-4">
              <div className="text-xs text-gray-500 font-medium">
                {markerPosition ? (
                  <span className="text-green-600 flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Location pinned
                  </span>
                ) : (
                  "Waiting for selection..."
                )}
              </div>
              <button
                onClick={handleNextStep}
                disabled={!markerPosition}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  markerPosition
                    ? "bg-[#F5891E] text-white shadow-md hover:bg-orange-600"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Confirm Location
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 1: ADDRESS DETAILS */}
        {step === 1 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col h-full"
          >
            <div className="p-6 pt-12 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Address Details
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Complete your warehouse specifics.
                </p>
              </div>
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#F5891E] bg-[#F5891E]/10 px-3 py-1.5 rounded-full hover:bg-[#F5891E]/20 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Edit Map Location
              </button>
            </div>

            <div className="px-6 flex-1 space-y-5">
              {/* Editable Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Warehouse Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Main Hub, Okhla Facility"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#F5891E]/20 focus:border-[#F5891E] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formAddress1}
                    onChange={(e) => setFormAddress1(e.target.value)}
                    placeholder="Building, Flat no., Floor"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#F5891E]/20 focus:border-[#F5891E] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Locked Map Fields */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Locked from map
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Address Line 2 (Locality)
                  </label>
                  <input
                    readOnly
                    value={formAddress2}
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      City
                    </label>
                    <input
                      readOnly
                      value={city}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      State
                    </label>
                    <input
                      readOnly
                      value={state}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Pincode
                  </label>
                  <input
                    readOnly
                    value={formPincode}
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 pt-4 flex justify-end gap-3 mt-4">
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#F5891E] text-white shadow-md hover:bg-orange-600 transition-all"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: CONTACT & SUBMIT */}
        {step === 2 && (
          <motion.div
            key="step2"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col h-full"
          >
            <div className="p-6 pt-12 pb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Contact Person
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Who manages this warehouse?
              </p>
            </div>

            <div className="px-6 flex-1 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={formPerson}
                  onChange={(e) => setFormPerson(e.target.value)}
                  placeholder="Manager's Name"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#F5891E]/20 focus:border-[#F5891E] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                    +91
                  </span>
                  <input
                    value={formPhone}
                    onChange={(e) =>
                      setFormPhone(
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#F5891E]/20 focus:border-[#F5891E] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#F5891E]/20 focus:border-[#F5891E] outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-6 pt-4 flex justify-between items-center mt-4">
              <button
                onClick={handlePrevStep}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md transition-all ${
                  submitting
                    ? "bg-orange-400 cursor-not-allowed"
                    : "bg-[#F5891E] hover:bg-orange-600"
                }`}
              >
                {submitting ? "Creating..." : "Create Warehouse"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MakeWarehouse;
