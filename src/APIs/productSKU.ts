import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { productSKUs_url } from "../URLs/dash";
import { ProductSKU } from "../screens/dashboard/ProductSKUs";

export const getAllProductSKUs = async () => {
  try {
    const response = await appAxios.get(productSKUs_url);
    return response.data as ProductSKU[];
  } catch (error: any) {
    toast.error("Failed to fetch productSKUs.");
    throw error;
  }
};

export const createProductSKU = async (data: ProductSKU) => {
  try {
    const response = await appAxios.post(productSKUs_url, data);
    toast.success("ProductSKU created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to create productSKU.");
    throw error;
  }
};

export const updateProductSKU = async (id: string, data: ProductSKU) => {
  try {
    const response = await appAxios.patch(`${productSKUs_url}/${id}`, data);
    toast.success("ProductSKU updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to update productSKU.");
    throw error;
  }
};

export const deleteProductSKU = async (id: string) => {
  try {
    await appAxios.delete(`${productSKUs_url}/${id}`);
    toast.success("ProductSKU deleted successfully!");
  } catch (error: any) {
    toast.error("Failed to delete productSKU.");
    throw error;
  }
};
