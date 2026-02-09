import React, { useState, useRef, useCallback } from "react";
import { Card, Row, Col, Form, Button, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";

import { createWarehouse } from "../../APIs/user/warehouse";
import { drpCrmBaseUrl } from "../../axios/urls";

const GOOGLE_MAPS_API_KEY = "AIzaSyANgy6kbp_ciumVNTAwakMFTXdCW3rVZfg";
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const LIBRARIES: "places"[] = ["places"];

// --- Interfaces ---
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

const MakeWarehouse: React.FC<{ handleNext: () => void }> = ({
  handleNext,
}) => {
  // --- Form State ---
  const [submitting, setSubmitting] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);
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
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
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
  };

  const handlePincodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormPincode(value);

    if (value.length === 6) {
      try {
        setFetchingPincode(true);
        const { data } = await axios.get(
          `${drpCrmBaseUrl}/pincode?pincode=${value}`
        );
        if (Array.isArray(data) && data.length > 0) {
          const info = data[0];
          setCity(info.district || "");
          setState(
            info.statename.charAt(0).toUpperCase() +
              info.statename.slice(1).toLowerCase() || ""
          );
        }
      } catch (err) {
        toast.warn("Failed to fetch city/state from pincode");
      } finally {
        setFetchingPincode(false);
      }
    }
  };

  // Map: Handle Click
  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarkerPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, []);

  // Map: Handle Search Selection
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!city || !state) {
      toast.warn("City and State must be resolved from pincode");
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
      // Use the map state for lat/long
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

  return (
    <Card className="shadow-sm" style={{ maxWidth: 980, margin: "24px auto" }}>
      <Card.Body>
        <Row className="mb-3">
          <Col>
            <h4>Create Your First Warehouse</h4>
            <div className="text-muted">
              Set up a fulfillment location to start receiving orders.
            </div>
          </Col>
          <Col xs="auto">
            <Badge bg="info">Onboarding</Badge>
          </Col>
        </Row>

        <hr />

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={7}>
              <Form.Group className="mb-3">
                <Form.Label>Warehouse Name</Form.Label>
                <Form.Control
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address Line 1</Form.Label>
                <Form.Control
                  value={formAddress1}
                  onChange={(e) => setFormAddress1(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address Line 2</Form.Label>
                <Form.Control
                  value={formAddress2}
                  onChange={(e) => setFormAddress2(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Pincode</Form.Label>
                <Form.Control
                  value={formPincode}
                  maxLength={6}
                  inputMode="numeric"
                  onChange={handlePincodeChange}
                  required
                />
                {fetchingPincode && (
                  <Form.Text className="text-muted">
                    Fetching location…
                  </Form.Text>
                )}
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control value={city} readOnly required />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Contact Person</Form.Label>
                <Form.Control
                  value={formPerson}
                  onChange={(e) => setFormPerson(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contact Phone</Form.Label>
                <Form.Control
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  pattern="[6-9]\d{9}"
                  required
                  maxLength={10}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Contact Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              {/* --- Google Map Section --- */}
              <div className="mb-4 border rounded p-3 bg-light">
                <Form.Label className="fw-bold">
                  Warehouse Location (Latitude & Longitude)
                </Form.Label>
                <div className="text-muted small mb-2">
                  Search for your area or click on the map to pin the exact
                  location.
                </div>

                {isLoaded ? (
                  <>
                    {/* Search Box */}
                    <div className="mb-2">
                      <Autocomplete
                        onLoad={(autocomplete) =>
                          (autocompleteRef.current = autocomplete)
                        }
                        onPlaceChanged={onPlaceChanged}
                      >
                        <Form.Control
                          type="text"
                          placeholder="Search Location (e.g. Okhla Phase 3)"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                          }} // Prevent form submit on Enter
                        />
                      </Autocomplete>
                    </div>

                    {/* Map */}
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

                    {/* Selected Coordinates Display */}
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

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" type="button" onClick={resetForm}>
                  Reset
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submitting || fetchingPincode}
                >
                  {submitting ? "Creating..." : "Create Warehouse"}
                </Button>
              </div>
            </Col>

            {/* Right Sidebar */}
            <Col md={5}>
              <Card className="h-100 border-0 bg-light">
                <Card.Body>
                  <h6 className="mb-2">Tips</h6>
                  <ul className="small text-muted" style={{ paddingLeft: 18 }}>
                    <li>Use a clear warehouse name.</li>
                    <li>Pincode determines shipping rates.</li>
                    <li>
                      <strong>Accurate Map Location:</strong> Ensure the pin is
                      accurate. This helps delivery partners locate your
                      warehouse for pickups.
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default MakeWarehouse;
