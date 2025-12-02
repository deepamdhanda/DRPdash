import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { codRemittances_url } from "../../URLs/user";
import { CODRemittance } from "../../screens/user/CODRemittances";

export const getAllCODRemittances = async (
  page: number = 1,
  limit: number = 100
) => {
  try {
    const response = await appAxios.get(
      `${codRemittances_url}?page=${page}&limit=${limit}`
    );
    return {
      data: response.data.data as CODRemittance[],
      total: response.data.totalRecords,
    };
  } catch (error: any) {
    toast.error("Failed to fetch codRemittances.");
    throw error;
  }
};

export const createCODRemittance = async (
  data: Omit<CODRemittance, "_id" | "created_by" | "status">
) => {
  try {
    const response = await appAxios.post(codRemittances_url, data);
    toast.success("CODRemittance created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to create codRemittance.");
    throw error;
  }
};

export const updateCODRemittance = async (id: string, data: any) => {
  try {
    const response = await appAxios.patch(`${codRemittances_url}/${id}`, data);
    toast.success("CODRemittance updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to update codRemittance.");
    throw error;
  }
};

export const deleteCODRemittance = async (id: string) => {
  try {
    await appAxios.delete(`${codRemittances_url}/${id}`);
    toast.success("CODRemittance deleted successfully!");
  } catch (error: any) {
    toast.error("Failed to delete codRemittance.");
    throw error;
  }
};
