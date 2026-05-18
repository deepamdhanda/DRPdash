import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Badge, Row, Col } from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  getAllChannelAccounts,
  createChannelAccount,
  updateChannelAccount,
  deactivateAccount,
} from "../../APIs/user/channelAccount";
import { getAllChannels } from "../../APIs/user/channel";
import { getAllPools } from "../../APIs/user/pool";
import { useLocation, useNavigate } from "react-router-dom";
import { initialChannelAccountFetch } from "../../APIs/user/initialChannelAccountFetch";
import { toast } from "react-toastify";
import { channelAccounts_url } from "../../URLs/user";

type Automation = {
  auto_ship: boolean;
  auto_ai_recommendation: boolean;
  auto_address_confirm: boolean;
  auto_ai_rating: boolean;
};

export interface ChannelAccount {
  _id?: string;
  channel_account_name: string;
  pool_id?: { _id: string; name: string };
  channel_id?: { _id: string; channel_name: string };
  keys?: Record<string, any>;
  fulfillment_type?: "Self" | "Optional" | "Channel" | "Other";
  status: "active" | "inactive" | "suspended";
  automation?: Automation;
  admins?: Array<{ _id: string; name: string }>;
  created_by?: string;
  ownership?: { _id: string; name: string };
  createdAt?: string;
}

