import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { scanOrders_url } from "../../URLs/user";
import { ScanOrder } from "../../screens/user/ScanOrders";

export const getAllScanOrders = async (
  page: number = 1,
  limit: number = 100
) => {
  try {
    const response = await appAxios.get(
      `${scanOrders_url}?page=${page}&limit=${limit}`,
      {
        withCredentials: true,
      }
    );
    return {
      data: response.data.data as ScanOrder[],
      total: response.data.total,
    };
  } catch (error: any) {
    toast.error("Failed to fetch pools.");
    throw error;
  }
};

export const createScanOrder = async (data: any) => {
  try {
    // console.log(data)
    // return 0;
    const response = await appAxios.post(scanOrders_url, data);
    toast.success("ScanOrder created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to create scanOrder.");
    throw error;
  }
};

export const updateScanOrder = async (id: string, data: any) => {
  try {
    await appAxios.patch(`${scanOrders_url}/${id}`, data);
    toast.success("ScanOrder updated successfully!");
    return true;
  } catch (error: any) {
    toast.error("Failed to update scanOrder.");
    throw error;
  }
};

export const deleteScanOrder = async (id: string) => {
  try {
    await appAxios.delete(`${scanOrders_url}/${id}`);
    toast.success("ScanOrder deleted successfully!");
  } catch (error: any) {
    toast.error("Failed to delete scanOrder.");
    throw error;
  }
};
