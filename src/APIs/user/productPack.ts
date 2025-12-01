import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { productPacks_url } from "../../URLs/user";
import { ProductPack } from "../../screens/user/ProductPacks";

export const getAllProductPacks = async (
  page: number = 1,
  limit: number = 100
) => {
  try {
    const response = await appAxios.get(
      `${productPacks_url}?page=${page}&limit=${limit}`
    );
    return {
      data: response.data.data as ProductPack[],
      total: response.data.totalRecords,
    };
  } catch (error: any) {
    toast.error("Failed to fetch productPacks.");
    throw error;
  }
};

export const createProductPack = async (
  data: Omit<ProductPack, "_id" | "created_by" | "status">
) => {
  try {
    const response = await appAxios.post(productPacks_url, data);
    toast.success("ProductPack created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to create productPack.");
    throw error;
  }
};

export const updateProductPack = async (id: string, data: any) => {
  try {
    const response = await appAxios.patch(`${productPacks_url}/${id}`, data);
    toast.success("ProductPack updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to update productPack.");
    throw error;
  }
};

export const deleteProductPack = async (id: string) => {
  try {
    await appAxios.delete(`${productPacks_url}/${id}`);
    toast.success("ProductPack deleted successfully!");
  } catch (error: any) {
    toast.error("Failed to delete productPack.");
    throw error;
  }
};
