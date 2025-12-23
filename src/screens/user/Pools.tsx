// Pools.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Badge,
  Row,
  Col,
  Card,
  Tabs,
  Tab,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllPools, createPool, updatePool } from "../../APIs/user/pool";
import { getUser } from "../../APIs/user/user";
import { toast } from "react-toastify";
import { createAmazonS3 } from "../../APIs/user/amazonS3";
import { getGST } from "../../APIs/user/gst";

/* --- Types --- */
export interface User {
  _id: string;
  name: string;
}

type Owner = {
  full_name?: string;
  email?: string;
  phone?: string;
};

type Pool = {
  _id: string;
  name: string;
  status: string;
  admins?: User[];
  wallet_balance?: number;
  created_by?: { name: string };
  createdAt?: string;
  company_type?: string;
  owner?: Owner;
  website?: string;
  business_logo?: string | File | null;
  bank_details?: {
    account_number?: string;
    ifsc?: string;
    holder_name?: string;
    cheque?: string | File | null;
    approval_status?: string;
    status_message?: string;
  };
  kyc_documents?: any[];
  gstin?: string;
  address?: string;
  state?: string;
};

/* --- Constants --- */
const COMPANY_TYPE_OPTIONS = [
  { value: "llp", label: "LLP" },
  { value: "public_limited_company", label: "Public Limited" },
  { value: "private_limited_company", label: "Private Limited" },
  { value: "partnership", label: "Partnership" },
  { value: "proprietorship", label: "Sole Proprietorship" },
  { value: "individual", label: "Individual" },
];

/* --- Helper Functions --- */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const validateGSTIN = (gstin: string): boolean => {
  const gstinRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
};

const validateIFSC = (ifsc: string): boolean => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
};

// const validatePAN = (pan: string): boolean => {
//   const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
//   return panRegex.test(pan);
// };

