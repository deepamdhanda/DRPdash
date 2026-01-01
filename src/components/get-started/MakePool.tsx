// Pools.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  Spinner,
  Collapse,
  Badge,
} from "react-bootstrap";
import { toast } from "react-toastify";

import { createPool } from "../../APIs/user/pool";
import { getUser } from "../../APIs/user/user";
import { createAmazonS3 } from "../../APIs/user/amazonS3";
import { getGST } from "../../APIs/user/gst";

/**
 * Simplified onboarding-first Pool creation screen.
 * - Minimal required fields for first-time onboarding.
 * - Optional GST verification and Advanced section (KYC/logo/address).
 * - Admins can be added by email (press Enter).
 */

/* --- Types --- */
export interface User {
  _id: string;
  name: string;
  email?: string;
}

// const COMPANY_TYPE_OPTIONS = [
//   { value: "individual", label: "Individual" },
//   { value: "private_limited_company", label: "Private Ltd" },
//   { value: "public_limited_company", label: "Public Ltd" },
//   { value: "llp", label: "LLP" },
//   { value: "partnership", label: "Partnership" },
// ];

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

const validateGSTIN = (gstin: string) =>
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);

const validateIFSC = (ifsc: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);

/* --- Component --- */
const MakePool: React.FC<{ handleNext: () => void }> = ({ handleNext }) => {
  // Minimal required onboarding fields
  const [businessName, setBusinessName] = useState("");
  const [companyType, setCompanyType] = useState("individual");
  // const companyType = "individual";
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIFSC, setBankIFSC] = useState("");
  const [gstin, setGstin] = useState("");

  // Optional / UI state
  const [admins, setAdmins] = useState<User[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gstLoading, setGstLoading] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);
  const [logoFile, setLogoFile] = useState<File | string | null>(null);
  const [panFile, setPanFile] = useState<File | string | null>(null);
  const [address, setAddress] = useState("");
  const [stateName, setStateName] = useState("");

  useEffect(() => {
    setCompanyType("individual");
  }, []);
  // --- Admin search by email ---
  const handleUserSearch = async (email: string) => {
    const e = email.trim();
    if (!e) {
      toast.warn("Enter an email to add an admin");
      return;
    }
    try {
      const res = await getUser(e);

      if (!res || res.length === 0) {
        toast.warn("User not found");
        return;
      }
      const u = res[0];
      if (admins.some((a) => a._id === u._id)) {
        toast.info("Admin already added");
        return;
      }
      setAdmins((p) => [...p, u]);
      toast.success("Admin added");
    } catch (err) {
      console.error("User search error", err);
      toast.error("Failed to search user");
    }
  };

  // --- GST verification (optional) ---
  const verifyGst = async () => {
    const g = gstin.trim().toUpperCase();
    if (!g) {
      toast.warn("Enter GSTIN to verify");
      return;
    }
    if (!validateGSTIN(g)) {
      toast.error("GSTIN format looks invalid");
      return;
    }
    setGstLoading(true);
    try {
      const data = await getGST(g);
      // data is expected to include business_name, state, etc.
      setGstLoading(false);
      setGstVerified(true);
      setBusinessName((prev) => prev || data.business_name || "");
      setStateName(data.state || "");
      setCompanyType(data.company_type);
      toast.success("GST verified; business details autofilled");
    } catch (err) {
      setGstLoading(false);
      setGstVerified(false);
      console.error("GST verify error", err);
      toast.error("GST verification failed");
    }
  };

  // --- Submit handler (focused on onboarding) ---
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Basic validations
    if (!businessName.trim()) {
      toast.warn("Business name is required");
      return;
    }
    if (!ownerName.trim()) {
      toast.warn("Owner name is required");
      return;
    }
    if (!bankAccount.trim()) {
      toast.warn("Bank account number is required (for payouts)");
      return;
    }
    if (!bankIFSC.trim() || !validateIFSC(bankIFSC.trim().toUpperCase())) {
      toast.warn("Valid IFSC is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: businessName.trim(),
        company_type: companyType,
        owner: {
          full_name: ownerName.trim(),
          email: ownerEmail.trim() || undefined,
        },
        admins: admins.map((a) => a._id),
        bank_details: {
          account_number: bankAccount.trim(),
          ifsc: bankIFSC.trim().toUpperCase(),
        },
        status: "active",
      };

      // include GST if verified
      if (gstVerified) payload.gstin = gstin.trim().toUpperCase();

      // include advanced fields when provided
      if (address.trim()) payload.address = address.trim();
      if (stateName.trim()) payload.state = stateName.trim();

      // upload logo if provided
      if (logoFile && logoFile instanceof File) {
        try {
          const logoData = await createAmazonS3(
            `logos/${Date.now()}-${(logoFile as File).name.replace(/ /g, "_")}`,
            await fileToBase64(logoFile as File)
          );
          payload.business_logo = logoData.url;
        } catch (err) {
          console.warn("Logo upload skipped", err);
        }
      } else if (typeof logoFile === "string") {
        payload.business_logo = logoFile;
      }

      // upload PAN if provided
      if (panFile && panFile instanceof File) {
        try {
          const panData = await createAmazonS3(
            `kyc/${Date.now()}-${(panFile as File).name.replace(/ /g, "_")}`,
            await fileToBase64(panFile as File)
          );
          payload.kyc_documents = [
            {
              section: "PAN",
              document_type: "PAN",
              value: panData.url,
              is_optional: false,
            },
          ];
        } catch (err) {
          console.warn("PAN upload skipped", err);
        }
      }

      await createPool(payload);
      toast.success("Pool created — welcome aboard!");
      handleNext();
    } catch (err) {
      console.error("Create pool error", err);
      toast.error("Failed to create pool. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- UI ---
  return (
    <div className="shadow-sm">
      <Card.Body>
        <Row className="align-items-center mb-3">
          <Col>
            <h4 className="mb-1">Create Your Pool</h4>
            <div className="text-muted">
              A pool groups warehouses, teams and payouts.
            </div>
          </Col>
          <Col xs="auto">
            <Badge bg="info">Onboarding</Badge>
          </Col>
        </Row>

        <hr />

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={7}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">
                  Business / Brand Name
                </Form.Label>
                <Form.Control
                  placeholder="e.g. Acme Retail"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
                <Form.Text className="text-muted">
                  This is used in invoices and internal lists.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">
                  Owner / Primary Contact
                </Form.Label>
                <Form.Control
                  placeholder="Full name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Bank Account</Form.Label>
                    <Form.Control
                      placeholder="Account number"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">IFSC</Form.Label>
                    <Form.Control
                      placeholder="IFSC code"
                      value={bankIFSC}
                      onChange={(e) =>
                        setBankIFSC(e.target.value.toUpperCase())
                      }
                    />
                    <Form.Text className="text-muted">
                      Used for payouts (required)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-2">
                <Form.Label className="fw-medium">PAN</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*,.pdf"
                  required
                  onChange={(e: any) => {
                    const f = e.target.files?.[0];
                    if (f) setPanFile(f);
                  }}
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2 mt-2">
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setBusinessName("");
                    setOwnerName("");
                    setOwnerEmail("");
                    setBankAccount("");
                    setBankIFSC("");
                    setAdmins([]);
                    setGstin("");
                    setGstVerified(false);
                  }}
                  disabled={submitting}
                >
                  Reset
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />{" "}
                      Creating...
                    </>
                  ) : (
                    "Create Pool"
                  )}
                </Button>
              </div>
            </Col>

            <Col md={5}>
              <Card className="h-100 border-0 bg-light">
                <Card.Body>
                  <h6 className="mb-2">Quick Setup</h6>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">
                      GSTIN (optional)
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        placeholder="GSTIN (optional)"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      />
                      <Button
                        variant="outline-primary"
                        onClick={verifyGst}
                        disabled={gstLoading}
                      >
                        {gstLoading ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Verify to autofill business details.
                    </Form.Text>
                    {gstVerified && (
                      <div className="mt-2">
                        <Badge bg="success">GST Verified</Badge>
                      </div>
                    )}
                  </Form.Group>

                  <hr />

                  <div className="mb-3">
                    <h6 className="mb-1">Advanced (optional)</h6>
                    <small className="text-muted">
                      Add logo, PAN or address now or skip and do later.
                    </small>
                    <div>
                      <Button
                        variant="link"
                        onClick={() => setAdvancedOpen((s) => !s)}
                        aria-expanded={advancedOpen}
                        className="p-0"
                      >
                        {advancedOpen ? "Hide details" : "Add advanced details"}
                      </Button>
                    </div>
                  </div>

                  <Collapse in={advancedOpen}>
                    <div>
                      <Form.Group className="mb-2">
                        <Form.Label className="fw-medium">
                          Business Logo
                        </Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={(e: any) => {
                            const f = e.target.files?.[0];
                            if (f) setLogoFile(f);
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label className="fw-medium">
                          Address (optional)
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label className="fw-medium">
                          State (optional)
                        </Form.Label>
                        <Form.Control
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">
                          Admins (add by email)
                        </Form.Label>
                        <Form.Control
                          placeholder="Type email and press Enter"
                          onKeyDown={async (e: any) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const email = e.target.value?.trim();
                              if (email) {
                                await handleUserSearch(email);
                                e.target.value = "";
                              }
                            }
                          }}
                        />
                        <div className="mt-2">
                          {admins.map((a) => (
                            <Badge
                              key={a._id}
                              pill
                              bg="primary"
                              className="me-2 mb-2"
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                setAdmins((p) =>
                                  p.filter((x) => x._id !== a._id)
                                )
                              }
                            >
                              {a.name} &times;
                            </Badge>
                          ))}
                        </div>
                      </Form.Group>
                    </div>
                  </Collapse>

                  <hr />

                  <div>
                    <h6 className="mb-1">Why this is needed</h6>
                    <ul
                      className="small text-muted"
                      style={{ paddingLeft: 18 }}
                    >
                      <li>
                        Bank details are required to enable merchant payouts.
                      </li>
                      <li>
                        Admins can manage orders and shipping after onboarding.
                      </li>
                      <li>
                        GST verification helps autofill company information
                        (optional).
                      </li>
                    </ul>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </div>
  );
};

export default MakePool;
