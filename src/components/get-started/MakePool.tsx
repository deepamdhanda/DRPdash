import React, { useEffect, useState } from "react";
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

const MakePool: React.FC<{ handleNext: () => void }> = ({ handleNext }) => {
  const [hasGst, setHasGst] = useState(true);
  const [gstin, setGstin] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [panFile, setPanFile] = useState<File | null>(null);

  const [bankAccount, setBankAccount] = useState("");
  const [bankIFSC, setBankIFSC] = useState("");
  const [chequeFile, setChequeFile] = useState<File | null>(null);

  const [ownerEmail, setOwnerEmail] = useState("");
  const [admins, setAdmins] = useState<User[]>([]);
  const [companyType, setCompanyType] = useState("individual");
  const [submitting, setSubmitting] = useState(false);
  const [gstLoading, setGstLoading] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);
  const [stateName, setStateName] = useState("");

  useEffect(() => {
    if (!hasGst) {
      setCompanyType("individual");
      setGstVerified(false);
      setGstin("");
    }
  }, [hasGst]);

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
      toast.error("Failed to search user");
    }
  };

  const verifyGst = async () => {
    const g = gstin.trim().toUpperCase();
    if (!g) {
      toast.warn("Enter GSTIN to verify");
      return;
    }
    if (!validateGSTIN(g)) {
      toast.error("Invalid GSTIN format");
      return;
    }
    setGstLoading(true);
    try {
      const data = await getGST(g);
      setGstVerified(true);
      setBusinessName((prev) => prev || data.business_name || "");
      setStateName(data.state || "");
      setCompanyType(data.company_type);
      toast.success("GST verified — details autofilled");
    } catch {
      setGstVerified(false);
      toast.error("GST verification failed");
    } finally {
      setGstLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (hasGst && !gstin.trim()) {
      toast.warn("Please enter GST Number");
      return;
    }
    if (!businessName.trim()) {
      toast.warn("Firm Name is required");
      return;
    }
    if (!ownerName.trim()) {
      toast.warn("Contact Person is required");
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

      if (panFile) {
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
        } catch {
          console.warn("PAN upload skipped");
        }
      }
      if (chequeFile) {
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
        } catch {
          console.warn("Cheque upload skipped");
        }
      }

      await createPool(payload);
      toast.success("Business account created!");
      handleNext();
    } catch {
      toast.error("Failed to create account. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5891E]/20 focus:border-[#F5891E] transition-all";

  return (
    <div className="w-full mx-auto bg-white overflow-hidden font-sans">
      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Business Info */}
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 block mb-3">
              🏢 Business Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* GST Radio */}
              <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Do you have a GST Number?
                </label>
                <div className="flex gap-5 items-center pt-0.5">
                  {[
                    { val: true, label: "Yes" },
                    { val: false, label: "No" },
                  ].map(({ val, label }) => (
                    <label
                      key={label}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="radio"
                        name="gstRadio"
                        checked={hasGst === val}
                        onChange={() => setHasGst(val)}
                        className="accent-[#F5891E] w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* GST Input */}
              {hasGst && (
                <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    GST Number
                  </label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#F5891E]/20 focus-within:border-[#F5891E] transition-all">
                    <input
                      type="text"
                      placeholder="Enter GSTIN (e.g. 27AAPFU0939F1ZV)"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-sm text-gray-900 outline-none placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={verifyGst}
                      disabled={gstLoading}
                      className="px-4 py-2 bg-gray-50 border-l border-gray-200 text-xs font-bold text-[#F5891E] hover:bg-orange-50 active:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {gstLoading ? "Verifying…" : "Verify"}
                    </button>
                  </div>
                  {gstVerified && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md px-2 py-0.5 text-xs font-semibold mt-1 w-max">
                      ✓ GST Verified
                    </span>
                  )}
                </div>
              )}

              {/* Firm Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Firm Name
                </label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  placeholder="e.g. Acme Retail Pvt. Ltd."
                  className={inputClass}
                />
              </div>

              {/* Contact Person */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Contact Person
                </label>
                <input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>

              {/* Address */}
              <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Business Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, area, city, state, pincode"
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* PAN Upload */}
              <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  PAN Card
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e: any) => {
                    const f = e.target.files?.[0];
                    if (f) setPanFile(f);
                  }}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#FFF7ED] file:text-[#F5891E] hover:file:bg-orange-100 file:cursor-pointer border border-dashed border-gray-200 rounded-lg p-1.5 bg-gray-50/50"
                />
                <span className="text-[11px] text-gray-400">
                  Upload a clear image or PDF of your PAN card
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Section 2: Bank Details */}
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 block mb-3">
              🏦 Bank Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Account Number
                </label>
                <input
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required
                  placeholder="Enter account number"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  IFSC Code
                </label>
                <input
                  value={bankIFSC}
                  onChange={(e) => setBankIFSC(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. HDFC0001234"
                  className={inputClass}
                />
              </div>

              <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Cancelled Cheque
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e: any) => {
                    const f = e.target.files?.[0];
                    if (f) setChequeFile(f);
                  }}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#FFF7ED] file:text-[#F5891E] hover:file:bg-orange-100 file:cursor-pointer border border-dashed border-gray-200 rounded-lg p-1.5 bg-gray-50/50"
                />
                <span className="text-[11px] text-gray-400">
                  Upload a cancelled cheque for bank verification
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Collapsible Additional Settings */}
          <details className="border border-gray-200 rounded-lg overflow-hidden group">
            <summary className="px-4 py-2.5 cursor-pointer text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 select-none outline-none flex items-center justify-between transition-colors">
              <span>⚙ Additional Settings (Admins, Email)</span>
              <svg
                className="w-4 h-4 transform group-open:rotate-180 transition-transform text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l7 7-7 7"
                />
              </svg>
            </summary>

            <div className="p-4 bg-white border-t border-gray-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Add Admin by Email
                  </label>
                  <input
                    type="email"
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
                    className={inputClass}
                  />
                  {admins.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {admins.map((a) => (
                        <span
                          key={a._id}
                          className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium"
                        >
                          {a.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Owner Email{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="For record keeping"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Action Footer */}
          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-all ${
                submitting
                  ? "bg-orange-400 cursor-not-allowed shadow-none"
                  : "bg-[#F5891E] hover:bg-orange-600 active:transform active:scale-[0.99]"
              }`}
            >
              {submitting ? "Creating…" : "Create Business Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MakePool;
