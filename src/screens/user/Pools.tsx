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

/**
 * Easy Onboarding Wizard (React-Bootstrap)
 * - 6 step wizard in a modal launched by "Add New Pool"
 * - GST verify autofill (assumes GST API returns { gstin, business_name, legal_name, address, state })
 * - Owner email & phone verification placeholders (send OTP flows are stubbed)
 * - Bank verification placeholder
 * - Simplified KYC: PAN upload + Cancelled Cheque
 * - Keeps createPool / updatePool & S3 upload logic
 */

/* --- Types --- */
export interface User {
  _id: string;
  name: string;
}

type Owner = {
  full_name?: string;
  email?: string;
  email_verified?: boolean;
  phone?: string;
  phone_verified?: boolean;
};
type Pool = {
  _id: string;
  name: string;
  status: string;
  admins?: User[];
  wallet_balance?: number;
  created_by?: { name: string };
  ownership?: { name: string };
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
};

/* --- Constants --- */
const companyTypeOptions = [
  { value: "llp", label: "LLP" },
  { value: "public_limited_company", label: "Public Limited" },
  { value: "private_limited_company", label: "Private Limited" },
  { value: "partnership", label: "Partnership" },
  { value: "proprietorship", label: "Sole Proprietorship" },
  { value: "individual", label: "Individual" },
];

