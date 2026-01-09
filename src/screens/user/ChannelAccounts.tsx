import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
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
  const [editingChannelAccount, setEditingChannelAccount] =
    useState<ChannelAccount | null>(null);
  const [keys, setKeys] = useState<
    { key: string; value: string; disabled?: boolean }[]
  >([]);
  const [url_channel, setUrlChannel] = useState<any>();
  const [selectedPoolAdmins, setSelectedPoolAdmins] = useState<any[]>([]);
  const [adminAccess, setAdminAccess] = useState<string[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>("Custom");
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
        return result; // pass the result along
      })
      .catch((err) => {
        handleFetchingClose();
        throw err; // still fail if products fetch fails
      });

    const ordersPromise = initialChannelAccountFetch(channel._id, "orders")
      .then((result) => {
        handleFetchingClose();
        return result; // pass the result along
      })
      .catch((err) => {
        handleFetchingClose();
        throw err; // still fail if products fetch fails
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
      setSelectedChannel((params.get("channel") || "").toLowerCase());
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
      setUrlChannel(
        channels.find((c) => c.channel_name.toLowerCase() === "shopify")
      );
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingChannelAccount(null);
    setUrlChannel(null);
    setKeys([]);
    setAdminAccess([]);
    setSelectedChannel("custom");
    setSelectedPoolAdmins([]);
    setAutomation({
      auto_ship: false,
      auto_ai_recommendation: false,
      auto_address_confirm: false,
      auto_ai_rating: false,
    });
    navigate(location.pathname, { replace: true }); // updates URL without reloading

  };

  const handleShow = () => setShowModal(true);

  const handleEdit = (channelAccount: ChannelAccount) => {
    setEditingChannelAccount(channelAccount);
    setSelectedChannel(
      channelAccount.channel_id?.channel_name.toLowerCase() || "custom"
    );
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
      auto_address_confirm: channelAccount.automation?.auto_address_confirm || false,
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
    const selectedChannel = channels.find((c) => c._id === selectedId);
    if (selectedChannel?.channel_name.toLowerCase() === "shopify") {
      setKeys([]);
    } else {
      setKeys([]);
    }
  };

  // const handleKeyChange = (index: number, field: "key" | "value", value: string) => {
  //   const updated = [...keys];
  //   updated[index][field] = value;
  //   setKeys(updated);
  // };

  // const handleAddKey = () => {
  //   setKeys([...keys, { key: "", value: "" }]);
  // };

  // const handleRemoveKey = (index: number) => {
  //   const updated = [...keys];
  //   updated.splice(index, 1);
  //   setKeys(updated);
  // };

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
        result = (await updateChannelAccount(
          editingChannelAccount._id!,
          formData
        )) as ChannelAccount;
      } else {
        result = (await createChannelAccount(formData)) as ChannelAccount;
      }
      channels.find((c) => c._id === form.channel_id.value)?.channel_name !== "Custom" && startInitialChannelAccountFetch(result);
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

            // Unique deterministic color selection per admin
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
        // <DataTable
        //   title="Your Channel Accounts"
        //   data={channelAccounts}
        //   columns={columns}
        //   highlightOnHover
        //   defaultSortFieldId={1}
        //   pagination
        //   paginationRowsPerPageOptions={[10, 20, 50, 100]}
        //   responsive
        //   fixedHeader
        //   persistTableHead
        //   striped
        // />
        <DataTable
          title="Your Channel Accounts"
          columns={columns}
          data={channelAccounts}
          pagination
          paginationServer
          paginationTotalRows={totalRecords}
          paginationDefaultPage={page}
          paginationPerPage={limit}
          onChangePage={(p) => {
            setPage(p);
          }}
          onChangeRowsPerPage={(newLimit) => {
            setLimit(newLimit);
            setPage(1); // ALWAYS reset to page 1 when limit changes
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
                value={
                  url_channel?._id ||
                  editingChannelAccount?.channel_id?._id ||
                  ""
                }
              >
                {channels
                  .filter((i) => {
                    return (
                      i.channel_name.toLowerCase() ==
                      selectedChannel.toLowerCase()
                    );
                  })
                  .map((channel) => (
                    <option selected key={channel._id} value={channel._id}>
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
            {/* <Form.Label className="mt-3">Keys</Form.Label>
            {keys.filter((i: any) => i.disabled === false || i.disabled === undefined).map((item, index) => (
              <Row key={index} className="mb-2">
                <Col>
                  <Form.Label className="mt-3">
                    {item.key.replace(/_/g, " ").toUpperCase()}
                  </Form.Label>
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
            </Button> */}
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