const ChannelAccounts: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [fetchingProducts, setFetchingProducts] = useState<boolean>(false);
  const [fetchingOrders, setFetchingOrders] = useState<boolean>(false);
  const [showFetchingModal, setShowFetchingModal] = useState<boolean>(false);
  const [channelAccounts, setChannelAccounts] = useState<ChannelAccount[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [storeurl, setStoreUrl] = useState("");
  const [editingChannelAccount, setEditingChannelAccount] =
    useState<ChannelAccount | null>(null);
  const [keys, setKeys] = useState<
    { key: string; value: string; disabled?: boolean }[]
  >([]);

  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [selectedChannelName, setSelectedChannelName] =
    useState<string>("Custom");

  const [selectedPoolAdmins, setSelectedPoolAdmins] = useState<any[]>([]);
  const [adminAccess, setAdminAccess] = useState<string[]>([]);
  const [automation, setAutomation] = useState({
    auto_ship: true,
    auto_ai_recommendation: true,
    auto_address_confirm: true,
    auto_ai_rating: true,
  });
  const location = useLocation();

  useEffect(() => {
    fetchInitialData();
  }, [page, limit]);

  useEffect(() => {
    checkNewToken();
  }, [channels]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [channelAccountsData, channelsData, poolsData] = await Promise.all([
        getAllChannelAccounts(page, limit),
        getAllChannels(),
        getAllPools(),
      ]);
      setTotalRecords(channelAccountsData.total);
      setChannelAccounts(channelAccountsData.data);
      setChannels(channelsData);
      setPools(poolsData.data);
    } catch (error) {
      console.error("Error loading initial data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchingClose = () => {
    setFetchingProducts(false);
    setShowFetchingModal(false);
    setFetchingOrders(false);
  };

  const startInitialChannelAccountFetch = async (channel: ChannelAccount) => {
    setFetchingProducts(true);
    setShowFetchingModal(true);
    setFetchingOrders(true);
    const productsPromise = initialChannelAccountFetch(channel._id, "products")
      .then((result) => {
        handleFetchingClose();
        return result;
      })
      .catch((err) => {
        handleFetchingClose();
        throw err;
      });

    const ordersPromise = initialChannelAccountFetch(channel._id, "orders")
      .then((result) => {
        handleFetchingClose();
        return result;
      })
      .catch((err) => {
        handleFetchingClose();
        throw err;
      });

    await Promise.all([productsPromise, ordersPromise]);
  };

  const checkNewToken = () => {
    const params = new URLSearchParams(location.search);
    if (
      params.get("channel") === "shopify" &&
      params.get("token") &&
      params.get("store_url")
    ) {
      let existingAccount = channelAccounts.find(
        (ca) =>
          ca.channel_id?.channel_name.toLowerCase() === "shopify" &&
          ca.keys?.store_url === params.get("store_url")
      );

      if (existingAccount) {
        toast.info(
          "A Shopify channel account with this store URL already exists. Just click on update if you want to update the keys."
        );
        existingAccount.keys = {
          ...existingAccount.keys,
          api_access_token: params.get("token") || "",
        };
        handleEdit(existingAccount);
        return;
      }

      const shopifyChannel = channels.find(
        (c) => c.channel_name.toLowerCase() === "shopify"
      );

      if (shopifyChannel) setSelectedChannelId(shopifyChannel._id);
      setSelectedChannelName("shopify");

      setKeys([
        {
          key: "api_access_token",
          value: params.get("token") || "",
          disabled: true,
        },
        {
          key: "store_url",
          value: params.get("store_url") || "",
          disabled: true,
        },
      ]);
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingChannelAccount(null);
    setSelectedChannelId("");
    setSelectedChannelName("custom");
    setKeys([]);
    setAdminAccess([]);
    setSelectedPoolAdmins([]);
    setAutomation({
      auto_ship: false,
      auto_ai_recommendation: false,
      auto_address_confirm: false,
      auto_ai_rating: false,
    });
    navigate(location.pathname, { replace: true });
  };

  const handleShow = () => setShowModal(true);

  const handleEdit = (channelAccount: ChannelAccount) => {
    setEditingChannelAccount(channelAccount);

    const cName =
      channelAccount.channel_id?.channel_name.toLowerCase() || "custom";
    setSelectedChannelName(cName);
    setSelectedChannelId(channelAccount.channel_id?._id || "");

    if (channelAccount.keys) {
      setKeys(
        Object.entries(channelAccount.keys).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      );
    } else {
      setKeys([]);
    }
    if (channelAccount.pool_id?._id) {
      handlePoolChange(channelAccount.pool_id._id);
    }
    if (channelAccount.admins) {
      setAdminAccess(channelAccount.admins.map((a) => a._id));
    }
    setAutomation({
      auto_ship: channelAccount.automation?.auto_ship || false,
      auto_ai_recommendation:
        channelAccount.automation?.auto_ai_recommendation || false,
      auto_address_confirm:
        channelAccount.automation?.auto_address_confirm || false,
      auto_ai_rating: channelAccount.automation?.auto_ai_rating || false,
    });
    setShowModal(true);
  };

  const handlePoolChange = (poolId: string) => {
    const selectedPool = pools.find((pool) => pool._id === poolId);
    if (selectedPool?.admins) {
      setSelectedPoolAdmins(selectedPool.admins);
    } else {
      setSelectedPoolAdmins([]);
    }
  };

  const handleAdminAccessChange = (isChecked: boolean, adminId: string) => {
    setAdminAccess((prevAccess) =>
      isChecked
        ? [...prevAccess, adminId]
        : prevAccess.filter((id) => id !== adminId)
    );
  };

  const handleChannelChange = (e: any) => {
    const selectedId = e.target.value;
    setSelectedChannelId(selectedId);

    const selectedChannel = channels.find((c) => c._id === selectedId);
    const channelName = selectedChannel?.channel_name.toLowerCase() || "custom";

    setSelectedChannelName(channelName);

    if (channelName === "woocommerce") {
      setKeys([
        { key: "store_url", value: "", disabled: true },
        { key: "consumer_key", value: "", disabled: true },
        { key: "consumer_secret", value: "", disabled: true },
      ]);
    } else {
      setKeys([]); // Shopify and Custom won't show manually added keys
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

  const handleToggleStatus = async (channelAccount: ChannelAccount) => {
    const newStatus =
      channelAccount.status === "active" ? "inactive" : "active";
    if (
      window.confirm(
        `Are you sure you want to mark this channel account as ${newStatus}?`
      )
    ) {
      try {
        await deactivateAccount(channelAccount._id!);
        fetchInitialData();
      } catch (error) {
        console.error("Error toggling status", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as typeof e.target & {
      channel_account_name: { value: string };
      pool_id: { value: string };
      channel_id: { value: string };
    };

    const keysObject: Record<string, any> = {};
    keys.forEach(({ key, value }) => {
      if (key.trim()) {
        keysObject[key.trim()] = value;
      }
    });

    const formData: ChannelAccount = {
      channel_account_name: form.channel_account_name.value.trim(),
      pool_id: pools.find((pool) => pool._id === form.pool_id.value),
      channel_id: channels.find(
        (channel) => channel._id === form.channel_id.value
      ),
      fulfillment_type: "Self",
      keys: keysObject,
      status: editingChannelAccount?.status || "active",
      admins: selectedPoolAdmins
        .filter((admin) => adminAccess.includes(admin._id))
        .map((admin) => admin._id),
      automation: { ...automation },
    };

    let result: any = false;
    try {
      if (editingChannelAccount) {
        result = await updateChannelAccount(
          editingChannelAccount._id!,
          formData
        );
      } else {
        result = (await createChannelAccount(formData)) as ChannelAccount;
      }
      console.log(result);

      const submittedChannel = channels.find(
        (c) => c._id === form.channel_id.value
      );
      if (
        submittedChannel?.channel_name.toLowerCase() !== "custom" &&
        result?.data
      ) {
        startInitialChannelAccountFetch(result.data);
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
      cell: (row: ChannelAccount) => (
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
      cell: (row: ChannelAccount) => (
        <div>
          {row.admins?.map((admin) => {
            const colors = [
              "info",
              "warning",
              "danger",
              "light",
              "primary",
              "secondary",
              "dark",
            ];
            const uniqueIndex =
              admin._id
                .split("")
                .reduce((acc, char) => acc + char.charCodeAt(0), 0) %
              colors.length;

            return (
              <Badge key={admin._id} className="me-1" bg={colors[uniqueIndex]}>
                {admin.name}
              </Badge>
            );
          })}
        </div>
      ),
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
        <div style={{ display: "flex", gap: "6px" }}>
          <Button
            variant="outline-primary"
            size="sm"
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
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => startInitialChannelAccountFetch(row)}
          >
            Fetch
          </Button>
        </div>
      ),
      button: true,
      width: "210px",
    },
  ];
  const [woo, setWoo] = useState(false);
  const [wooName, setWooName] = useState("");
  const [wooPoolId, setWooPoolId] = useState("");
  const [isWooConnecting, setIsWooConnecting] = useState(false);

  const handleConnectWooCommerce = async () => {
    if (!storeurl || !wooName || !wooPoolId) {
      toast.error("Please fill in all fields (URL, Name, and Pool).");
      return;
    }

    setIsWooConnecting(true);
    try {
      const woocomId = channels.find(
        (item) => item.channel_name.toLowerCase() === "woocommerce"
      )._id;

      const response = await fetch(`${channelAccounts_url}/woo/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          store_url: storeurl,
          channel_account_name: wooName,
          pool_id: wooPoolId,
          channel_id: woocomId,
        }),
      });

      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error("Failed to generate authorization URL.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred connecting to the server.");
    } finally {
      setIsWooConnecting(false);
    }
  };
  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Channel Accounts</h4>
        <div className="d-flex gap-3">
          <Button onClick={handleShow}>+ New Channel Account</Button>
          <Button onClick={() => setWoo(true)}>
            + Add WooCommerce Account
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : channelAccounts.length === 0 ? (
        <p>No channel accounts found.</p>
      ) : (
        <DataTable
          title="Your Channel Accounts"
          columns={columns}
          data={channelAccounts}
          pagination
          paginationServer
          paginationTotalRows={totalRecords}
          paginationDefaultPage={page}
          paginationPerPage={limit}
          onChangePage={(p) => setPage(p)}
          onChangeRowsPerPage={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          highlightOnHover
          responsive
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
                onChange={(e) => handlePoolChange(e.target.value)}
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

            {selectedPoolAdmins.length > 0 && (
              <Form.Group className="mb-2">
                <Form.Label>Admins</Form.Label>
                <div>
                  {selectedPoolAdmins.map((admin) => (
                    <Form.Check
                      key={admin._id}
                      type="checkbox"
                      label={admin.name}
                      value={admin._id}
                      checked={adminAccess.includes(admin._id)}
                      onChange={(e) =>
                        handleAdminAccessChange(e.target.checked, admin._id)
                      }
                    />
                  ))}
                </div>
              </Form.Group>
            )}

            <Form.Group className="mb-2">
              <Form.Label>Channel</Form.Label>
              <Form.Select
                name="channel_id"
                onChange={handleChannelChange}
                value={selectedChannelId}
              >
                <option value="" disabled>
                  Select Channel
                </option>
                {channels
                  .filter((channel) => {
                    // If selected channel is Shopify,
                    // only keep the selected Shopify channel
                    if (selectedChannelName?.toLowerCase() === "shopify") {
                      return channel._id === selectedChannelId;
                    }

                    // Otherwise remove all Shopify channels
                    return channel.channel_name?.toLowerCase() !== "shopify";
                  })
                  .map((channel) => (
                    <option key={channel._id} value={channel._id}>
                      {channel.channel_name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Automation Settings</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                <Form.Check
                  type="switch"
                  id="auto_ship"
                  label="Auto Ship"
                  checked={automation.auto_ship}
                  onChange={(e) =>
                    setAutomation((a) => ({
                      ...a,
                      auto_ship: e.target.checked,
                    }))
                  }
                />
                <Form.Check
                  type="switch"
                  id="auto_ai_recommendation"
                  label="OUAI Courier Recommendation"
                  checked={automation.auto_ai_recommendation}
                  onChange={(e) =>
                    setAutomation((a) => ({
                      ...a,
                      auto_ai_recommendation: e.target.checked,
                    }))
                  }
                />
                <Form.Check
                  type="switch"
                  id="auto_address_confirm"
                  label="Auto WhatsApp"
                  checked={automation.auto_address_confirm}
                  onChange={(e) =>
                    setAutomation((a) => ({
                      ...a,
                      auto_address_confirm: e.target.checked,
                    }))
                  }
                />
                <Form.Check
                  type="switch"
                  id="auto_ai_rating"
                  label="OUAI Customer Rating"
                  checked={automation.auto_ai_rating}
                  onChange={(e) =>
                    setAutomation((a) => ({
                      ...a,
                      auto_ai_rating: e.target.checked,
                    }))
                  }
                />
              </div>
            </Form.Group>

            {keys.length > 0 && <Form.Label className="mt-3">Keys</Form.Label>}
            {keys.map((item, index) => (
              <Row key={index} className="mb-2 align-items-center">
                <Col md={4}>
                  <Form.Label className="m-0 fw-semibold text-muted">
                    {item.key.replace(/_/g, " ").toUpperCase()}
                  </Form.Label>
                </Col>
                <Col md={8}>
                  <Form.Control
                    placeholder="Value"
                    value={item.value}
                    onChange={(e) =>
                      handleKeyChange(index, "value", e.target.value)
                    }
                    required
                  />
                </Col>
              </Row>
            ))}
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
      <Modal show={woo} onHide={() => setWoo(false)} centered backdrop="static">
        {/* Header */}
        <div className="bg-dark text-white px-4 py-3 border-bottom">
          <h5 className="mb-1 fw-bold">Connect WooCommerce Store</h5>
        </div>

        <div className="p-4 bg-white">
          {/* Account Name */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Account Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., My Woo Store - US"
              value={wooName}
              onChange={(e) => setWooName(e.target.value)}
            />
          </Form.Group>

          {/* Pool Selection */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Assign to Pool</Form.Label>
            <Form.Select
              value={wooPoolId}
              onChange={(e) => setWooPoolId(e.target.value)}
            >
              <option value="">Select a Pool...</option>
              {pools.map((pool) => (
                <option key={pool._id} value={pool._id}>
                  {pool.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Store URL */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Store URL</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://yourstore.com"
              value={storeurl}
              onChange={(e) => setStoreUrl(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" onClick={() => setWoo(false)}>
              Cancel
            </Button>
            <Button
              variant="dark"
              onClick={handleConnectWooCommerce}
              disabled={isWooConnecting}
            >
              {isWooConnecting ? "Connecting..." : "Connect Store"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal show={showFetchingModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Fetching Data from Channel Store</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontWeight: 600, marginRight: "8px" }}>
              📦 Fetching Products:
            </span>
            {fetchingProducts ? (
              <span style={{ color: "#f5891e", fontWeight: 500 }}>
                ⏳ Processing...
              </span>
            ) : (
              <span style={{ color: "green", fontWeight: 500 }}>
                ✅ Complete
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontWeight: 600, marginRight: "8px" }}>
              🚚 Fetching Orders:
            </span>
            {fetchingOrders ? (
              <span style={{ color: "#f5891e", fontWeight: 500 }}>
                ⏳ Processing...
              </span>
            ) : (
              <span style={{ color: "green", fontWeight: 500 }}>
                ✅ Complete
              </span>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export { ChannelAccounts };
