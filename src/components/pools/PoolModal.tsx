import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { createPool, updatePool } from "../../APIs/user/pool";
import { getUser } from "../../APIs/user/user";
import { createAmazonS3 } from "../../APIs/user/amazonS3";
import { getGST } from "../../APIs/user/gst";
import { Pool, User } from "../../screens/user/Pools";

interface PoolModalProps {
  onClose: () => void;
  editingPool: Pool | null;
  onSuccess: () => void;
}

const COMPANY_TYPE_OPTIONS = [
  { value: "llp", label: "LLP" },
  { value: "public_limited_company", label: "Public Limited" },
  { value: "private_limited_company", label: "Private Limited" },
  { value: "partnership", label: "Partnership" },
  { value: "proprietorship", label: "Sole Proprietorship" },
  { value: "individual", label: "Individual" },
];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const validateGSTIN = (gstin: string): boolean => {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    gstin
  );
};

const validateIFSC = (ifsc: string): boolean => {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
};

const PoolModal: React.FC<PoolModalProps> = ({
  onClose,
  editingPool,
  onSuccess,
}) => {
  const [tabKey, setTabKey] = useState("gst");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [owner, setOwner] = useState({ full_name: "", email: "", phone: "" });
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

  useEffect(() => {
    if (editingPool) {
      if (editingPool.gstin) {
        setGst((prev) => ({
          ...prev,
          gstin: editingPool.gstin || "",
          verified: !!editingPool.gstin,
          company_type: editingPool.company_type || "",
          business_name: editingPool.name || "",
          address: editingPool.address || "",
          state: editingPool.state || "",
        }));
      }
      setBusinessDetails({
        name: editingPool.name || "",
        logo: editingPool.business_logo || null,
        website: editingPool.website || "",
      });
      setCompanyType(editingPool.company_type || "individual");
      setOwner({
        full_name: editingPool.owner?.full_name || "",
        email: editingPool.owner?.email || "",
        phone: editingPool.owner?.phone || "",
      });
      setBankDetails({
        account_number: editingPool.bank_details?.account_number || "",
        account_number_confirm: editingPool.bank_details?.account_number || "",
        ifsc: editingPool.bank_details?.ifsc || "",
        holder_name: editingPool.bank_details?.holder_name || "",
        cheque: editingPool.bank_details?.cheque || null,
      });
      setAdminList(editingPool.admins || []);
    }
  }, [editingPool]);

  const verifyGst = async () => {
    const gstin = gst.gstin.trim();
    if (!gstin) return toast.warn("Please enter GSTIN");
    if (!validateGSTIN(gstin)) return toast.error("Invalid GSTIN format");

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
      setBusinessDetails((b) => ({ ...b, name: data.business_name || b.name }));
      setCompanyType(normalizedCompanyType || "individual");
      toast.success("GST verified and details autofilled");
    } catch {
      setGst((s) => ({
        ...s,
        loading: false,
        verified: false,
        message: "GST verification failed",
      }));
      toast.error("GST verification failed");
    }
  };

  const handleUserSearch = async (email: string) => {
    if (!email.trim()) return;
    try {
      const user = await getUser(email.trim());
      if (!user || user.length === 0) return toast.warn("User not found");
      if (adminList.some((admin) => admin._id === user[0]._id))
        return toast.info("User already added as admin");
      setAdminList((prev) => [...prev, user[0]]);
      toast.success("User added as admin");
    } catch {
      toast.error("Error searching user");
    }
  };

  const validateForm = (): boolean => {
    if (!businessDetails.name.trim()) {
      toast.error("Business name is required");
      setTabKey("gst");
      return false;
    }
    if (!companyType) {
      toast.error("Company type is required");
      setTabKey("company");
      return false;
    }
    if (!owner.full_name.trim()) {
      toast.error("Owner name is required");
      setTabKey("owner");
      return false;
    }
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
    if (!validateIFSC(bankDetails.ifsc)) {
      toast.error("Invalid IFSC format");
      setTabKey("bank");
      return false;
    }
    if (!kycFiles.pan && !editingPool) {
      toast.error("PAN card is required");
      setTabKey("kyc");
      return false;
    }
    if (!bankDetails.cheque && !editingPool) {
      toast.error("Cancelled cheque required");
      setTabKey("kyc");
      return false;
    }
    if (!agree) {
      toast.error("Please confirm all details are correct");
      setTabKey("review");
      return false;
    }
    return true;
  };

  const transformAndSubmit = async (status: "active" | "draft" = "active") => {
    if (status === "active" && !validateForm()) return;
    setIsSubmitting(true);
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

      if (gst.verified) {
        payload.gstin = gst.gstin;
        payload.address = gst.address;
        payload.state = gst.state;
      }

      if (businessDetails.logo instanceof File) {
        const logoData = await createAmazonS3(
          `logos/${Date.now()}-${businessDetails.logo.name.replace(/ /g, "_")}`,
          await fileToBase64(businessDetails.logo)
        );
        payload.business_logo = logoData.url;
      } else if (typeof businessDetails.logo === "string")
        payload.business_logo = businessDetails.logo;

      if (kycFiles.pan) {
        const val =
          kycFiles.pan instanceof File
            ? (
                await createAmazonS3(
                  `kyc/${Date.now()}-${kycFiles.pan.name.replace(/ /g, "_")}`,
                  await fileToBase64(kycFiles.pan)
                )
              ).url
            : kycFiles.pan;
        payload.kyc_documents.push({
          section: "PAN",
          document_type: "PAN",
          value: val,
          is_optional: false,
        });
      }

      if (bankDetails.cheque) {
        payload.bank_details.cheque =
          bankDetails.cheque instanceof File
            ? (
                await createAmazonS3(
                  `cheques/${Date.now()}-${bankDetails.cheque.name.replace(
                    / /g,
                    "_"
                  )}`,
                  await fileToBase64(bankDetails.cheque)
                )
              ).url
            : bankDetails.cheque;
      }

      editingPool
        ? await updatePool(editingPool._id, payload)
        : await createPool(payload);
      toast.success(
        status === "active" ? "Saved successfully" : "Progress saved"
      );
      onSuccess();
    } catch {
      toast.error("Failed to save pool");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "gst", label: "1. GST" },
    { id: "company", label: "2. Company" },
    { id: "owner", label: "3. Owner" },
    { id: "bank", label: "4. Bank" },
    { id: "kyc", label: "5. KYC" },
    { id: "review", label: "6. Review" },
  ];

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-black">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {editingPool ? "Edit Pool" : "Create New Pool"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabKey(tab.id)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tabKey === tab.id
                  ? "border-blue-600 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={tabKey}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tabKey === "gst" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      GST Verification (Optional)
                    </h3>
                    <label className={labelClass}>GSTIN</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        placeholder="Enter GSTIN"
                        value={gst.gstin}
                        onChange={(e) =>
                          setGst((s) => ({
                            ...s,
                            gstin: e.target.value.toUpperCase(),
                          }))
                        }
                        className={inputClass.replace("mt-1", "")}
                      />
                      <button
                        onClick={verifyGst}
                        disabled={gst.loading}
                        className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-md hover:bg-blue-100 transition-colors border border-blue-200 min-w-[80px]"
                      >
                        {gst.loading ? "..." : "Verify"}
                      </button>
                    </div>
                    {gst.verified && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                        <strong className="block text-green-800">
                          {gst.business_name}
                        </strong>
                        <span className="text-green-600">{gst.address}</span>
                      </div>
                    )}
                    {gst.message && (
                      <p
                        className={`mt-2 text-sm ${
                          gst.verified ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {gst.message}
                      </p>
                    )}
                  </div>
                  <hr className="border-gray-200" />
                  <div>
                    <label className={labelClass}>
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={businessDetails.name}
                      onChange={(e) =>
                        setBusinessDetails({
                          ...businessDetails,
                          name: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="Enter business name"
                      required
                    />
                  </div>
                </div>
              )}

              {tabKey === "company" && (
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Company Information
                  </h3>
                  <div>
                    <label className={labelClass}>
                      Company Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                      disabled={gst.verified}
                      className={inputClass}
                    >
                      <option value="">Select Company Type</option>
                      {COMPANY_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Website</label>
                    <input
                      type="url"
                      value={businessDetails.website}
                      onChange={(e) =>
                        setBusinessDetails({
                          ...businessDetails,
                          website: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Business Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f)
                          setBusinessDetails({ ...businessDetails, logo: f });
                      }}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    />
                    {businessDetails.logo &&
                      typeof businessDetails.logo === "string" && (
                        <img
                          src={businessDetails.logo}
                          alt="Logo"
                          className="mt-3 h-16 w-16 object-contain"
                        />
                      )}
                  </div>
                </div>
              )}

              {/* Add owner, bank, kyc, review tabs with similar Tailwind styling here... */}
              {tabKey === "owner" && (
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Owner / Authorized Person
                  </h3>
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      type="text"
                      value={owner.full_name}
                      onChange={(e) =>
                        setOwner({ ...owner, full_name: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      value={owner.email}
                      onChange={(e) =>
                        setOwner({ ...owner, email: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      type="tel"
                      value={owner.phone}
                      onChange={(e) =>
                        setOwner({ ...owner, phone: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <hr className="border-gray-200" />
                  <div>
                    <label className={labelClass}>Add Admin by Email</label>
                    <input
                      type="email"
                      placeholder="Enter email and press Enter"
                      className={inputClass}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleUserSearch(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {adminList.map((admin) => (
                        <span
                          key={admin._id}
                          onClick={() =>
                            setAdminList(
                              adminList.filter((a) => a._id !== admin._id)
                            )
                          }
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-200"
                        >
                          {admin.name} &times;
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tabKey === "bank" && (
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bank Details
                  </h3>
                  <div>
                    <label className={labelClass}>Account Number *</label>
                    <input
                      type="text"
                      value={bankDetails.account_number}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          account_number: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Confirm Account Number *
                    </label>
                    <input
                      type="text"
                      value={bankDetails.account_number_confirm}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          account_number_confirm: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>IFSC Code *</label>
                      <input
                        type="text"
                        value={bankDetails.ifsc}
                        onChange={(e) =>
                          setBankDetails({
                            ...bankDetails,
                            ifsc: e.target.value.toUpperCase(),
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Account Holder Name *
                      </label>
                      <input
                        type="text"
                        value={bankDetails.holder_name}
                        onChange={(e) =>
                          setBankDetails({
                            ...bankDetails,
                            holder_name: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Cancelled Cheque *</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setBankDetails({ ...bankDetails, cheque: f });
                      }}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    />
                  </div>
                </div>
              )}

              {tabKey === "kyc" && (
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    KYC Documents
                  </h3>
                  <div>
                    <label className={labelClass}>PAN Card *</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setKycFiles({ pan: f });
                      }}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    />
                    {kycFiles.pan && typeof kycFiles.pan === "string" && (
                      <a
                        href={kycFiles.pan}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 text-sm mt-2 block hover:underline"
                      >
                        View Uploaded PAN
                      </a>
                    )}
                  </div>
                </div>
              )}

              {tabKey === "review" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Review & Confirm
                  </h3>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <strong className="block text-gray-700 mb-2">
                        Business Details
                      </strong>
                      <p>Name: {businessDetails.name || "—"}</p>
                      <p>Type: {companyType}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <strong className="block text-gray-700 mb-2">
                        Owner
                      </strong>
                      <p>{owner.full_name || "—"}</p>
                      <p>{owner.email}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium text-sm">
                      I confirm all details are correct and agree to the terms
                    </span>
                  </label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => transformAndSubmit("draft")}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
          >
            Save Progress
          </button>
          <button
            onClick={() => transformAndSubmit("active")}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
          >
            {isSubmitting
              ? "Saving..."
              : editingPool
              ? "Update Pool"
              : "Create Pool"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PoolModal;