/* --- Helper: file -> base64 --- */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const Pools: React.FC = () => {
  /* --- Table state --- */
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  /* --- Modal / Wizard state --- */
  const [showModal, setShowModal] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);

  const [tabKey, setTabKey] = useState("gst");

  /* --- Form state (single progressive object) --- */
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
    email_verified: false,
    phone: "",
    phone_verified: false,
  });

  const [bankDetails, setBankDetails] = useState({
    account_number: "",
    account_number_confirm: "",
    ifsc: "",
    holder_name: "",
    cheque: null as File | string | null,
    verification_status: "" as "" | "verified" | "failed" | "pending",
    verification_message: "",
  });

  const [kycFiles, setKycFiles] = useState({
    pan: null as File | string | null,
    cheque: null as File | string | null,
  });

  const [adminList, setAdminList] = useState<User[]>([]);
  const [agree, setAgree] = useState(false);

  /* --- Lifecycle: fetch pools --- */
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const poolsData = await getAllPools();
      setPools(poolsData);
    } catch (error) {
      toast.error("Failed to load pools");
    } finally {
      setLoading(false);
    }
  };

  /* --- Modal open/close --- */
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
    setOwner({
      full_name: "",
      email: "",
      email_verified: false,
      phone: "",
      phone_verified: false,
    });
    setBankDetails({
      account_number: "",
      account_number_confirm: "",
      ifsc: "",
      holder_name: "",
      cheque: null,
      verification_status: "",
      verification_message: "",
    });
    setKycFiles({ pan: null, cheque: null });
    setAdminList([]);
    setAgree(false);
  };

  const handleClose = () => {
    setShowModal(false);
    resetWizard();
  };

  /* --- Edit existing pool: fill wizard with data and open modal (simple) --- */
  const handleEdit = (pool: Pool) => {
    setEditingPool(pool);
    // Prefill fields to let user update; keep it simple
    setBusinessDetails({
      name: pool.name || "",
      logo: pool.business_logo || null,
      website: pool.website || "",
    });
    setCompanyType(pool.company_type || "individual");
    setBankDetails({
      account_number: pool.bank_details?.account_number || "",
      account_number_confirm: pool.bank_details?.account_number || "",
      ifsc: pool.bank_details?.ifsc || "",
      holder_name: pool.bank_details?.holder_name || "",
      cheque: pool.bank_details?.cheque || null,
      verification_status: ["", "verified", "failed", "pending"].includes(
        pool.bank_details?.approval_status || ""
      )
        ? (pool.bank_details?.approval_status as
            | ""
            | "verified"
            | "failed"
            | "pending")
        : "",
      verification_message: pool.bank_details?.status_message || "",
    });
    setOwner({
      full_name: pool.owner?.full_name || "",
      email: pool.owner?.email || "",
      email_verified: false,
      phone: pool.owner?.phone || "",
      phone_verified: false,
    });
    // admins - simple mapping if exists
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

  /* --- User search/add admin --- */
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
    } catch {
      toast.error("Error searching user");
    }
  };

  const removeAdmin = (id: string) => {
    setAdminList(adminList.filter((a) => a._id !== id));
  };

  const verifyGst = async () => {
    const gstin = (gst.gstin || "").trim();
    if (!gstin) {
      toast.warn("Enter GSTIN");
      return;
    }
    setGst((s) => ({ ...s, loading: true, message: "" }));
    try {
      const data = await getGST(gstin);
      setGst({
        gstin,
        loading: false,
        verified: true,
        company_type:
          data.company_type.replaceAll(" ", "_").toLowerCase() || "",
        business_name: data.business_name || "",
        legal_name: data.business_name || "",
        address: data.address || "",
        state: data.state || "",
        message: "GST verified and autofilled.",
      });
      setBusinessDetails((b) => ({
        ...b,

        name: data.business_name || b.name,
      }));
      toast.success("GST verified and autofilled");
    } catch {
      setGst((s) => ({
        ...s,
        loading: false,
        verified: false,
        message: "Verification failed",
      }));
      toast.error("GST verification failed");
    }
  };

  /* --- Email / Phone OTP placeholders --- */
  const sendEmailOtp = async (email: string) => {
    if (!email) return toast.warn("Enter email");
    // Placeholder: call your email OTP API
    toast.info("OTP sent to email (placeholder)");
    // set a flag or call verify endpoint in real flow
  };

  // const verifyEmailOtp = async (email: string, otp: string) => {
  //   // Placeholder: call verify endpoint
  //   setOwner((o) => ({ ...o, email_verified: true }));
  //   toast.success("Email verified (placeholder)");
  // };

  const sendPhoneOtp = async (phone: string) => {
    if (!phone) return toast.warn("Enter phone");
    // Placeholder: call your phone OTP API
    toast.info("OTP sent to phone (placeholder)");
  };

  // const verifyPhoneOtp = async (phone: string, otp: string) => {
  //   setOwner((o) => ({ ...o, phone_verified: true }));
  //   toast.success("Phone verified (placeholder)");
  // };

  /* --- Bank verify placeholder --- */
  // const verifyBank = async () => {
  //   // Example: you could call a microservice that validates IFSC/account via NPCI or bank API
  //   if (!bankDetails.account_number || !bankDetails.ifsc) {
  //     toast.warn("Enter account number and IFSC to verify");
  //     return;
  //   }
  //   setBankDetails((b) => ({ ...b, verification_status: "pending", verification_message: "Verifying..." }));
  //   try {
  //     // Placeholder delay to simulate verification
  //     await new Promise((r) => setTimeout(r, 1000));
  //     // Set verified in this placeholder flow
  //     setBankDetails((b) => ({ ...b, verification_status: "verified", verification_message: "Account verified (placeholder)" }));
  //     toast.success("Bank verified (placeholder)");
  //   } catch {
  //     setBankDetails((b) => ({ ...b, verification_status: "failed", verification_message: "Verification failed" }));
  //     toast.error("Bank verification failed");
  //   }
  // };

  /* --- Transform and submit to backend (createPool / updatePool) --- */
  async function transformAndSubmit(status: "active" | "draft" = "active") {
    try {
      // Build payload
      const payload: any = {
        name: businessDetails.name,
        address: gst.verified ? gst.address : undefined,
        state: gst.verified ? gst.state : undefined,
        company_type:
          companyType || (gst.verified ? gst.company_type : null) || undefined,
        business_logo: businessDetails.logo || undefined,
        website: businessDetails.website || undefined,
        admins: adminList.map((a) => a._id),
        bank_details: {
          account_number: bankDetails.account_number || undefined,
          ifsc: bankDetails.ifsc || undefined,
          holder_name: bankDetails.holder_name || undefined,
          cheque: undefined,
          approval_status: bankDetails.verification_status || undefined,
          status_message: bankDetails.verification_message || undefined,
        },
        kyc_documents: [],
        gstin: gst.gstin || undefined,
        owner: {
          full_name: owner.full_name || undefined,
          email: owner.email || undefined,
          phone: owner.phone || undefined,
        },
        status,
      };

      // Attach KYC docs (PAN + cheque)
      if (kycFiles.pan) {
        payload.kyc_documents.push({
          section: "PAN",
          document_type: "PAN",
          value: undefined,
          file: kycFiles.pan,
          is_optional: false,
        });
      }
      // ensure cheque got into bank_details.cheque
      if (kycFiles.cheque || bankDetails.cheque) {
        const chequeFile = kycFiles.cheque || bankDetails.cheque;
        if (chequeFile) {
          payload.bank_details.cheque = chequeFile;
        }
      }

      // Upload files to S3 similar to existing logic
      if (payload.kyc_documents && Array.isArray(payload.kyc_documents)) {
        for (let doc of payload.kyc_documents) {
          if (doc.file instanceof File) {
            const s3Data = await createAmazonS3(
              `kyc/${Date.now()}-${doc.file.name.replace(/ /g, "_")}`,
              await fileToBase64(doc.file)
            );
            doc.file = undefined;
            doc.value = s3Data.url;
          }
        }
      }

      // Upload Business Logo
      if (payload.business_logo instanceof File) {
        const logoData = await createAmazonS3(
          `logos/${Date.now()}-${payload.business_logo.name.replace(
            / /g,
            "_"
          )}`,
          await fileToBase64(payload.business_logo)
        );
        payload.business_logo = logoData.url;
      }

      // Upload Bank Cheque if file exists in bank_details.cheque
      if (payload.bank_details && payload.bank_details.cheque instanceof File) {
        const chequeData = await createAmazonS3(
          `cheques/${Date.now()}-${payload.bank_details.cheque.name.replace(
            / /g,
            "_"
          )}`,
          await fileToBase64(payload.bank_details.cheque)
        );
        payload.bank_details.cheque = chequeData.url;
      }

      if (editingPool) {
        await updatePool(editingPool._id, payload);
        toast.success(
          status === "active" ? "Pool updated successfully" : "Progress saved!"
        );
      } else {
        await createPool(payload);
        toast.success(
          status === "active" ? "Pool created successfully" : "Progress saved!"
        );
      }

      fetchInitialData();
      if (status === "active") handleClose();
    } catch {
      toast.error("Failed to save pool");
    }
  }

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
        <>
          <Button
            size="sm"
            variant={row.status === "active" ? "danger" : "success"}
            onClick={() => handleToggleStatus(row)}
          >
            {row.status === "active" ? "Deactivate" : "Activate"}
          </Button>
        </>
      ),
    },
  ];

  // --- Tab content ---
  const renderTabContent = () => ({
    gst: (
      <Card className="p-3">
        <h5>GST Verification</h5>
        <Form.Group className="mb-3" controlId="gstin">
          <Form.Label>GSTIN</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Enter GSTIN (optional)"
              value={gst.gstin}
              onChange={(e) => setGst((s) => ({ ...s, gstin: e.target.value }))}
            />
            <Button
              variant="outline-primary"
              onClick={verifyGst}
              disabled={gst.loading}
            >
              {gst.loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Verify GST"
              )}
            </Button>
          </InputGroup>
          <Form.Text className="text-muted">
            If GSTIN is valid we'll autofill company details.
          </Form.Text>
        </Form.Group>
        {gst.verified && (
          <Card className="mt-2 p-2">
            <strong>{gst.business_name}</strong>
            <div className="small text-muted">{gst.legal_name}</div>
            <div className="small">{gst.address}</div>
            <Badge bg="success" className="mt-2">
              GST Verified
            </Badge>
          </Card>
        )}
        {!gst.verified && gst.message && (
          <div className="text-warning mt-2">{gst.message}</div>
        )}
        <hr />
        <Form.Group className="mb-3" controlId="businessNameManual">
          <Form.Label>
            Company / Brand Name{" "}
            <span className="text-muted">(if GST not provided)</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter business name"
            value={gst.business_name || businessDetails.name}
            onChange={(e) =>
              setBusinessDetails({ ...businessDetails, name: e.target.value })
            }
          />
        </Form.Group>
      </Card>
    ),
    company: (
      <Card className="p-3">
        <h5>Company Info</h5>
        <Form.Group className="mb-3">
          <Form.Label>Company Type</Form.Label>
          <Form.Select
            value={gst.company_type || companyType}
            disabled
            onChange={(e) => setCompanyType(e.target.value)}
          >
            <option value="">Select Company Type</option>
            {companyTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Website (optional)</Form.Label>
          <Form.Control
            type="text"
            placeholder="https://"
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
          <Form.Label>Business Logo (optional)</Form.Label>
          <Form.Control
            type="file"
            onChange={(e: any) => {
              const file = e.target.files?.[0];
              if (file) setBusinessDetails({ ...businessDetails, logo: file });
            }}
          />
          {businessDetails.logo && typeof businessDetails.logo === "string" && (
            <div className="mt-2">
              <img
                src={businessDetails.logo}
                alt="logo"
                style={{ width: 100 }}
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
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            type="text"
            value={owner.full_name}
            onChange={(e) => setOwner({ ...owner, full_name: e.target.value })}
            placeholder="Name of the authorized person"
          />
        </Form.Group>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <InputGroup>
                <Form.Control
                  type="email"
                  value={owner.email}
                  onChange={(e) =>
                    setOwner({ ...owner, email: e.target.value })
                  }
                  placeholder="Email"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => sendEmailOtp(owner.email)}
                >
                  Send OTP
                </Button>
              </InputGroup>
              <div className="small mt-1">
                {owner.email_verified ? (
                  <Badge bg="success">Verified</Badge>
                ) : (
                  <span className="text-muted">Not verified</span>
                )}
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={owner.phone}
                  onChange={(e) =>
                    setOwner({ ...owner, phone: e.target.value })
                  }
                  placeholder="Phone number"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => sendPhoneOtp(owner.phone)}
                >
                  Send OTP
                </Button>
              </InputGroup>
              <div className="small mt-1">
                {owner.phone_verified ? (
                  <Badge bg="success">Verified</Badge>
                ) : (
                  <span className="text-muted">Not verified</span>
                )}
              </div>
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Add Admin by Email (optional)</Form.Label>
          <Form.Control
            type="email"
            placeholder="Press Enter to search and add admin"
            onKeyDown={async (e: any) => {
              if (e.key === "Enter") {
                e.preventDefault();
                await handleUserSearch((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
          <div className="mt-2">
            {adminList.map((admin) => (
              <Badge
                pill
                bg="primary"
                key={admin._id}
                style={{ marginRight: 5, cursor: "pointer" }}
                onClick={() => removeAdmin(admin._id)}
              >
                {admin.name} &times;
              </Badge>
            ))}
          </div>
        </Form.Group>
      </Card>
    ),
    bank: (
      <Card className="p-3">
        <h5>Bank Details (Remittance)</h5>
        <Form.Group className="mb-3">
          <Form.Label>Account Number</Form.Label>
          <Form.Control
            type="text"
            value={bankDetails.account_number}
            onChange={(e) =>
              setBankDetails({ ...bankDetails, account_number: e.target.value })
            }
            placeholder="Account number"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Confirm Account Number</Form.Label>
          <Form.Control
            type="text"
            value={bankDetails.account_number_confirm}
            onChange={(e) =>
              setBankDetails({
                ...bankDetails,
                account_number_confirm: e.target.value,
              })
            }
            placeholder="Confirm account number"
          />
          {bankDetails.account_number &&
            bankDetails.account_number_confirm &&
            bankDetails.account_number !==
              bankDetails.account_number_confirm && (
              <Form.Text className="text-danger">
                Account numbers do not match
              </Form.Text>
            )}
        </Form.Group>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>IFSC</Form.Label>
              <Form.Control
                type="text"
                value={bankDetails.ifsc}
                onChange={(e) =>
                  setBankDetails({ ...bankDetails, ifsc: e.target.value })
                }
                placeholder="IFSC"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Account Holder Name</Form.Label>
              <Form.Control
                type="text"
                value={bankDetails.holder_name}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    holder_name: e.target.value,
                  })
                }
                placeholder="Holder name"
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Cancelled Cheque (upload)</Form.Label>
          <Form.Control
            type="file"
            onChange={(e: any) => {
              const file = e.target.files?.[0];
              if (file) {
                setBankDetails({ ...bankDetails, cheque: file });
                setKycFiles((k) => ({ ...k, cheque: file }));
              }
            }}
          />
          <div className="small mt-1">
            {bankDetails.verification_status === "verified" ? (
              <Badge bg="success">Verified</Badge>
            ) : (
              <span className="text-muted">Verification not done</span>
            )}
          </div>
        </Form.Group>
      </Card>
    ),
    kyc: (
      <Card className="p-3">
        <h5>Minimal KYC</h5>
        <div className="mb-2 text-muted">
          Only essential documents required to start remittances & reduce
          friction.
        </div>
        <Form.Group className="mb-3">
          <Form.Label>PAN Card (upload)</Form.Label>
          <Form.Control
            type="file"
            onChange={(e: any) => {
              const file = e.target.files?.[0];
              if (file) setKycFiles((k) => ({ ...k, pan: file }));
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
        <Form.Group className="mb-3">
          <Form.Label>
            Cancelled Cheque (will be used for remittance)
          </Form.Label>
          <Form.Control
            type="file"
            onChange={(e: any) => {
              const file = e.target.files?.[0];
              if (file) {
                setKycFiles((k) => ({ ...k, cheque: file }));
                setBankDetails((b) => ({ ...b, cheque: file }));
              }
            }}
          />
          <Form.Text className="text-muted">
            If you already uploaded in Bank step, no need to re-upload.
          </Form.Text>
        </Form.Group>
      </Card>
    ),
    review: (
      <Card className="p-3">
        <h5>Review & Submit</h5>
        <div className="mb-3">
          <strong>Company</strong>
          <div>{businessDetails.name}</div>
          <div className="text-muted small">
            {companyType
              ? companyTypeOptions.find((c) => c.value === companyType)?.label
              : "—"}
          </div>
          {gst.verified && (
            <Badge bg="success" className="mt-2">
              GST Verified
            </Badge>
          )}
        </div>
        <div className="mb-3">
          <strong>Owner</strong>
          <div>{owner.full_name}</div>
          <div className="small">
            {owner.email}{" "}
            {owner.email_verified ? <Badge bg="success">E</Badge> : null}{" "}
            {owner.phone}{" "}
            {owner.phone_verified ? <Badge bg="success">P</Badge> : null}
          </div>
        </div>
        <div className="mb-3">
          <strong>Bank</strong>
          <div>
            Account:{" "}
            {bankDetails.account_number
              ? `****${bankDetails.account_number.slice(-4)}`
              : "—"}
          </div>
          <div>IFSC: {bankDetails.ifsc || "—"}</div>
          <div className="small">
            {bankDetails.verification_status
              ? bankDetails.verification_status
              : "Not verified"}
          </div>
        </div>
        <div className="mb-3">
          <strong>KYC</strong>
          <div>
            PAN:{" "}
            {kycFiles.pan ? (
              typeof kycFiles.pan === "string" ? (
                <a href={kycFiles.pan} target="_blank" rel="noreferrer">
                  Uploaded
                </a>
              ) : (
                (kycFiles.pan as File).name
              )
            ) : (
              "Not provided"
            )}
          </div>
          <div>
            Cancelled Cheque:{" "}
            {kycFiles.cheque
              ? (kycFiles.cheque as File).name || "Uploaded"
              : "Not provided"}
          </div>
        </div>
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            id="agree"
            label="I confirm all details are correct"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
        </Form.Group>
        <div className="small text-muted">
          After submission our team may verify documents within 48 working
          hours.
        </div>
      </Card>
    ),
  });

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
      <DataTable
        columns={columns}
        data={pools}
        progressPending={loading}
        pagination
        highlightOnHover
      />
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
            if (!agree)
              return toast.warn("Please confirm all details are correct.");
            if (!businessDetails.name)
              return toast.warn("Business name required");
            if (!companyType) return toast.warn("Select company type");
            if (!owner.full_name) return toast.warn("Owner name required");
            if (
              !bankDetails.account_number ||
              bankDetails.account_number !== bankDetails.account_number_confirm
            )
              return toast.warn("Valid bank details required");
            if (!kycFiles.pan) return toast.warn("PAN required");
            transformAndSubmit("active");
          }}
        >
          <Modal.Body>
            <Tabs
              activeKey={tabKey}
              onSelect={(k) => setTabKey(k || "gst")}
              className="mb-3"
              fill
            >
              <Tab eventKey="gst" title="GST">
                {renderTabContent().gst}
              </Tab>
              <Tab eventKey="company" title="Company">
                {renderTabContent().company}
              </Tab>
              <Tab eventKey="owner" title="Owner">
                {renderTabContent().owner}
              </Tab>
              <Tab eventKey="bank" title="Bank">
                {renderTabContent().bank}
              </Tab>
              <Tab eventKey="kyc" title="KYC">
                {renderTabContent().kyc}
              </Tab>
              <Tab eventKey="review" title="Review">
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
