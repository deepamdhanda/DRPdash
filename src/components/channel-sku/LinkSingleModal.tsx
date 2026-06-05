import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { ProductSKU } from "../../screens/user/ProductSKUs";

import { newProductSKU } from "../../screens/user/ChannelSKU";

interface LinkSingleModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlinkedProduct: newProductSKU;
  productSKUs: ProductSKU[];
  onSuccess: () => void;
  apiLinkFunction: (data: any) => Promise<any>;
}

export const LinkSingleModal: React.FC<LinkSingleModalProps> = ({
  isOpen,
  onClose,
  unlinkedProduct,
  productSKUs,
  onSuccess,
  apiLinkFunction,
}) => {
  const [selectedSkuId, setSelectedSkuId] = useState<string>("");
  const [isLinking, setIsLinking] = useState(false);

  if (!isOpen) return null;

  const handleLinkSubmit = async () => {
    if (!selectedSkuId) {
      toast.error("Please select a Product SKU.");
      return;
    }

    setIsLinking(true);
    try {
      await apiLinkFunction({
        product_sku_id: selectedSkuId,
        channel_account_id: unlinkedProduct.channel_account_id,
        variant_id: unlinkedProduct.variant_id || null,
        price: unlinkedProduct.price || 0,
      });
      toast.success("SKU Linked Successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error linking", error);
      toast.error("Failed to link SKU.");
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-black">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Link Product SKU</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800">
              Linking <strong>{unlinkedProduct.product_name}</strong> to an
              existing SKU.
            </p>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Product SKU
          </label>
          <select
            value={selectedSkuId}
            onChange={(e) => setSelectedSkuId(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
          >
            <option value="">Select a Product SKU</option>
            {productSKUs.map((sku) => (
              <option key={sku._id} value={sku._id}>
                {sku.product_sku_name} (ID: {sku.product_sku_id || "N/A"})
              </option>
            ))}
          </select>
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleLinkSubmit}
            disabled={isLinking}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 shadow-sm"
          >
            {isLinking ? "Linking..." : "Link SKU"}
          </button>
        </div>
      </div>
    </div>
  );
};
