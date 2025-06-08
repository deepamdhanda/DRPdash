import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { dashboard_url } from "../URLs/dash";

export const getOrdersSummary = async (data: any = {}) => {
  try {
    const response = await appAxios.post(dashboard_url + "/ordersSummary", data);
    return response.data as any[];
  } catch (error: any) {
    toast.error("Failed to fetch Orders Summary.");
    throw error;
  }
};
