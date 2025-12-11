import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  Table,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { getUser } from "../../APIs/user/user";
import { Link } from "react-router-dom";

type PermissionAction = "read" | "write";
type ModuleName =
  | "product"
  | "productSKU"
  | "productPack"
  | "warehouse"
  | "pool"
  | "courier"
  | "productSKUChannelLink"
  | "finance"
  | "walletTransaction"
  | "order"
  | "scanOrder"
  | "ticket"
  | "channelAccount"
  | "channel"
  | "amazonS3"
  | "walletRecharge"
  | "supportChat"
  | "dashboard"
  | "user";

type Permissions = {
  [K in ModuleName]?: PermissionAction[];
};

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  gstNumber?: string;
};

type User = {
  name: string;
  email: string;
  phone: string;
  permissions: Permissions;
  status: "active" | "inactive";
};

const ALL_MODULES: Record<ModuleName, PermissionAction[]> = {
  product: ["read", "write"],
  productSKU: ["read", "write"],
  productPack: ["read", "write"],
  warehouse: ["read", "write"],
  pool: ["read", "write"],
  courier: ["read"],
  productSKUChannelLink: ["read", "write"],
  finance: ["read", "write"],
  walletTransaction: ["read", "write"],
  order: ["read", "write"],
  scanOrder: ["read", "write"],
  ticket: ["read", "write"],
  channelAccount: ["read", "write"],
  channel: ["read"],
  amazonS3: ["read", "write"],
  walletRecharge: ["read", "write"],
  supportChat: ["read", "write"],
  dashboard: ["read", "write"],
  user: ["read", "write"],
};

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    gstNumber: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const [newUser, setNewUser] = useState<User>({
    name: "",
    email: "",
    phone: "",
    permissions: {},
    status: "active",
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const fetchedProfile: UserProfile = await getUser();
    setProfile(fetchedProfile);
  };
  const openProfileModal = () => {
    setTempProfile(profile);
    setShowProfileModal(true);
  };

  const openUserModal = (user?: User, index?: number) => {
    if (user && typeof index === "number") {
      setNewUser(user);
      setEditingIndex(index);
    } else {
      setNewUser({
        name: "",
        email: "",
        phone: "",
        permissions: {},
        status: "active",
      });
      setEditingIndex(null);
    }
    setShowUserModal(true);
  };

  const togglePermission = (module: ModuleName, action: PermissionAction) => {
    const current = newUser.permissions[module] || [];
    const updated = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action];

    setNewUser((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: updated,
      },
    }));
  };

  const saveProfile = async () => {
    setLoadingProfile(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setProfile(tempProfile);
      toast.success("Profile updated successfully!");
      setShowProfileModal(false);
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const createOrUpdateUser = async () => {
    setCreatingUser(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      if (editingIndex !== null) {
        const updatedUsers = [...users];
        updatedUsers[editingIndex] = newUser;
        setUsers(updatedUsers);
        toast.success("User updated!");
      } else {
        setUsers([...users, newUser]);
        toast.success("User created!");
      }
      setShowUserModal(false);
    } catch {
      toast.error("Error saving user");
    } finally {
      setCreatingUser(false);
      setEditingIndex(null);
    }
  };

  const toggleUserStatus = (index: number) => {
    const updatedUsers = [...users];
    updatedUsers[index].status =
      updatedUsers[index].status === "active" ? "inactive" : "active";
    setUsers(updatedUsers);
    toast.info(`User is now ${updatedUsers[index].status}`);
  };

  const displayValue = (val?: string) =>
    val && val.trim() !== "" ? val : <i className="text-muted">Not provided</i>;

  return (
    <div className="container my-5" style={{ maxWidth: 1000 }}>
      <h2 className="mb-4 text-primary">Settings</h2>

      {/* Profile Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Profile Information</h5>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={openProfileModal}
          >
            Edit
          </Button>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <strong>Name:</strong> {displayValue(profile.name)}
            </Col>
            <Col md={6}>
              <strong>Email:</strong> {displayValue(profile.email)}
            </Col>
          </Row>
          <Row className="mt-2">
            <Col md={6}>
              <strong>Phone:</strong> {displayValue(profile.phone)}
            </Col>
            <Col md={6}>
              <strong>GST Number:</strong> {displayValue(profile.gstNumber)}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Users</h5>
          <Button variant="success" size="sm" onClick={() => openUserModal()}>
            Create User
          </Button>
        </Card.Header>
        <Card.Body>
          {users.length === 0 ? (
            <p className="text-muted">No users created yet.</p>
          ) : (
            <Table bordered>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={idx}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>
                      <span
                        className={
                          u.status === "active" ? "text-success" : "text-danger"
                        }
                      >
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {Object.entries(u.permissions).map(([mod, acts]) => (
                        <div key={mod}>
                          <strong>{mod}:</strong> {acts.join(", ")}
                        </div>
                      ))}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="warning"
                        className="me-2"
                        onClick={() => openUserModal(u, idx)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          u.status === "active"
                            ? "outline-danger"
                            : "outline-success"
                        }
                        onClick={() => toggleUserStatus(idx)}
                      >
                        {u.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Profile Modal */}
      <Modal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={tempProfile.name}
                onChange={(e) =>
                  setTempProfile({ ...tempProfile, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={tempProfile.email}
                onChange={(e) =>
                  setTempProfile({ ...tempProfile, email: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                value={tempProfile.phone}
                onChange={(e) =>
                  setTempProfile({ ...tempProfile, phone: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowProfileModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={saveProfile}
            disabled={loadingProfile}
          >
            {loadingProfile ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* User Modal */}
      <Modal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        size="lg"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingIndex !== null ? "Edit User" : "Create New User"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <hr />
            <h6>Permissions</h6>
            {Object.entries(ALL_MODULES).map(([module, actions]) => (
              <div
                key={module}
                className="d-flex"
                style={{ justifyContent: "space-between" }}
              >
                <strong className="text-capitalize">{module}</strong>
                <div className="d-flex flex-wrap mb-2">
                  {actions.map((action) => (
                    <Form.Check
                      key={action}
                      type="checkbox"
                      id={`${module}-${action}`}
                      label={action}
                      checked={
                        newUser.permissions[module as ModuleName]?.includes(
                          action
                        ) || false
                      }
                      onChange={() =>
                        togglePermission(module as ModuleName, action)
                      }
                      className="me-3"
                    />
                  ))}
                </div>
              </div>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={createOrUpdateUser}
            disabled={creatingUser}
          >
            {creatingUser ? (
              <Spinner animation="border" size="sm" />
            ) : editingIndex !== null ? (
              "Save Changes"
            ) : (
              "Create User"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="text-center mt-4 mb-2">
        <small className="text-muted">
          By using this platform you agree to our{" "}
          <Link
            to="https://orderzup.com/terms-conditions/"
            className="text-primary"
          >
            Terms & Conditions
          </Link>{" "}
          and{" "}
          <Link
            to="https://orderzup.com/privacy-policy/"
            className="text-primary"
          >
            Privacy Policy
          </Link>
          .
        </small>
      </div>
    </div>
  );
};

export default Settings;
