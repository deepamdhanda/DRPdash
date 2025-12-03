import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { ndrReports_url } from "../../URLs/user";
import { NDRReport } from "../../screens/user/NDRReport";

export const getAllNDRReports = async (
  page: number = 1,
  limit: number = 100
) => {
  try {
    const response = await appAxios.get(
      `${ndrReports_url}?page=${page}&limit=${limit}`
    );
    return {
      data: response.data.data as NDRReport[],
      total: response.data.total,
    };
  } catch (error: any) {
    toast.error("Failed to fetch ndrReports.");
    throw error;
  }
};

export const createNDRReport = async (
  data: Omit<NDRReport, "_id" | "created_by" | "status">
) => {
  try {
    const response = await appAxios.post(ndrReports_url, data);
    toast.success("NDRReport created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to create ndrReport.");
    throw error;
  }
};

export const updateNDRReport = async (id: string, data: any) => {
  try {
    const response = await appAxios.patch(`${ndrReports_url}/${id}`, data);
    toast.success("NDRReport updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to update ndrReport.");
    throw error;
  }
};

export const deleteNDRReport = async (id: string) => {
  try {
    await appAxios.delete(`${ndrReports_url}/${id}`);
    toast.success("NDRReport deleted successfully!");
  } catch (error: any) {
    toast.error("Failed to delete ndrReport.");
    throw error;
  }
};
