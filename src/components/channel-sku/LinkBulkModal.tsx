import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { ProductSKU } from "../../screens/user/ProductSKUs";
import { ChannelAccount } from "../../screens/user/ChannelAccounts";

interface LinkBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSKUs: ProductSKU[];
  channelAccounts: ChannelAccount[];
  onSuccess: () => void;
  apiLinkFunction: (data: any) => Promise<any>;
}

export const LinkBulkModal: React.FC<LinkBulkModalProps> = ({
  isOpen,
  onClose,
  productSKUs,
  channelAccounts,
  onSuccess,
  apiLinkFunction,
}) => {
  const [selectedProductSKUs, setSelectedProductSKUs] = useState<string[]>([]);
  const [selectedChannelAccounts, setSelectedChannelAccounts] = useState<
    string[]
  >([]);
  const [skuPrices, setSkuPrices] = useState<{ [key: string]: number }>({});
  const [isLinking, setIsLinking] = useState(false);

  if (!isOpen) return null;

  const handleProductSelect = (skuId: string) => {
    setSelectedProductSKUs((prev) =>
      prev.includes(skuId)
        ? prev.filter((id) => id !== skuId)
        : [...prev, skuId]
    );
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelAccounts((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handlePriceChange = (skuId: string, price: string) => {
    setSkuPrices((prev) => ({ ...prev, [skuId]: Number(price) }));
  };

  const handleLinkSubmit = async () => {
    if (
      selectedProductSKUs.length === 0 ||
      selectedChannelAccounts.length === 0
    ) {
      toast.error(
        "Please select at least one Product SKU and one Channel Account."
      );
      return;
    }

    for (const skuId of selectedProductSKUs) {
      const productPrice = skuPrices[skuId];
      if (!productPrice || productPrice <= 0) {
        toast.error(`Please enter a valid price for the selected SKU.`);
        return;
      }
    }

    setIsLinking(true);
    try {
      for (const skuId of selectedProductSKUs) {
        for (const channelId of selectedChannelAccounts) {
          await apiLinkFunction({
            product_sku_id: skuId,
            channel_account_id: channelId,
            variant_id: null,
            price: skuPrices[skuId] || 0,
          });
        }
      }
      toast.success("Product SKUs linked to Channel Accounts successfully!");
      onSuccess();
    } catch (error) {
      console.error("Link error", error);
      toast.error("Failed to link Product SKUs to Channel Accounts.");
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-black">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            Link Product SKUs in Bulk
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Step 1: Select SKUs */}
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-4">
              🧾 Step 1: Select Product SKUs & Set Price
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-1">
              {productSKUs.map((sku) => {
                const isSelected = selectedProductSKUs.includes(sku._id!);
                return (
                  <div
                    key={sku._id}
                    onClick={() => sku._id && handleProductSelect(sku._id)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={sku.product_sku_image}
                        alt={sku.product_sku_name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {sku.product_sku_name}
                        </h4>
                        <p className="text-xs text-gray-500 font-mono">
                          ID: {sku.product_sku_id || "N/A"}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="text-blue-600 bg-white rounded-full p-1 shadow-sm">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div
                        className="mt-3 pt-3 border-t border-blue-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Enter Price (INR)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          value={sku._id ? skuPrices[sku._id] || "" : ""}
                          placeholder="e.g. 299"
                          onChange={(e) =>
                            sku._id &&
                            handlePriceChange(sku._id, e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Channels */}
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-4">
              📦 Step 2: Select Channel Accounts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[250px] overflow-y-auto p-1">
              {channelAccounts.map((channel) => {
                const isSelected = selectedChannelAccounts.includes(
                  channel._id!
                );
                return (
                  <div
                    key={channel._id}
                    onClick={() =>
                      channel._id && handleChannelSelect(channel._id)
                    }
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {channel.channel_account_name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Pool: {channel.pool_id?.name || "N/A"}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="text-blue-600 bg-white rounded-full p-1 shadow-sm">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleLinkSubmit}
            disabled={isLinking}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all shadow-md"
          >
            {isLinking ? "Linking..." : "Link Selected SKUs"}
          </button>
        </div>
      </div>
    </div>
  );
};
