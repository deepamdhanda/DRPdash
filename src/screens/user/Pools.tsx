import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Badge, Tabs, Tab, Row, Col, Card } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllPools, createPool, updatePool } from "../../APIs/user/pool";
import { getUser } from "../../APIs/user/user";
import { toast } from "react-toastify";
import { createAmazonS3 } from "../../APIs/user/amazonS3";

// --- KYC JSON CONFIG (flattened for easier access) ---
const kycConfigRaw = [
  {
    llp: {
      "Proof of Business Identity": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: ["Certificate of Incorporation", "LLPIN", "LLP Deed"],
            type_of_fields: ["upload"],
            required_for: "Proof of Business Identity",
            is_optional: false,
          },
        ],
      },
      "Proof of Business Existence": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: ["Company PAN Card"],
            type_of_fields: ["upload"],
            required_for: "Proof of Business Existence",
            is_optional: false,
          },
        ],
      },
      "Proof of Business Working": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: ["Cancelled cheque", "Bank letter head"],
            type_of_fields: ["upload"],
            required_for: "Proof of Business Working",
            is_optional: false,
          },
        ],
      },
      "Proof of Identity of Business Owners and Authorised Signatory": {
        documents_required_count: 2,
        types_of_documents_accepted: [
          {
            name_of_document: [
              "Government-approved authorised signatory identity proof (like Aadhar Card/Voter Id/Passport)",
            ],
            type_of_fields: ["upload"],
            required_for: "Proof of Identity of Business Owners and Authorised Signatory",
            is_optional: false,
          },
          {
            name_of_document: ["Authorised signatory PAN Card details"],
            type_of_fields: ["text"],
            required_for: "Proof of Identity of Business Owners and Authorised Signatory",
            is_optional: false,
          },
        ],
      },
    },
  },
  {
    private_limited_public_limited: {
      "Proof of Business Identity": {
        documents_required_count: 2,
        types_of_documents_accepted: [
          {
            name_of_document: ["Certificate of Incorporation"],
            type_of_fields: ["upload"],
            required_for: "Proof of Business Identity",
            is_optional: false,
          },
          {
            name_of_document: ["CIN"],
            type_of_fields: ["text"],
            required_for: "Proof of Business Identity",
            is_optional: false,
          },
        ],
      },
      "Proof of Business Existence": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: ["Company PAN Card"],
            type_of_fields: ["upload"],
            required_for: "Proof of Business Existence",
            is_optional: false,
          },
        ],
      },
      "Proof of Business Working": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: ["Cancelled cheque", "Bank letter head"],
            type_of_fields: ["upload"],
            required_for: "Proof of Business Working",
            is_optional: false,
          },
        ],
      },
      "Proof of Identity of Business Owners and Authorised Signatory": {
        documents_required_count: 2,
        types_of_documents_accepted: [
          {
            name_of_document: [
              "Government-approved authorised signatory identity proof (like Aadhar Card/Voter Id/Passport)",
            ],
            type_of_fields: ["upload"],
            required_for: "Proof of Identity of Business Owners and Authorised Signatory",
            is_optional: false,
          },
          {
            name_of_document: ["Authorised signatory PAN Card details"],
            type_of_fields: ["text"],
            required_for: "Proof of Identity of Business Owners and Authorised Signatory",
            is_optional: false,
          },
        ],
      },
    },
  },
  {
    partnership: {
      "Proof of Business Identity": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: ["Registered Partnership Deed"],
            type_of_fields: ["upload"],
            required_for: "Proof of Business Identity",
            is_optional: false,
          },
        ],
      },
      "Proof of Business Existence": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: ["Company PAN Card"],
            type_of_fields: ["upload"],
            required_for: "Proof of Business Existence",
            is_optional: false,
          },
        ],
      },
      "Proof of Business Working": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: ["Cancelled cheque", "Bank letter head"],
            type_of_fields: ["upload"],
            required_for: "Proof of Business Working",
            is_optional: false,
          },
        ],
      },
      "Proof of Identity of Business Owners and Authorised Signatory": {
        documents_required_count: 2,
        types_of_documents_accepted: [
          {
            name_of_document: [
              "Government-approved authorised signatory identity proof (like Aadhar Card/Voter Id/Passport)",
            ],
            type_of_fields: ["upload"],
            required_for: "Proof of Identity of Business Owners and Authorised Signatory",
            is_optional: false,
          },
          {
            name_of_document: ["Authorised signatory PAN Card details"],
            type_of_fields: ["text"],
            required_for: "Proof of Identity of Business Owners and Authorised Signatory",
            is_optional: false,
          },
        ],
      },
    },
  },
  {
    sole_proprietorship: {
      "Proof of Business Identity and Existence": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: ["MSME Certificate", "GST Certificate"],
            type_of_fields: ["upload"],
            required_for: "Proof of Business Identity and Existence",
            is_optional: false,
          },
        ],
      },
      "Proof of Business Working": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: ["Cancelled cheque", "Bank letter head"],
            type_of_fields: ["upload"],
            required_for: "Proof of Business Working",
            is_optional: false,
          },
        ],
      },
      "Proof of Identity of Business Owners": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: ["PAN Card"],
            type_of_fields: ["upload"],
            required_for: "Proof of Identity of Business Owners",
            is_optional: false,
          },
        ],
      },
      "Proof of address of Business Owners": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: [
              "Government-approved identity and address Proof of Proprietor (like Aadhar Card/Voter Id/Passport)",
            ],
            type_of_fields: ["upload"],
            required_for: "Proof of address of Business Owners",
            is_optional: false,
          },
        ],
      },
      "Proof of Identity of Business Owners and Authorised Signatory": {
        documents_required_count: 2,
        types_of_documents_accepted: [
          {
            name_of_document: [
              "Government-approved authorised signatory identity proof (like Aadhar Card/Voter Id/Passport)",
            ],
            type_of_fields: ["upload"],
            required_for: "Proof of Identity of Business Owners and Authorised Signatory",
            is_optional: false,
          },
          {
            name_of_document: ["Authorised signatory PAN Card details"],
            type_of_fields: ["text"],
            required_for: "Proof of Identity of Business Owners and Authorised Signatory",
            is_optional: false,
          },
        ],
      },
    },
  },
  {
    individual: {
      "Proof of Identity": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: ["Aadhar Card", "Voter Id", "Passport"],
            type_of_fields: ["upload"],
            required_for: "Proof of Identity",
            is_optional: false,
          },
        ],
      },
      "PAN Card Details": {
        documents_required_count: 1,
        types_of_documents_accepted: [
          {
            name_of_document: ["PAN Card"],
            type_of_fields: ["upload"],
            required_for: "PAN Card Details",
            is_optional: false,
          },
        ],
      },
      "Proof of Business Working (optional)": {
        documents_required_count: 0,
        types_of_documents_accepted: [
          {
            name_of_document: ["Cancelled cheque", "Bank letter head"],
            type_of_fields: ["upload"],
            required_for: "Proof of Business Working",
            is_optional: true,
          },
        ],
      },
    },
  },
];

