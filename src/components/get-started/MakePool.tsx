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
  Badge,
} from "react-bootstrap";
import { toast } from "react-toastify";

import { createPool } from "../../APIs/user/pool";
import { getUser } from "../../APIs/user/user";
import { createAmazonS3 } from "../../APIs/user/amazonS3";
import { getGST } from "../../APIs/user/gst";

/* --- Types --- */
export interface User {
  _id: string;
  name: string;
  email?: string;
}

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
  // --- Section 1 State ---
  const [hasGst, setHasGst] = useState<boolean>(true); // Default to Yes
  const [gstin, setGstin] = useState("");
  const [businessName, setBusinessName] = useState(""); // Firm Name
  const [ownerName, setOwnerName] = useState(""); // Contact Person
  const [panFile, setPanFile] = useState<File | string | null>(null);

  // --- Section 2 State ---
  const [bankAccount, setBankAccount] = useState("");
  const [bankIFSC, setBankIFSC] = useState("");
  const [chequeFile, setChequeFile] = useState<File | null>(null); // Cancelled Cheque

  // --- Additional / Hidden Functionality State ---
  const [ownerEmail, setOwnerEmail] = useState(""); // Kept for payload
  const [admins, setAdmins] = useState<User[]>([]);
  const [companyType, setCompanyType] = useState("individual");
  const [submitting, setSubmitting] = useState(false);
  const [gstLoading, setGstLoading] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);
  // const [address, setAddress] = useState("");
  const address = "";
  const [stateName, setStateName] = useState("");

  // Logic
  useEffect(() => {
    // If user selects "No GST", default to individual
    if (!hasGst) {
      setCompanyType("individual");
      setGstVerified(false);
      setGstin("");
    }
  }, [hasGst]);

  // --- Admin search by email ---
  const handleUserSearch = async (email: string) => {
    const e = email.trim();
    if (!e) return;
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

  // --- GST verification ---
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
      setGstLoading(false);
      setGstVerified(true);
      setBusinessName((prev) => prev || data.business_name || "");
      setStateName(data.state || "");
      setCompanyType(data.company_type);
      toast.success("GST verified; Details autofilled");
    } catch (err) {
      setGstLoading(false);
      setGstVerified(false);
      console.error("GST verify error", err);
      toast.error("GST verification failed");
    }
  };

  // --- Submit handler ---
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validations
    if (hasGst && !gstVerified) {
      // Optional: You can force verification or just check if text exists
      if (!gstin.trim()) {
        toast.warn("Please enter GST Number");
        return;
      }
    }
    if (!businessName.trim()) {
      toast.warn("Firm Name is required");
      return;
    }
    if (!ownerName.trim()) {
      toast.warn("Contact Person name is required");
      return;
    }
    if (!bankAccount.trim()) {
      toast.warn("Bank account number is required");
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
        kyc_documents: [],
      };

      if (hasGst && gstin) payload.gstin = gstin.trim().toUpperCase();
      if (address.trim()) payload.address = address.trim();
      if (stateName.trim()) payload.state = stateName.trim();

      // 1. Upload PAN
      if (panFile && panFile instanceof File) {
        try {
          const panData = await createAmazonS3(
            `kyc/pan/${Date.now()}-${panFile.name.replace(/ /g, "_")}`,
            await fileToBase64(panFile)
          );
          payload.kyc_documents.push({
            section: "PAN",
            document_type: "PAN",
            value: panData.url,
            is_optional: false,
          });
        } catch (err) {
          console.warn("PAN upload skipped", err);
        }
      }

      // 2. Upload Cancelled Cheque
      if (chequeFile && chequeFile instanceof File) {
        try {
          const chequeData = await createAmazonS3(
            `kyc/cheque/${Date.now()}-${chequeFile.name.replace(/ /g, "_")}`,
            await fileToBase64(chequeFile)
          );
          payload.kyc_documents.push({
            section: "BANK",
            document_type: "CANCELLED_CHEQUE",
            value: chequeData.url,
            is_optional: false,
          });
        } catch (err) {
          console.warn("Cheque upload skipped", err);
        }
      }

      await createPool(payload);
      toast.success("Pool created successfully!");
      handleNext();
    } catch (err) {
      console.error("Create pool error", err);
      toast.error("Failed to create pool. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="shadow-sm">
      <Card.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium d-block">
                Do you have a GST Number?
              </Form.Label>
              <Form.Check
                inline
                type="radio"
                label="Yes"
                name="gstRadio"
                id="gstYes"
                checked={hasGst === true}
                onChange={() => setHasGst(true)}
              />
              <Form.Check
                inline
                type="radio"
                label="No"
                name="gstRadio"
                id="gstNo"
                checked={hasGst === false}
                onChange={() => setHasGst(false)}
              />
            </Form.Group>

            {hasGst && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">GST Number</Form.Label>
                <InputGroup>
                  <Form.Control
                    placeholder="Enter GSTIN"
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
                {gstVerified && (
                  <Form.Text className="text-success">
                    Verified successfully
                  </Form.Text>
                )}
              </Form.Group>
            )}

            <Row>
              <Col md={6}>
                {/* 3. Firm Name */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Firm Name</Form.Label>
                  <Form.Control
                    placeholder="e.g. Acme Retail"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                {/* 4. Contact Person */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Contact Person</Form.Label>
                  <Form.Control
                    placeholder="Full Name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* 5. PAN Card */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">PAN Card Upload</Form.Label>
              <Form.Control
                type="file"
                accept="image/*,.pdf"
                onChange={(e: any) => {
                  const f = e.target.files?.[0];
                  if (f) setPanFile(f);
                }}
              />
              <Form.Text className="text-muted">
                Upload clear image or PDF of PAN
              </Form.Text>
            </Form.Group>
          </div>
          <hr className="my-5 border-secondary" style={{ opacity: 0.2 }} />
          <div className="mb-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    Bank Account Number
                  </Form.Label>
                  <Form.Control
                    placeholder="Enter Account Number"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">IFSC Code</Form.Label>
                  <Form.Control
                    placeholder="Enter IFSC"
                    value={bankIFSC}
                    onChange={(e) => setBankIFSC(e.target.value.toUpperCase())}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Cancelled Cheque</Form.Label>
              <Form.Control
                type="file"
                accept="image/*,.pdf"
                onChange={(e: any) => {
                  const f = e.target.files?.[0];
                  if (f) setChequeFile(f);
                }}
              />
              <Form.Text className="text-muted">
                Upload a cancelled cheque for bank verification
              </Form.Text>
            </Form.Group>
          </div>

          <details className="mb-4">
            <summary className="text-muted small cursor-pointer">
              Additional Settings (Admins, Email)
            </summary>
            <div className="p-3 border rounded mt-2 bg-light">
              <Form.Group className="mb-2">
                <Form.Label className="small">
                  Admin Email (Add multiple)
                </Form.Label>
                <Form.Control
                  size="sm"
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
                    <Badge key={a._id} bg="info" className="me-2 mb-2">
                      {a.name}
                    </Badge>
                  ))}
                </div>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="small">
                  Owner Email (Optional)
                </Form.Label>
                <Form.Control
                  size="sm"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="For record keeping"
                />
              </Form.Group>
            </div>
          </details>

          <div className="d-grid gap-2">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Creating Pool...
                </>
              ) : (
                "Submit & Create Pool"
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </div>
  );
};

export default MakePool;
