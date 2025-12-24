import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

import { createWarehouse } from "../../APIs/user/warehouse";
import { getUser } from "../../APIs/user/user";
import { toast } from "react-toastify";

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

const MakeWarehouse: React.FC = () => {
  const [adminList, setAdminList] = useState<User[]>([]);

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
      admins: adminList.map((admin) => admin._id),
    };

    try {
      await createWarehouse(formData);
    } catch (error) {
      console.error("Error saving warehouse", error);
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

  return (
    <div className="container mt-4 ms-2 me-2">
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Address 1</Form.Label>
            <Form.Control name="address1" required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Address 2</Form.Label>
            <Form.Control name="address2" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>City</Form.Label>
            <Form.Control name="City" required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>State</Form.Label>
            <Form.Control as="select" name="State" required>
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
              required
              pattern="[1-9][0-9]{5}"
              title="Enter a valid 6-digit Indian pincode"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Contact Person</Form.Label>
            <Form.Control name="contact_person" required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Contact Phone</Form.Label>
            <Form.Control
              name="contact_phone"
              required
              pattern="[6-9]\d{9}"
              title="Enter a valid 10-digit Indian mobile number"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Contact Email</Form.Label>
            <Form.Control name="contact_email" type="email" required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Latitude</Form.Label>
            <Form.Control name="latitude" type="number" step="any" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Longitude</Form.Label>
            <Form.Control name="longitude" type="number" step="any" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              name="status"
              defaultValue={"active"}
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
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" variant="primary">
            Create
          </Button>
        </Modal.Footer>
      </Form>
    </div>
  );
};

export default MakeWarehouse;
