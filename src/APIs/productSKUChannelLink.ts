import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { productSKUChannelLinks_url } from "../URLs/dash";
import { ProductChannelLink } from "../screens/dashboard/ChannelSKU";


export const linkProductSkuToChannelAccount = async (data: ProductChannelLink) => {
  try {
    const response = await appAxios.post(`${productSKUChannelLinks_url}/`, data);
    toast.success("Product SKU linked to channel account started!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to link product SKU to channel account.");
    throw error;
  }
}