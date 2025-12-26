import React, { useState, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  Badge,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";

import { createWarehouse } from "../../APIs/user/warehouse";
import { getUser } from "../../APIs/user/user";

export interface User {
  _id: string;
  name: string;
  email?: string;
}

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
  status?: "active" | "inactive" | "suspended";
  created_by?: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  createdAt?: string;
  admins?: string[]; // list of user ids
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

const MakeWarehouse: React.FC<{ handleNext: () => void }> = ({ handleNext }) => {
  const [submitting, setSubmitting] = useState(false);
  const [adminList, setAdminList] = useState<User[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const editPincodeTimerRef = useRef<number | null>(null);
  const newPincodeTimerRef = useRef<number | null>(null);
  const [editPincodeLoading, setEditPincodeLoading] = useState(false);
  const [newPincodeLoading, setNewPincodeLoading] = useState(false);

  const resetForm = (formEl?: HTMLFormElement | null) => {
    if (formEl) formEl.reset();
    setAdminList([]);
    setSearchEmail("");
  };

  const handleUserSearch = async (email?: string) => {
    const trimmed = (email ?? searchEmail).trim();
    if (!trimmed) {
      toast.warn("Enter an email to search");
      return;
    }

    setSearching(true);
    try {
      const user = await getUser(trimmed);
      setSearching(false);
      if (!user || user.length === 0) {
        toast.warn("User not found");
        return;
      }

      const userObj: User = user[0];
      if (adminList.some((u) => u._id === userObj._id)) {
        toast.info("User already added as admin");
        return;
      }
      setAdminList((prev) => [...prev, userObj]);
      toast.success("Added admin");
      setSearchEmail("");
    } catch (err) {
      setSearching(false);
      console.error("Error searching user", err);
      toast.error("Failed to search user");
    }
  };

  const removeAdmin = (id: string) =>
    setAdminList((prev) => prev.filter((a) => a._id !== id));

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

    // basic client-side validation
    if (!form.name.value.trim()) {
      toast.warn("Please enter a warehouse name");
      return;
    }
    if (!form.address1.value.trim()) {
      toast.warn("Please enter address line 1");
      return;
    }
    if (!form.City.value.trim()) {
      toast.warn("Please enter a city");
      return;
    }
    if (!form.pincode.value.trim() || !/^[1-9][0-9]{5}$/.test(form.pincode.value.trim())) {
      toast.warn("Enter a valid 6-digit pincode");
      return;
    }
    if (!form.contact_person.value.trim()) {
      toast.warn("Please enter contact person");
      return;
    }
    if (!form.contact_phone.value.trim() || !/^[6-9]\d{9}$/.test(form.contact_phone.value.trim())) {
      toast.warn("Enter a valid 10-digit mobile number");
      return;
    }
    if (!form.contact_email.value.trim()) {
      toast.warn("Enter contact email");
      return;
    }
    setSubmitting(true);

    const payload: Warehouse = {
      name: form.name.value.trim(),
      address1: form.address1.value.trim(),
      address2: form.address2.value.trim() || undefined,
      City: form.City.value.trim(),
      State: form.State.value,
      Country: "IN",
      pincode: form.pincode.value.trim(),
      contact_person: form.contact_person.value.trim(),
      contact_phone: form.contact_phone.value.trim(),
      contact_email: form.contact_email.value.trim(),
      latitude: form.latitude.value ? parseFloat(form.latitude.value) : undefined,
      longitude: form.longitude.value ? parseFloat(form.longitude.value) : undefined,
    };

    try {
      alert('1')
      await createWarehouse(payload);
      toast.success("Warehouse created");
      handleNext();
      resetForm(e.currentTarget as HTMLFormElement);
    } catch (err) {
      console.error("Error creating warehouse", err);
      toast.error("Failed to create warehouse");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Card className="shadow-sm" style={{ maxWidth: 980, margin: "24px auto" }}>
      <Card.Body>
        <Row className="align-items-center mb-3">
          <Col>
            <h4 className="mb-1">Create Your First Warehouse</h4>
            <div className="text-muted">Set up a fulfillment location to start receiving orders.</div>
          </Col>
          <Col xs="auto">
            <div className="text-end">
              <Badge bg="info">Onboarding</Badge>
            </div>
          </Col>
        </Row>

        <hr />

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={7}>
              <Form.Group className="mb-3" controlId="warehouseName">
                <Form.Label className="fw-medium">Warehouse Name</Form.Label>
                <Form.Control name="name" placeholder="e.g. Mumbai Fulfillment" required />
                <Form.Text className="text-muted">Visible to team when choosing fulfillment locations.</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="address1">
                <Form.Label className="fw-medium">Address line 1</Form.Label>
                <Form.Control name="address1" placeholder="Plot No/Khasra No/House No/Shop No" required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="address2">
                <Form.Label className="fw-medium">Address line 2</Form.Label>
                <Form.Control name="address2" placeholder="Gali No/Road Name/Landmark" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="pincode">
                <Form.Label className="fw-medium">Pincode</Form.Label>
                <Form.Control name="pincode" placeholder="6-digit PIN" pattern="[1-9][0-9]{5}" required />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="city">
                    <Form.Label className="fw-medium">City</Form.Label>
                    <Form.Control name="City" required />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="state">
                    <Form.Label className="fw-medium">State</Form.Label>
                    <Form.Select name="State" required defaultValue="">
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

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="contact_person">
                    <Form.Label className="fw-medium">Contact Person Name</Form.Label>
                    <Form.Control name="contact_person" required />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="contact_phone">
                    <Form.Label className="fw-medium">Contact Phone</Form.Label>
                    <Form.Control name="contact_phone" placeholder="10-digit mobile" pattern="[6-9]\d{9}" required />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="contact_email">
                <Form.Label className="fw-medium">Contact Email</Form.Label>
                <Form.Control name="contact_email" type="email" required />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="latitude">
                    <Form.Label className="fw-medium">Latitude (optional)</Form.Label>
                    <Form.Control name="latitude" type="number" step="any" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="longitude">
                    <Form.Label className="fw-medium">Longitude (optional)</Form.Label>
                    <Form.Control name="longitude" type="number" step="any" />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-secondary" type="button" onClick={() => resetForm()}>
                  Reset
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Warehouse"
                  )}
                </Button>
              </div>
            </Col>

            <Col md={5}>
              <Card className="h-100 border-0 bg-light">
                <Card.Body>
                  {/* 
                  <h6 className="mb-3">Add Admins</h6>

                  <InputGroup className="mb-2">
                    <Form.Control
                      placeholder="Search user by email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleUserSearch();
                        }
                      }}
                    />
                    <Button variant="outline-primary" onClick={() => handleUserSearch()} disabled={searching}>
                      {searching ? <Spinner animation="border" size="sm" /> : "Add"}
                    </Button>
                  </InputGroup>

                  <div className="mb-3">
                    {adminList.length === 0 ? (
                      <div className="small text-muted">No admins added. You can add team members by email.</div>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {adminList.map((u) => (
                          <Badge bg="secondary" key={u._id} style={{ fontSize: 13, padding: "8px 10px" }}>
                            <span style={{ marginRight: 8 }}>{u.name}</span>
                            <Button
                              variant="link"
                              onClick={() => removeAdmin(u._id)}
                              style={{ color: "white", padding: 0, marginLeft: 6 }}
                              aria-label={`Remove ${u.name}`}
                            >
                              ✕
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    </div> 
                    <hr />
                    */}


                  <h6 className="mb-2">Tips</h6>
                  <ul className="small text-muted" style={{ paddingLeft: 18 }}>
                    <li>Use a clear warehouse name to avoid confusion on shipping rules.</li>
                    <li>Pincode should be accurate for courier rate calculations.</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default MakeWarehouse;