const Pools: React.FC = () => {
  /* --- Table State --- */
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  /* --- Modal State --- */
  const [showModal, setShowModal] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);
  const [tabKey, setTabKey] = useState("gst");

  /* --- Form State --- */
  const [gst, setGst] = useState({
    gstin: "",
    loading: false,
    verified: false,
    company_type: "",
    business_name: "",
    legal_name: "",
    address: "",
    state: "",
    message: "",
  });

  const [businessDetails, setBusinessDetails] = useState({
    name: "",
    logo: null as File | string | null,
    website: "",
  });

  const [companyType, setCompanyType] = useState<string>("individual");

  const [owner, setOwner] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [bankDetails, setBankDetails] = useState({
    account_number: "",
    account_number_confirm: "",
    ifsc: "",
    holder_name: "",
    cheque: null as File | string | null,
  });

  const [kycFiles, setKycFiles] = useState({
    pan: null as File | string | null,
  });

  const [adminList, setAdminList] = useState<User[]>([]);
  const [agree, setAgree] = useState(false);

  /* --- Effects --- */
  useEffect(() => {
    fetchInitialData();
  }, [page, limit]);

  /* --- API Calls --- */
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const poolsData = await getAllPools(page, limit);
      setPools(poolsData.data);
      setTotalRecords(poolsData.total);
    } catch (error) {
      toast.error("Failed to load pools");
    } finally {
      setLoading(false);
    }
  };

  /* --- Modal Management --- */
  const openNewPoolModal = () => {
    resetWizard();
    setShowModal(true);
  };

  const resetWizard = () => {
    setEditingPool(null);
    setTabKey("gst");
    setGst({
      gstin: "",
      loading: false,
      verified: false,
      company_type: "",
      business_name: "",
      legal_name: "",
      address: "",
      state: "",
      message: "",
    });
    setBusinessDetails({ name: "", logo: null, website: "" });
    setCompanyType("individual");
    setOwner({ full_name: "", email: "", phone: "" });
    setBankDetails({
      account_number: "",
      account_number_confirm: "",
      ifsc: "",
      holder_name: "",
      cheque: null,
    });
    setKycFiles({ pan: null });
    setAdminList([]);
    setAgree(false);
  };

  const handleClose = () => {
    setShowModal(false);
    resetWizard();
  };

  const handleEdit = (pool: Pool) => {
    setEditingPool(pool);

    // Prefill GST info if available
    if (pool.gstin) {
      setGst((prev) => ({
        ...prev,
        gstin: pool.gstin || "",
        verified: !!pool.gstin,
        company_type: pool.company_type || "",
        business_name: pool.name || "",
        address: pool.address || "",
        state: pool.state || "",
      }));
    }

    setBusinessDetails({
      name: pool.name || "",
      logo: pool.business_logo || null,
      website: pool.website || "",
    });

    setCompanyType(pool.company_type || "individual");

    setOwner({
      full_name: pool.owner?.full_name || "",
      email: pool.owner?.email || "",
      phone: pool.owner?.phone || "",
    });

    setBankDetails({
      account_number: pool.bank_details?.account_number || "",
      account_number_confirm: pool.bank_details?.account_number || "",
      ifsc: pool.bank_details?.ifsc || "",
      holder_name: pool.bank_details?.holder_name || "",
      cheque: pool.bank_details?.cheque || null,
    });

    setAdminList(pool.admins || []);
    setTabKey("gst");
    setShowModal(true);
  };

  const handleToggleStatus = async (pool: Pool) => {
    const newStatus = pool.status === "active" ? "inactive" : "active";
    if (window.confirm(`Mark this pool as ${newStatus}?`)) {
      try {
        await updatePool(pool._id, { status: newStatus });
        fetchInitialData();
        toast.success(`Pool status updated to ${newStatus}`);
      } catch {
        toast.error("Failed to update status");
      }
    }
  };

  /* --- Admin Management --- */
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

      setAdminList((prev) => [...prev, userObj]);
      toast.success("User added as admin");
    } catch {
      toast.error("Error searching user");
    }
  };

  const removeAdmin = (id: string) => {
    setAdminList(adminList.filter((a) => a._id !== id));
  };

  /* --- GST Verification --- */
  const verifyGst = async () => {
    const gstin = gst.gstin.trim();

    if (!gstin) {
      toast.warn("Please enter GSTIN");
      return;
    }

    if (!validateGSTIN(gstin)) {
      toast.error("Invalid GSTIN format");
      return;
    }

    setGst((s) => ({ ...s, loading: true, message: "" }));

    try {
      const data = await getGST(gstin);
      const normalizedCompanyType =
        data.company_type?.replaceAll(" ", "_").toLowerCase() || "";

      setGst({
        gstin,
        loading: false,
        verified: true,
        company_type: normalizedCompanyType,
        business_name: data.business_name || "",
        legal_name: data.business_name || "",
        address: data.address || "",
        state: data.state || "",
        message: "GST verified successfully",
      });

      setBusinessDetails((b) => ({
        ...b,
        name: data.business_name || b.name,
      }));

      setCompanyType(normalizedCompanyType || "individual");

      toast.success("GST verified and details autofilled");
    } catch (error) {
      setGst((s) => ({
        ...s,
        loading: false,
        verified: false,
        message: "GST verification failed",
      }));
      toast.error("GST verification failed");
    }
  };

  /* --- Validation Functions --- */
  const validateForm = (): boolean => {
    // Business name is required
    if (!businessDetails.name.trim()) {
      toast.error("Business name is required");
      setTabKey("gst");
      return false;
    }

    // Company type is required
    if (!companyType) {
      toast.error("Company type is required");
      setTabKey("company");
      return false;
    }

    // Owner name is required
    if (!owner.full_name.trim()) {
      toast.error("Owner name is required");
      setTabKey("owner");
      return false;
    }

    // Bank details validation
    if (!bankDetails.account_number.trim()) {
      toast.error("Bank account number is required");
      setTabKey("bank");
      return false;
    }

    if (bankDetails.account_number !== bankDetails.account_number_confirm) {
      toast.error("Account numbers do not match");
      setTabKey("bank");
      return false;
    }

    if (!bankDetails.ifsc.trim()) {
      toast.error("IFSC code is required");
      setTabKey("bank");
      return false;
    }

    if (!validateIFSC(bankDetails.ifsc)) {
      toast.error("Invalid IFSC code format");
      setTabKey("bank");
      return false;
    }

    if (!bankDetails.holder_name.trim()) {
      toast.error("Account holder name is required");
      setTabKey("bank");
      return false;
    }

    // KYC validation
    if (!kycFiles.pan && !editingPool) {
      toast.error("PAN card is required");
      setTabKey("kyc");
      return false;
    }

    if (!bankDetails.cheque && !editingPool) {
      toast.error("Cancelled cheque is required");
      setTabKey("kyc");
      return false;
    }

    // Agreement checkbox
    if (!agree) {
      toast.error("Please confirm all details are correct");
      setTabKey("review");
      return false;
    }

    return true;
  };

  /* --- Submit Handler --- */
  const transformAndSubmit = async (status: "active" | "draft" = "active") => {
    if (status === "active" && !validateForm()) {
      toast.error("Please fill all the details in different tabs.");

      return;
    }

    try {
      const payload: any = {
        name: businessDetails.name,
        company_type: companyType,
        website: businessDetails.website || undefined,
        admins: adminList.map((a) => a._id),
        owner: {
          full_name: owner.full_name || undefined,
          email: owner.email || undefined,
          phone: owner.phone || undefined,
        },
        bank_details: {
          account_number: bankDetails.account_number || undefined,
          ifsc: bankDetails.ifsc || undefined,
          holder_name: bankDetails.holder_name || undefined,
        },
        kyc_documents: [],
        status,
      };

      // Add GST info if verified
      if (gst.verified) {
        payload.gstin = gst.gstin;
        payload.address = gst.address;
        payload.state = gst.state;
      }

      // Upload business logo
      if (businessDetails.logo instanceof File) {
        const logoData = await createAmazonS3(
          `logos/${Date.now()}-${businessDetails.logo.name.replace(/ /g, "_")}`,
          await fileToBase64(businessDetails.logo)
        );
        payload.business_logo = logoData.url;
      } else if (typeof businessDetails.logo === "string") {
        payload.business_logo = businessDetails.logo;
      }

      // Upload KYC documents
      if (kycFiles.pan) {
        if (kycFiles.pan instanceof File) {
          const panData = await createAmazonS3(
            `kyc/${Date.now()}-${kycFiles.pan.name.replace(/ /g, "_")}`,
            await fileToBase64(kycFiles.pan)
          );
          payload.kyc_documents.push({
            section: "PAN",
            document_type: "PAN",
            value: panData.url,
            is_optional: false,
          });
        } else {
          payload.kyc_documents.push({
            section: "PAN",
            document_type: "PAN",
            value: kycFiles.pan,
            is_optional: false,
          });
        }
      }

      // Upload bank cheque
      if (bankDetails.cheque) {
        if (bankDetails.cheque instanceof File) {
          const chequeData = await createAmazonS3(
            `cheques/${Date.now()}-${bankDetails.cheque.name.replace(
              / /g,
              "_"
            )}`,
            await fileToBase64(bankDetails.cheque)
          );
          payload.bank_details.cheque = chequeData.url;
        } else {
          payload.bank_details.cheque = bankDetails.cheque;
        }
      }

      if (editingPool) {
        await updatePool(editingPool._id, payload);
        toast.success(
          status === "active" ? "Pool updated successfully" : "Progress saved"
        );
      } else {
        await createPool(payload);
        toast.success(
          status === "active" ? "Pool created successfully" : "Progress saved"
        );
      }

      fetchInitialData();
      handleClose();
    } catch (error) {
      toast.error("Failed to save pool");
      console.error("Submit error:", error);
    }
  };

  /* --- Table Columns --- */
  const columns = [
    {
      name: "Pool Name",
      selector: (row: Pool) => row.name,
      sortable: true,
      cell: (row: Pool) => (
        <Button variant="link" onClick={() => handleEdit(row)}>
          {row.name}
        </Button>
      ),
    },
    {
      name: "Status",
      selector: (row: Pool) => row.status,
      cell: (row: Pool) => {
        const color =
          row.status === "active"
            ? "success"
            : row.status === "inactive"
              ? "secondary"
              : "warning";
        return <Badge bg={color}>{row.status}</Badge>;
      },
      sortable: true,
    },
    {
      name: "Wallet",
      selector: (row: Pool) => row.wallet_balance || 0,
      cell: (row: Pool) => (
        <Badge
          bg={
            row.wallet_balance && row.wallet_balance > 0
              ? "success"
              : "secondary"
          }
        >
          ₹{row.wallet_balance?.toFixed(2) || "0.00"}
        </Badge>
      ),
      sortable: true,
    },
    {
      name: "Created By",
      selector: (row: Pool) => row.created_by?.name || "Unknown",
    },
    {
      name: "Created At",
      selector: (row: Pool) =>
        new Date(row.createdAt || "").toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Pool) => (
        <Button
          size="sm"
          variant={row.status === "active" ? "danger" : "success"}
          onClick={() => handleToggleStatus(row)}
        >
          {row.status === "active" ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  /* --- Tab Content --- */
  const renderTabContent = () => ({
    gst: (
      <Card className="p-3">
        <h5>GST Verification (Optional)</h5>
        <Form.Group className="mb-3" controlId="gstin">
          <Form.Label>GSTIN</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Enter GSTIN (optional)"
              value={gst.gstin}
              onChange={(e) =>
                setGst((s) => ({ ...s, gstin: e.target.value.toUpperCase() }))
              }
            />
            <Button
              variant="outline-primary"
              onClick={verifyGst}
              disabled={gst.loading}
            >
              {gst.loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Verify"
              )}
            </Button>
          </InputGroup>
          <Form.Text className="text-muted">
            If GSTIN is valid, we'll autofill company details
          </Form.Text>
        </Form.Group>

        {gst.verified && (
          <Card className="mt-2 p-3 bg-light">
            <div className="mb-2">
              <strong>{gst.business_name}</strong>
            </div>
            <div className="small text-muted mb-1">{gst.legal_name}</div>
            <div className="small mb-2">{gst.address}</div>
            <Badge bg="success">GST Verified</Badge>
          </Card>
        )}

        {gst.message && (
          <div
            className={`mt-2 ${gst.verified ? "text-success" : "text-warning"}`}
          >
            {gst.message}
          </div>
        )}

        <hr />

        <Form.Group className="mb-3" controlId="businessName">
          <Form.Label>
            Business Name <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter business name"
            value={businessDetails.name}
            onChange={(e) =>
              setBusinessDetails({ ...businessDetails, name: e.target.value })
            }
            required
          />
        </Form.Group>
      </Card>
    ),

    company: (
      <Card className="p-3">
        <h5>Company Information</h5>
        <Form.Group className="mb-3">
          <Form.Label>
            Company Type <span className="text-danger">*</span>
          </Form.Label>
          <Form.Select
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value)}
            disabled={gst.verified}
            required
          >
            <option value="">Select Company Type</option>
            {COMPANY_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
          {gst.verified && (
            <Form.Text className="text-muted">
              Auto-filled from GST verification
            </Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Website</Form.Label>
          <Form.Control
            type="url"
            placeholder="https://example.com"
            value={businessDetails.website}
            onChange={(e) =>
              setBusinessDetails({
                ...businessDetails,
                website: e.target.value,
              })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Business Logo</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e: any) => {
              const file = e.target.files?.[0];
              if (file) {
                setBusinessDetails({ ...businessDetails, logo: file });
              }
            }}
          />
          {businessDetails.logo && typeof businessDetails.logo === "string" && (
            <div className="mt-2">
              <img
                src={businessDetails.logo}
                alt="Business logo"
                style={{ width: 100, height: 100, objectFit: "contain" }}
              />
            </div>
          )}
        </Form.Group>
      </Card>
    ),

    owner: (
      <Card className="p-3">
        <h5>Owner / Authorized Person</h5>
        <Form.Group className="mb-3">
          <Form.Label>
            Full Name <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            value={owner.full_name}
            onChange={(e) => setOwner({ ...owner, full_name: e.target.value })}
            placeholder="Name of authorized person"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={owner.email}
            onChange={(e) => setOwner({ ...owner, email: e.target.value })}
            placeholder="Email address"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="tel"
            value={owner.phone}
            onChange={(e) => setOwner({ ...owner, phone: e.target.value })}
            placeholder="Phone number"
          />
        </Form.Group>

        <hr />

        <Form.Group className="mb-3">
          <Form.Label>Add Admin by Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email and press Enter"
            onKeyDown={async (e: any) => {
              if (e.key === "Enter") {
                e.preventDefault();
                await handleUserSearch(e.target.value);
                e.target.value = "";
              }
            }}
          />
          {adminList.length > 0 && (
            <div className="mt-2">
              {adminList.map((admin) => (
                <Badge
                  pill
                  bg="primary"
                  key={admin._id}
                  className="me-2 mb-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => removeAdmin(admin._id)}
                >
                  {admin.name} &times;
                </Badge>
              ))}
            </div>
          )}
        </Form.Group>
      </Card>
    ),

    bank: (
      <Card className="p-3">
        <h5>Bank Details</h5>
        <Form.Group className="mb-3">
          <Form.Label>
            Account Number <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            value={bankDetails.account_number}
            onChange={(e) =>
              setBankDetails({ ...bankDetails, account_number: e.target.value })
            }
            placeholder="Bank account number"
            name="account_number"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            Confirm Account Number <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            value={bankDetails.account_number_confirm}
            onChange={(e) =>
              setBankDetails({
                ...bankDetails,
                account_number_confirm: e.target.value,
              })
            }
            placeholder="Re-enter account number"
            required
            isInvalid={
              (bankDetails as any).account_number &&
              bankDetails.account_number_confirm &&
              bankDetails.account_number !== bankDetails.account_number_confirm
            }
          />
          <Form.Control.Feedback type="invalid">
            Account numbers do not match
          </Form.Control.Feedback>
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>
                IFSC Code <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={bankDetails.ifsc}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    ifsc: e.target.value.toUpperCase(),
                  })
                }
                placeholder="IFSC Code"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>
                Account Holder Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={bankDetails.holder_name}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    holder_name: e.target.value,
                  })
                }
                placeholder="As per bank records"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>
            Cancelled Cheque <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="file"
            accept="image/*,.pdf"
            onChange={(e: any) => {
              const file = e.target.files?.[0];
              if (file) {
                setBankDetails({ ...bankDetails, cheque: file });
              }
            }}
          />
          <Form.Text className="text-muted">
            Upload a clear image or PDF of cancelled cheque
          </Form.Text>
        </Form.Group>
      </Card>
    ),

    kyc: (
      <Card className="p-3">
        <h5>KYC Documents</h5>
        <p className="text-muted">
          Essential documents required for remittances
        </p>

        <Form.Group className="mb-3">
          <Form.Label>
            PAN Card <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="file"
            accept="image/*,.pdf"
            onChange={(e: any) => {
              const file = e.target.files?.[0];
              if (file) {
                setKycFiles((k) => ({ ...k, pan: file }));
              }
            }}
          />
          {kycFiles.pan && typeof kycFiles.pan === "string" && (
            <div className="mt-2">
              <a href={kycFiles.pan} target="_blank" rel="noreferrer">
                View uploaded PAN
              </a>
            </div>
          )}
        </Form.Group>

        {bankDetails.cheque && (
          <div className="alert alert-info">
            <small>
              ✓ Cancelled cheque already uploaded in Bank Details section
            </small>
          </div>
        )}
      </Card>
    ),

    review: (
      <Card className="p-3">
        <h5>Review & Confirm</h5>

        <div className="mb-3">
          <strong>Business Details</strong>
          <div className="ms-3">
            <div>Name: {businessDetails.name || "—"}</div>
            <div>
              Type:{" "}
              {COMPANY_TYPE_OPTIONS.find((c) => c.value === companyType)
                ?.label || "—"}
            </div>
            {businessDetails.website && (
              <div>Website: {businessDetails.website}</div>
            )}
            {gst.verified && (
              <Badge bg="success" className="mt-1">
                GST Verified
              </Badge>
            )}
          </div>
        </div>

        <div className="mb-3">
          <strong>Owner</strong>
          <div className="ms-3">
            <div>{owner.full_name || "—"}</div>
            {owner.email && <div className="small">Email: {owner.email}</div>}
            {owner.phone && <div className="small">Phone: {owner.phone}</div>}
          </div>
        </div>

        {adminList.length > 0 && (
          <div className="mb-3">
            <strong>Admins ({adminList.length})</strong>
            <div className="ms-3">
              {adminList.map((admin) => (
                <div key={admin._id} className="small">
                  • {admin.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <strong>Bank Details</strong>
          <div className="ms-3">
            <div>
              Account:{" "}
              {bankDetails.account_number
                ? `****${bankDetails.account_number.slice(-4)}`
                : "—"}
            </div>
            <div>IFSC: {bankDetails.ifsc || "—"}</div>
            <div>Holder: {bankDetails.holder_name || "—"}</div>
            {bankDetails.cheque && (
              <Badge bg="success" className="mt-1">
                Cheque Uploaded
              </Badge>
            )}
          </div>
        </div>

        <div className="mb-3">
          <strong>KYC Documents</strong>
          <div className="ms-3">
            <div>
              PAN:{" "}
              {kycFiles.pan ? (
                typeof kycFiles.pan === "string" ? (
                  <a href={kycFiles.pan} target="_blank" rel="noreferrer">
                    View
                  </a>
                ) : (
                  kycFiles.pan.name
                )
              ) : (
                "Not uploaded"
              )}
            </div>
            <div>
              Cancelled Cheque:{" "}
              {bankDetails.cheque ? (
                typeof bankDetails.cheque === "string" ? (
                  <a href={bankDetails.cheque} target="_blank" rel="noreferrer">
                    View
                  </a>
                ) : (
                  bankDetails.cheque.name
                )
              ) : (
                "Not uploaded"
              )}
            </div>
          </div>
        </div>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            id="agree"
            label="I confirm all details are correct and agree to the terms"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            required
          />
        </Form.Group>

        <div className="alert alert-info">
          <small>
            After submission, our team will verify documents within 48 working
            hours.
          </small>
        </div>
      </Card>
    ),
  });

  /* --- Render --- */
  return (
    <>
      <Row className="mb-3">
        <Col>
          <h3>Pools Management</h3>
        </Col>
        <Col className="text-end">
          <Button onClick={openNewPoolModal}>Add New Pool</Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" />
          <div className="mt-2">Loading pools...</div>
        </div>
      ) : (
        <DataTable
          title="Your Pools"
          columns={columns}
          data={pools}
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

      {/* Wizard Modal */}
      <Modal
        size="lg"
        show={showModal}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPool ? "Edit Pool" : "Create New Pool"}
          </Modal.Title>
        </Modal.Header>

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            transformAndSubmit("active");
          }}
          noValidate
        >
          <Modal.Body>
            <Tabs
              activeKey={tabKey}
              onSelect={(k) => setTabKey(k || "gst")}
              className="mb-3"
              fill
            >
              <Tab eventKey="gst" title="1. GST">
                {renderTabContent().gst}
              </Tab>
              <Tab eventKey="company" title="2. Company">
                {renderTabContent().company}
              </Tab>
              <Tab eventKey="owner" title="3. Owner">
                {renderTabContent().owner}
              </Tab>
              <Tab eventKey="bank" title="4. Bank">
                {renderTabContent().bank}
              </Tab>
              <Tab eventKey="kyc" title="5. KYC">
                {renderTabContent().kyc}
              </Tab>
              <Tab eventKey="review" title="6. Review">
                {renderTabContent().review}
              </Tab>
            </Tabs>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="warning"
              onClick={() => transformAndSubmit("draft")}
              type="button"
            >
              Save Progress
            </Button>
            <Button variant="primary" type="submit">
              {editingPool ? "Update Pool" : "Create Pool"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Pools;
export { Pools };
