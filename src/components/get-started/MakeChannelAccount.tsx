import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Badge,
  Spinner,
  Modal,
} from "react-bootstrap";
import { toast } from "react-toastify";

import { createChannelAccount } from "../../APIs/user/channelAccount";
import { getAllChannels } from "../../APIs/user/channel";
import { getAllPools } from "../../APIs/user/pool";
import { initialChannelAccountFetch } from "../../APIs/user/initialChannelAccountFetch";
import { FaExternalLinkAlt } from "react-icons/fa";

type Automation = {
  auto_ship: boolean;
  auto_ai_recommendation: boolean;
  auto_whatsapp: boolean;
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

const MakeChannelAccount: React.FC<{ handleNext: () => void }> = ({
  handleNext,
}) => {
  const [channels, setChannels] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [channelAccountName, setChannelAccountName] = useState<string>("");
  const [keys, setKeys] = useState<
    { key: string; value: string; disabled?: boolean }[]
  >([{ key: "", value: "" }]);
  const [selectedPoolAdmins, setSelectedPoolAdmins] = useState<any[]>([]);
  const [adminAccess, setAdminAccess] = useState<string[]>([]);
  const [automation, setAutomation] = useState<Automation>({
    auto_ship: true,
    auto_ai_recommendation: true,
    auto_whatsapp: true,
    auto_ai_rating: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [showFetchingModal, setShowFetchingModal] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [channelsData, poolsData] = await Promise.all([
          getAllChannels(),
          getAllPools(),
        ]);
        setChannels(channelsData || []);
        channelsData.find((c) => {
          if (c.channel_name === "Custom") {
            setSelectedChannelId(c._id);
          }
        });
        setPools(poolsData?.data || []);
      } catch (err) {
        console.error("Failed to load channels/pools", err);
      }
    })();
  }, []);

  const handlePoolChange = (poolId: string) => {
    setSelectedPoolId(poolId);
    const selectedPool = pools.find((p) => p._id === poolId);
    setSelectedPoolAdmins(selectedPool?.admins || []);
    setAdminAccess([]); // reset admins selection on pool change
  };

  const canSubmit = useMemo(() => {
    if (!channelAccountName.trim()) return false;
    if (!selectedPoolId) return false;
    if (!selectedChannelId) return false;
    // alert(1)
    // require at least one non-empty key OR allow empty keys for channels like Shopify when connected via OAuth
    // const hasKey = keys.some((k) => k.key.trim() && k.value.trim());
    return true; // relaxable: keep true to allow creating without manual keys
  }, [channelAccountName, selectedPoolId, selectedChannelId]);

  const startInitialChannelAccountFetch = async (channelAccountId?: string) => {
    if (!channelAccountId) return;
    setShowFetchingModal(true);
    setFetchingProducts(true);
    setFetchingOrders(true);

    try {
      await Promise.all([
        initialChannelAccountFetch(channelAccountId, "products")
          .then(() => setFetchingProducts(false))
          .catch(() => setFetchingProducts(false)),
        initialChannelAccountFetch(channelAccountId, "orders")
          .then(() => setFetchingOrders(false))
          .catch(() => setFetchingOrders(false)),
      ]);
    } finally {
      setTimeout(() => setShowFetchingModal(false), 700);
    }
  };

  const handleAdminToggle = (adminId: string, checked: boolean) => {
    setAdminAccess((prev) =>
      checked ? [...prev, adminId] : prev.filter((id) => id !== adminId)
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    const keysObject: Record<string, any> = {};
    keys.forEach(({ key, value }) => {
      if (key.trim()) keysObject[key.trim()] = value;
    });

    const formData: ChannelAccount = {
      channel_account_name: channelAccountName.trim(),
      pool_id: pools.find((p) => p._id === selectedPoolId),
      channel_id: channels.find((c) => c._id === selectedChannelId),
      fulfillment_type: "Self",
      keys: keysObject,
      status: "active",
      admins: selectedPoolAdmins
        .filter((a) => adminAccess.includes(a._id))
        .map((a) => a._id),
      automation,
    };

    try {
      const result: any = await createChannelAccount(formData);
      // attempt initial fetch (products & orders)
      channels.find((c) => c._id === selectedChannelId)?.channel_name !==
        "Custom" &&
        (await startInitialChannelAccountFetch(result?._id || result));
      handleNext();
    } catch (err) {
      console.error("Error creating channel account", err);
      toast.error("Failed to create channel account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{}}>
      <Card.Body>
        <Row className="align-items-center mb-3">
          <Col>
            <h4 className="mb-1">Create your first Channel Account</h4>
            <div className="text-muted">
              Connect a sales channel so we can fetch products and orders.
            </div>
          </Col>
        </Row>
        <hr />

        <div className="text-center">
          <Button
            variant="success"
            size="lg"
            href="https://apps.shopify.com/app7"
            target="_blank"
          >
            <span style={{ color: "white" }}>
              Connect with Shopify <FaExternalLinkAlt className="ms-2" />
            </span>
          </Button>
        </div>
        <hr />

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={7}>
              <Form.Group className="mb-3" controlId="accountName">
                <Form.Label className="fw-medium">
                  Channel Account Name
                </Form.Label>
                <Form.Control
                  placeholder="e.g. My Shopify Store"
                  value={channelAccountName}
                  onChange={(e) => setChannelAccountName(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  This helps you identify the connected store.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="poolSelect">
                <Form.Label className="fw-medium">Pool</Form.Label>
                <Form.Select
                  value={selectedPoolId}
                  onChange={(e) => handlePoolChange(e.target.value)}
                  required
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
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    Give admins access
                  </Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedPoolAdmins.map((admin) => (
                      <Form.Check
                        inline
                        key={admin._id}
                        type="checkbox"
                        id={`admin-${admin._id}`}
                        label={
                          <span>
                            <strong>{admin.name}</strong>{" "}
                            <Badge bg="secondary" className="ms-1">
                              Admin
                            </Badge>
                          </span>
                        }
                        checked={adminAccess.includes(admin._id)}
                        onChange={(e) =>
                          handleAdminToggle(admin._id, e.target.checked)
                        }
                      />
                    ))}
                  </div>
                </Form.Group>
              )}
              <Form.Group className="mb-3 hidden" controlId="channelSelect">
                <Form.Label className="fw-medium">Channel</Form.Label>
                <Form.Select
                  value={selectedChannelId}
                  onChange={(e) => setSelectedChannelId(e.target.value)}
                  required
                >
                  {channels
                    .filter((c) => c.channel_name === "Custom")
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.channel_name}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={5}>
              <Card className="h-100 border-0 bg-light">
                <Card.Body>
                  <h6 className="mb-3">Automation</h6>
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
                  <Form.Check
                    type="switch"
                    id="auto_whatsapp"
                    label="Auto Order Confirmation"
                    className="mb-2"
                    checked={automation.auto_whatsapp}
                    onChange={(e) =>
                      setAutomation((a) => ({
                        ...a,
                        auto_whatsapp: e.target.checked,
                      }))
                    }
                  />
                  <Form.Check
                    type="switch"
                    id="auto_ai_recommendation"
                    label="OUAI Courier Recommendation"
                    className="mb-2"
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
                    id="auto_ship"
                    label="Auto Shipment Book"
                    className="mb-2"
                    checked={automation.auto_ship}
                    onChange={(e) =>
                      setAutomation((a) => ({
                        ...a,
                        auto_ship: e.target.checked,
                      }))
                    }
                  />

                  <hr />

                  <div>
                    <h6 className="mb-2">Quick Tips</h6>
                    <ul
                      className="small text-muted"
                      style={{ paddingLeft: 18 }}
                    >
                      <li>Connect via Shopify for OAuth-based keys.</li>
                      <li>
                        Manual keys are useful for custom channels or API-based
                        integrations.
                      </li>
                      <li>
                        You can update keys later from the channel accounts
                        screen.
                      </li>
                    </ul>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button
              variant="secondary"
              onClick={() => {
                setChannelAccountName("");
                setKeys([{ key: "", value: "" }]);
              }}
            >
              Reset
            </Button>

            <Button
              variant="primary"
              type="submit"
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />{" "}
                  Creating...
                </>
              ) : (
                "Create Channel Account"
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>

      <Modal
        show={showFetchingModal}
        onHide={() => setShowFetchingModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Initial sync in progress</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "1rem" }}>
          <div className="mb-3 d-flex align-items-center">
            <strong className="me-2">📦 Products:</strong>
            {fetchingProducts ? (
              <span className="text-warning">Fetching…</span>
            ) : (
              <span className="text-success">Complete</span>
            )}
          </div>
          <div className="d-flex align-items-center">
            <strong className="me-2">🚚 Orders:</strong>
            {fetchingOrders ? (
              <span className="text-warning">Fetching…</span>
            ) : (
              <span className="text-success">Complete</span>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MakeChannelAccount;