// Flatten config for easier access
const kycConfig: Record<string, any> = {};
kycConfigRaw.forEach((obj) => Object.assign(kycConfig, obj));

const companyTypeOptions = [
  { value: "llp", label: "LLP" },
  { value: "private_limited_public_limited", label: "Private/Public Limited" },
  { value: "partnership", label: "Partnership" },
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "individual", label: "Individual" },
];

export interface User {
  _id: string;
  name: string;
}


type Pool = {
  _id: string;
  name: string;
  status: "active" | "inactive" | string;
  admins?: User[];
  wallet_balance?: number;
  created_by?: { name: string };
  ownership?: { name: string };
  createdAt?: string;
  company_type?: string;
  website?: string;
  business_logo?: string | File | null;
  bank_details?: {
    account_number?: string;
    ifsc?: string;
    holder_name?: string;
    cheque?: string | File | null;
    approval_status?: string,
    status_message?: string,

  };
  kyc_documents?: any[];
};

const Pools: React.FC = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);
  const [adminList, setAdminList] = useState<User[]>([]);
  const [tabKey, setTabKey] = useState("business");
  const [companyType, setCompanyType] = useState<string>("");
  const [businessDetails, setBusinessDetails] = useState({
    name: "",
    logo: null as File | string | null,
    website: "",
  });
  const [bankDetails, setBankDetails] = useState({
    account_number: "",
    account_number_confirm: "",
    ifsc: "",
    holder_name: "",
    approval_status: "",
    status_message: "",
    cheque: null as File | string | null,
  });
  const [kycDocs, setKycDocs] = useState<{ [key: string]: any }>({});
  const [kycSelections, setKycSelections] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const poolsData = await getAllPools();
      setPools(poolsData);
    } catch (error) {
      console.error("Error loading pools or users", error);
      toast.error("Failed to load pools");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingPool(null);
    setBusinessDetails({ name: "", logo: null, website: "" });
    setAdminList([]);
    setCompanyType("");
    setBankDetails({
      account_number: "",
      account_number_confirm: "",
      ifsc: "",
      holder_name: "",
      cheque: null,
      approval_status: "",
      status_message: "",
    });
    setKycDocs({});
    setKycSelections({});
    setTabKey("business");
  };

  const handleShow = () => {
    handleClose();
    setShowModal(true);
  };

  const handleEdit = (pool: Pool) => {
    setEditingPool(pool);
    setBusinessDetails({
      name: pool.name,
      logo: pool.business_logo || null,
      website: pool.website || "",
    });
    setAdminList(pool.admins || []);
    setCompanyType(pool.company_type || "");
    setBankDetails({
      account_number: pool.bank_details?.account_number || "",
      account_number_confirm: pool.bank_details?.account_number || "",
      ifsc: pool.bank_details?.ifsc || "",
      holder_name: pool.bank_details?.holder_name || "",
      cheque: pool.bank_details?.cheque || null,
      approval_status: pool.bank_details?.approval_status || "",
      status_message: pool.bank_details?.status_message || "",

    });
    // Reset KYC docs & selections? You might want to load if available
    setKycDocs(
      Array.isArray(pool.kyc_documents)
        ? pool.kyc_documents.reduce((acc: { [key: string]: any }, doc: any) => {
          // Compose a key similar to how you store in state
          // Prefer section + document_type + _text if it's a text field
          const key = doc.section
          console.log(JSON.stringify(doc))
          if (key) {
            acc[key] = {
              text: doc.value || "",
              file: (doc.value || "" as string).startsWith("http"),
              type: doc.document_type,
              approval_status: doc.approval_status,
              status_message: doc.status_message
            };
          }
          return acc;
        }, {})
        : {}
    );
    setKycSelections({});
    setShowModal(true);
    setTabKey("business");
  };

  const handleToggleStatus = async (pool: Pool) => {
    const newStatus = pool.status === "active" ? "inactive" : "active";
    if (window.confirm(`Mark this pool as ${newStatus}?`)) {
      try {
        await updatePool(pool._id, { status: newStatus });
        fetchInitialData();
        toast.success(`Pool status updated to ${newStatus}`);
      } catch (error) {
        console.error("Error updating status", error);
        toast.error("Failed to update status");
      }
    }
  };

  function transformFormToPoolModel({
    businessDetails,
    companyType,
    bankDetails,
    kycDocs,
    adminList,
  }: any) {
    const kyc_documents = Object.entries(kycDocs).map(([key, value]: any) => {
      if (value instanceof File) {
        const [section, ...rest] = key.split("_");
        let document_type = rest.join("_").replace(/_text$/, "");
        const isText = key.endsWith("_text");
        return {
          section,
          document_type,
          value: isText ? value : undefined,
          file: !isText && value instanceof File ? value : undefined,
          is_optional: false,
        };
      } else {
        return {
          section: key,
          document_type: value.type,
          value: value.text,
          file: undefined,
          is_optional: false,
        }
      }
    });

    const bank_details: any = {};
    ["account_number", "ifsc", "holder_name", "cheque"].forEach((field) => {
      if (bankDetails[field]) bank_details[field] = bankDetails[field];
    });

    return {
      name: businessDetails.name,
      company_type: companyType,
      business_logo: businessDetails.logo || undefined,
      website: businessDetails.website || undefined,
      admins: adminList.map((a: any) => a._id),
      bank_details: Object.keys(bank_details).length ? bank_details : undefined,
      kyc_documents: kyc_documents.length ? kyc_documents : undefined,
    };
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (formDataObj: any) => {
    try {
      const payload = transformFormToPoolModel(formDataObj);

      // Upload KYC Docs to S3
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
          `logos/${Date.now()}-${payload.business_logo.name.replace(/ /g, "_")}`,
          await fileToBase64(payload.business_logo)
        );
        payload.business_logo = logoData.url;
      }

      // Upload Bank Cheque
      if (payload.bank_details && payload.bank_details.cheque instanceof File) {
        const chequeData = await createAmazonS3(
          `cheques/${Date.now()}-${payload.bank_details.cheque.name.replace(/ /g, "_")}`,
          await fileToBase64(payload.bank_details.cheque)
        );
        payload.bank_details.cheque = chequeData.url;
      }
      if (editingPool) {
        await updatePool(editingPool._id, payload);
        toast.success("Pool updated successfully");
      } else {
        await createPool(payload);
        toast.success("Pool created successfully");
      }

      fetchInitialData();
      handleClose();
    } catch (error) {
      console.error("Error saving pool", error);
      toast.error("Failed to save pool");
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
      setAdminList([...adminList, userObj]);
    } catch (error) {
      toast.error("Error searching user");
    }
  };

  const removeAdmin = (id: string) => {
    setAdminList(adminList.filter((a) => a._id !== id));
  };

  // Columns for DataTable
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
          row.status === "active" ? "success" : row.status === "inactive" ? "secondary" : "warning";
        return <Badge bg={color}>{row.status}</Badge>;
      },
      sortable: true,
    },
    {
      name: "Wallet",
      selector: (row: Pool) => row.wallet_balance || 0,
      cell: (row: Pool) => (
        <Badge bg={row.wallet_balance && row.wallet_balance > 0 ? "success" : "secondary"}>
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
      name: "Ownership",
      selector: (row: Pool) => row.ownership?.name || "Unknown",
    },
    {
      name: "Created At",
      selector: (row: Pool) => new Date(row.createdAt || "").toLocaleDateString(),
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

  // Render KYC inputs based on kycConfig and companyType
  // kycConfig should be defined somewhere accessible
  const renderKycFields = () => {
    if (!companyType || !kycConfig[companyType]) {
      return <div className="text-muted">Select company type to see KYC requirements.</div>;
    }

    return (
      <div>
        {Object.entries(kycConfig[companyType]).map(([section, sectionObj]: any) => {

          const approvalStatus = kycDocs[section]?.approval_status || "not_submitted";
          const statusMessage = kycDocs[section]?.status_message || "Check again after 48 working hours";
          const isEditable = approvalStatus === "not_submitted";
          console.log(kycDocs[section], kycDocs[section]?.approval_status)
          // kycDocs[section]
          return (
            <Card className="mb-3" key={section}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Card.Title className="mb-0"> {section}</Card.Title>
                  <Badge
                    bg={
                      approvalStatus === "approved"
                        ? "success"
                        : approvalStatus === "rejected"
                          ? "danger"
                          : approvalStatus === "pending"
                            ? "warning"
                            : "secondary"
                    }
                  >
                    {approvalStatus.replace(/_/g, " ")
                      .replace(/\b\w/g, (char: any) => char.toUpperCase())}
                  </Badge>
                </div>

                {sectionObj.types_of_documents_accepted.map((doc: any, idx: number) => {
                  const docNames = doc.name_of_document;
                  const selectKey = `${section}_${idx}_select`;
                  const selectedDoc =
                    docNames.length > 1
                      ? kycSelections[selectKey] || docNames[0]
                      : docNames[0];

                  const fileKey = `${section}_${selectedDoc}`;
                  const textKey = `${fileKey}_text`;

                  return (
                    <Row key={idx} className="align-items-end mb-2">
                      <Col md={6}>
                        <Form.Label className="fw-bold">
                          {docNames.length > 1 ? (
                            <Form.Select
                              value={selectedDoc}
                              onChange={e =>
                                setKycSelections(prev => ({
                                  ...prev,
                                  [selectKey]: e.target.value,
                                }))
                              }
                              className="mb-2"
                              disabled={!isEditable}
                            >
                              {docNames.map((name: string) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </Form.Select>
                          ) : (
                            docNames[0]
                          )}
                        </Form.Label>

                        {doc.type_of_fields.includes("upload") && (
                          isEditable ? (
                            <Form.Control
                              type="file"
                              onChange={(e: any) =>
                                setKycDocs(prev => ({
                                  ...prev,
                                  [fileKey]: e.target.files?.[0] || null,
                                }))
                              }
                            />
                          ) : (
                            <div className="text-muted small">
                              {statusMessage}
                            </div>
                          )
                        )}
                      </Col>

                      {doc.type_of_fields.includes("text") && (
                        <Col md={6}>
                          <Form.Label>Details</Form.Label>
                          {isEditable ? (
                            <Form.Control
                              type="text"
                              value={kycDocs[textKey] || ""}
                              onChange={e =>
                                setKycDocs(prev => ({
                                  ...prev,
                                  [textKey]: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <div className="form-control-plaintext">
                              {kycDocs[textKey] || "N/A"}
                            </div>
                          )}
                        </Col>
                      )}
                    </Row>
                  );
                })}
              </Card.Body>
            </Card>
          )
        })
        }
      </div >
    );
  };

  return (
    <>
      <Row className="mb-3">
        <Col>
          <h3>Pools Management</h3>
        </Col>
        <Col className="text-end">
          <Button onClick={handleShow}>Add New Pool</Button>
        </Col>
      </Row>
      <DataTable
        columns={columns}
        data={pools}
        progressPending={loading}
        pagination
        highlightOnHover
      />

      <Modal
        size="lg"
        show={showModal}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingPool ? "Edit Pool" : "Add New Pool"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs activeKey={tabKey} onSelect={(k) => setTabKey(k || "business")}>
            <Tab eventKey="business" title="Business">
              <Form.Group className="mb-3" controlId="poolName">
                <Form.Label>Pool Name</Form.Label>
                <Form.Control
                  type="text"
                  value={businessDetails.name}
                  onChange={(e) =>
                    setBusinessDetails({ ...businessDetails, name: e.target.value })
                  }
                  placeholder="Enter pool name"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="companyType">
                <Form.Label>Company Type</Form.Label>
                <Form.Select
                  value={companyType}
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

              <Form.Group className="mb-3" controlId="website">
                <Form.Label>Website</Form.Label>
                <Form.Control
                  type="text"
                  value={businessDetails.website}
                  onChange={(e) =>
                    setBusinessDetails({ ...businessDetails, website: e.target.value })
                  }
                  placeholder="Website URL"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="businessLogo">
                <Form.Label>Business Logo</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e: any) => {
                    const file = e.target.files?.[0];
                    if (file) setBusinessDetails({ ...businessDetails, logo: file });
                  }}
                />
                {businessDetails.logo && typeof businessDetails.logo === "string" && (
                  <div>
                    <img
                      src={businessDetails.logo}
                      alt="Business Logo"
                      style={{ width: 120, marginTop: 10 }}
                    />
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-3" controlId="adminSearch">
                <Form.Label>Add Admin by Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter admin email"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      await handleUserSearch((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <Form.Text className="text-muted">
                  Press Enter to search and add admin.
                </Form.Text>
              </Form.Group>
              <div>
                <h6>Admins</h6>
                {adminList.length === 0 && <div>No admins added</div>}
                {adminList.map((admin) => (
                  <Badge
                    pill
                    bg="primary"
                    key={admin._id}
                    style={{ marginRight: 5, cursor: "pointer" }}
                    onClick={() => removeAdmin(admin._id)}
                    title="Click to remove admin"
                  >
                    {admin.name} &times;
                  </Badge>
                ))}
              </div>
            </Tab>

            <Tab eventKey="bank" title="Bank Details">
              <Row className="align-items-center justify-content-between mb-3 mt-3">
                <Col xs="auto">
                  <Modal.Title as="h5">Bank Details</Modal.Title>
                </Col>
                <Col xs="auto">
                  <Badge bg={bankDetails?.approval_status === 'approved' ? 'success' : bankDetails?.approval_status === 'rejected' ? 'danger' : 'warning'}>
                    {(bankDetails?.approval_status || 'Pending').replace(/_/g, " ")
                      .replace(/\b\w/g, (char: any) => char.toUpperCase())}
                  </Badge>
                </Col>
              </Row>
              {
                (bankDetails?.approval_status && bankDetails?.approval_status == "not_submitted") ? (<div>
                  <Form.Group className="mb-3" controlId="accountNumber">
                    <Form.Label>
                      Account Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={bankDetails.account_number}
                      onChange={(e) =>
                        setBankDetails({ ...bankDetails, account_number: e.target.value })
                      }
                      placeholder="Account Number"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="accountNumberConfirm">
                    <Form.Label>Confirm Account Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={bankDetails.account_number_confirm}
                      onChange={(e) =>
                        setBankDetails({ ...bankDetails, account_number_confirm: e.target.value })
                      }
                      placeholder="Confirm Account Number"
                    />
                    {bankDetails.account_number &&
                      bankDetails.account_number_confirm &&
                      bankDetails.account_number !== bankDetails.account_number_confirm && (
                        <Form.Text className="text-danger">
                          Account numbers do not match
                        </Form.Text>
                      )}
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="ifsc">
                    <Form.Label>IFSC Code</Form.Label>
                    <Form.Control
                      type="text"
                      value={bankDetails.ifsc}
                      onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                      placeholder="IFSC Code"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="holderName">
                    <Form.Label>Account Holder Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={bankDetails.holder_name}
                      onChange={(e) =>
                        setBankDetails({ ...bankDetails, holder_name: e.target.value })
                      }
                      placeholder="Account Holder Name"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="cheque">
                    <Form.Label>Cancelled Cheque</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e: any) => {
                        const file = e.target.files?.[0];
                        if (file) setBankDetails({ ...bankDetails, cheque: file });
                      }}
                    />
                    {bankDetails.cheque && typeof bankDetails.cheque === "string" && (
                      <div>
                        <a href={bankDetails.cheque} target="_blank" rel="noreferrer">
                          View uploaded cheque
                        </a>
                      </div>
                    )}
                  </Form.Group>
                </div>
                ) : (
                  <div>
                    {bankDetails?.status_message}
                  </div>
                )}
            </Tab>

            <Tab eventKey="kyc" title="KYC Documents">
              {renderKycFields()}
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              handleSubmit({
                businessDetails,
                companyType,
                bankDetails,
                kycDocs,
                adminList,
              })
            }
            disabled={
              !businessDetails.name ||
              !companyType ||
              !bankDetails.account_number ||
              bankDetails.account_number !== bankDetails.account_number_confirm
            }
          >
            {editingPool ? "Update Pool" : "Create Pool"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Pools;
export { Pools };
