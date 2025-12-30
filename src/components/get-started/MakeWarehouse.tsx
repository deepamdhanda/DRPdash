import React, { useState } from "react";
import { Card, Row, Col, Form, Button, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { createWarehouse } from "../../APIs/user/warehouse";
import { drpCrmBaseUrl } from "../../axios/urls";

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
  const [submitting, setSubmitting] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);

  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");

  const resetForm = (form?: HTMLFormElement | null) => {
    if (form) form.reset();
    setCity("");
    setState("");
    setEmail("");
  };

  const handlePincodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    e.target.value = value;

    if (value.length === 6) {
      try {
        setFetchingPincode(true);

        const { data } = await axios.get(
          `${drpCrmBaseUrl}/pincode?pincode=${value}`
        );

        if (Array.isArray(data) && data.length > 0) {
          const info = data[0];
          const state =
            info.statename.charAt(0).toUpperCase() +
            info.statename.slice(1).toLowerCase();
          setCity(info.district || "");
          setState(state || "");
        }
      } catch (err) {
        console.error(err);
        toast.warn("Failed to fetch city/state from pincode");
      } finally {
        setFetchingPincode(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement & {
      name: { value: string };
      address1: { value: string };
      address2: { value: string };
      pincode: { value: string };
      contact_person: { value: string };
      contact_phone: { value: string };
      latitude: { value: string };
      longitude: { value: string };
    };

    if (!city || !state) {
      toast.warn("City and State must be resolved from pincode");
      return;
    }

    setSubmitting(true);

    const payload: Warehouse = {
      name: form.name.value.trim(),
      address1: form.address1.value.trim(),
      address2: form.address2.value.trim() || undefined,
      City: city,
      State: state,
      Country: "IN",
      pincode: form.pincode.value,
      contact_person: form.contact_person.value.trim(),
      contact_phone: form.contact_phone.value.trim(),
      contact_email: email.trim(),
      latitude: form.latitude.value
        ? parseFloat(form.latitude.value)
        : undefined,
      longitude: form.longitude.value
        ? parseFloat(form.longitude.value)
        : undefined,
    };

    try {
      await createWarehouse(payload);
      toast.success("Warehouse created successfully");
      handleNext();
      resetForm(form);
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
                <Form.Control name="name" required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address Line 1</Form.Label>
                <Form.Control name="address1" required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address Line 2</Form.Label>
                <Form.Control name="address2" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Pincode</Form.Label>
                <Form.Control
                  name="pincode"
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
                    <Form.Control
                      name="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Select
                      name="State"
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
                <Form.Control name="contact_person" required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contact Phone</Form.Label>
                <Form.Control
                  name="contact_phone"
                  pattern="[6-9]\d{9}"
                  required
                  maxLength={10}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Contact Email <br /> (Required for all day-to-day pickups and
                  RTOs stats.)
                </Form.Label>
                <Form.Control
                  type="email"
                  name="contact_email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Label>Latitude</Form.Label>

                  <Form.Control name="latitude" type="number" step="any" />
                </Col>
                <Col md={6}>
                  <Form.Label>Longitude</Form.Label>

                  <Form.Control name="longitude" type="number" step="any" />
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => resetForm()}
                >
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
            <Col md={5}>
              <Card className="h-100 border-0 bg-light">
                <Card.Body>
                  <h6 className="mb-2">Tips</h6>
                  <ul className="small text-muted" style={{ paddingLeft: 18 }}>
                    <li>
                      Use a clear warehouse name to avoid confusion on shipping
                      rules.
                    </li>
                    <li>
                      Pincode should be accurate for courier rate calculations.
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
