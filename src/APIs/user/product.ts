import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { products_url } from "../../URLs/user";
import { Product } from "../../screens/user/Products";

export const getAllProducts = async (page: number = 1, limit: number = 100) => {
  try {
    const response = await appAxios.get(
      `${products_url}?page=${page}&limit=${limit}`
    );

    return {
      data: response.data.data as Product[],
      total: response.data.totalRecords, // backend must return this
    };
  } catch (error: any) {
    toast.error("Failed to fetch products.");
    throw error;
  }
};
export const createProduct = async (data: any) => {
  try {
    const response = await appAxios.post(products_url, data);
    toast.success("Product created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to create product.");
    throw error;
  }
};

export const updateProduct = async (id: string, data: any) => {
  try {
    const response = await appAxios.patch(`${products_url}/${id}`, data);
    toast.success("Product updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to update product.");
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await appAxios.delete(`${products_url}/${id}`);
    toast.success("Product deleted successfully!");
  } catch (error: any) {
    toast.error("Failed to delete product.");
    throw error;
  }
};
