import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { productSKUs_url } from "../../URLs/user";
import { ProductSKU } from "../../screens/user/ProductSKUs";

export const getAllProductSKUs = async (
  page: number = 1,
  limit: number = 100
) => {
  try {
    const response = await appAxios.get(
      `${productSKUs_url}?page=${page}&limit=${limit}`
    );

    return {
      data: response.data.data, // array of SKUs
      total: response.data.totalRecords, // pagination count
    };
  } catch (error: any) {
    toast.error("Failed to fetch product SKUs.");
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

export const updateProductSKU = async (id: string, data: any) => {
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
