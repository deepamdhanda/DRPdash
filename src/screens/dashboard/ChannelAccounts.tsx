import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  getAllChannelAccounts,
  createChannelAccount,
  updateChannelAccount,
} from "../../APIs/channelAccount";
import { getAllChannels } from "../../APIs/channel";
import { getAllPools } from "../../APIs/pool";

export interface ChannelAccount {
  _id?: string;
  channel_account_name: string;
  pool_id?: { _id: string; name: string };
  channel_id?: { _id: string; channel_name: string };
  keys?: Record<string, any>;
  fulfillment_type?: "Self" | "Optional" | "Channel" | "Other";
  status: "active" | "inactive" | "suspended";
  admins?: Array<{ _id: string; name: string }>;
  created_by: string;
  ownership: { _id: string; name: string };
  createdAt?: string;
}

const ChannelAccounts: React.FC = () => {
  const [channelAccounts, setChannelAccounts] = useState<ChannelAccount[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [showModal, setShowModal] = useState(false);
  const [editingChannelAccount, setEditingChannelAccount] =
    useState<ChannelAccount | null>(null);
  const [keys, setKeys] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [channelAccountsData, channelsData, poolsData] = await Promise.all([
        getAllChannelAccounts(),
        getAllChannels(),
        getAllPools(),
      ]);
      setChannelAccounts(channelAccountsData);
      setChannels(channelsData);
      setPools(poolsData);
    } catch (error) {
      console.error("Error loading initial data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingChannelAccount(null);
    setKeys([]);
  };

  const handleShow = () => setShowModal(true);

  const handleEdit = (channelAccount: ChannelAccount) => {
    setEditingChannelAccount(channelAccount);
    if (channelAccount.keys) {
      const loadedKeys = Object.entries(channelAccount.keys).map(
        ([key, value]) => ({
          key,
          value: String(value),
        })
      );
      setKeys(loadedKeys);
    } else {
      setKeys([]);
    }
    setShowModal(true);
  };

  const handleToggleStatus = async (channelAccount: ChannelAccount) => {
    const newStatus =
      channelAccount.status === "active" ? "inactive" : "active";
    if (
      window.confirm(
        `Are you sure you want to mark this channel account as ${newStatus}?`
      )
    ) {
      try {
        await updateChannelAccount(channelAccount._id!, {
          ...channelAccount,
          status: newStatus,
        });
        fetchInitialData();
      } catch (error) {
        console.error("Error toggling status", error);
      }
    }
  };

  const handleKeyChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...keys];
    updated[index][field] = value;
    setKeys(updated);
  };

  const handleAddKey = () => {
    setKeys([...keys, { key: "", value: "" }]);
  };

  const handleRemoveKey = (index: number) => {
    const updated = [...keys];
    updated.splice(index, 1);
    setKeys(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as typeof e.target & {
      channel_account_name: { value: string };
      pool_id: { value: string };
      channel_id: { value: string };
      fulfillment_type: { value: string };
    };

    const keysObject: Record<string, any> = {};
    keys.forEach(({ key, value }) => {
      if (key.trim()) {
        keysObject[key.trim()] = value;
      }
    });

    const formData: ChannelAccount = {
      channel_account_name: form.channel_account_name.value.trim(),
      pool_id: form.pool_id.value
        ? pools.find((pool) => pool._id === form.pool_id.value)
        : undefined,
      channel_id: form.channel_id.value
        ? channels.find((channel) => channel._id === form.channel_id.value)
        : undefined,
      fulfillment_type: form.fulfillment_type.value as ChannelAccount["fulfillment_type"],
      keys: keysObject,
      status: editingChannelAccount?.status || "active",
      created_by: "",
      ownership: { _id: "", name: "" },
    };

    try {
      if (editingChannelAccount) {
        await updateChannelAccount(editingChannelAccount._id!, formData);
      } else {
        await createChannelAccount(formData);
      }
      fetchInitialData();
      handleClose();
    } catch (error) {
      console.error("Error saving channel account", error);
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row: ChannelAccount) => (
        <div>
          {row.status === "active"
            ? "🟢"
            : row.status === "inactive"
            ? "🔴"
            : "❌"}{" "}
          <strong>{row.channel_account_name}</strong>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Pool",
      selector: (row: ChannelAccount) => row.pool_id?.name || "—",
      sortable: true,
    },
    {
      name: "Channel",
      selector: (row: ChannelAccount) => row.channel_id?.channel_name || "—",
      sortable: true,
    },
    {
      name: "Admins",
      selector: (row: ChannelAccount) =>
        row.admins && row.admins.length > 0
          ? row.admins.map((admin) => admin.name).join(", ")
          : "—",
      wrap: true,
    },
    {
      name: "Ownership",
      selector: (row: ChannelAccount) => row.ownership?.name || "—",
      sortable: true,
    },
    {
      name: "Fulfillment",
      selector: (row: ChannelAccount) => row.fulfillment_type || "—",
      sortable: true,
    },
    {
      name: "Created On",
      selector: (row: ChannelAccount) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: ChannelAccount) => (
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
      width: "160px",
    },
  ];

  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Channel Accounts</h4>
        <Button onClick={handleShow}>+ New Channel Account</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : channelAccounts.length === 0 ? (
        <p>No channel accounts found.</p>
      ) : (
        <DataTable
          title="Your Channel Accounts"
          data={channelAccounts}
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

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingChannelAccount ? "Edit" : "Create"} Channel Account
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Channel Account Name</Form.Label>
              <Form.Control
                name="channel_account_name"
                defaultValue={editingChannelAccount?.channel_account_name}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Pool</Form.Label>
              <Form.Select
                name="pool_id"
                defaultValue={editingChannelAccount?.pool_id?._id || ""}
              >
                <option value="">Select Pool</option>
                {pools.map((pool) => (
                  <option key={pool._id} value={pool._id}>
                    {pool.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Channel</Form.Label>
              <Form.Select
                name="channel_id"
                defaultValue={editingChannelAccount?.channel_id?._id || ""}
              >
                <option value="">Select Channel</option>
                {channels.map((channel) => (
                  <option key={channel._id} value={channel._id}>
                    {channel.channel_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Fulfillment Type</Form.Label>
              <Form.Control
                as="select"
                name="fulfillment_type"
                defaultValue={editingChannelAccount?.fulfillment_type || ""}
              >
                <option value="">Select</option>
                <option value="Self">Self</option>
                <option value="Optional">Optional</option>
                <option value="Channel">Channel</option>
                <option value="Other">Other</option>
              </Form.Control>
            </Form.Group>

            <Form.Label className="mt-3">Keys</Form.Label>
            {keys.map((item, index) => (
              <Row key={index} className="mb-2">
                <Col>
                  <Form.Control
                    placeholder="Key"
                    value={item.key}
                    onChange={(e) =>
                      handleKeyChange(index, "key", e.target.value)
                    }
                  />
                </Col>
                <Col>
                  <Form.Control
                    placeholder="Value"
                    value={item.value}
                    onChange={(e) =>
                      handleKeyChange(index, "value", e.target.value)
                    }
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveKey(index)}
                  >
                    ×
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="outline-primary" size="sm" onClick={handleAddKey}>
              + Add Key
            </Button>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingChannelAccount ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export { ChannelAccounts };