import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { productSKUChannelLinks_url } from "../../URLs/user";
import { ProductChannelLink } from "../../screens/user/ChannelSKU";

export const linkProductSkuToChannelAccount = async (
  data: ProductChannelLink
) => {
  try {
    const response = await appAxios.post(
      `${productSKUChannelLinks_url}/`,
      data
    );
    toast.success("Product SKU linked to channel account started!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to link product SKU to channel account.");
    throw error;
  }
};

export const getUnlinkedProductSku = async (
  page: number = 1,
  limit: number = 100
) => {
  try {
    const response = await appAxios.get(
      `${productSKUChannelLinks_url}/?page=${page}&limit=${limit}`
    );
    return { data: response.data.data, total: response.data.total };
  } catch (error: any) {
    toast.error("Failed to fetch Product SKU.");
    throw error;
  }
};

export const postNewProduct = async (formdata: any) => {
  try {
    formdata.productSKU.product_description = " ";
    const response = await appAxios.post(
      `${productSKUChannelLinks_url}/newproduct`,
      formdata
    );
    return response.data;
  } catch (err) {
    toast.error("Failed to fetch Product SKU.");
    throw err;
  }
};
